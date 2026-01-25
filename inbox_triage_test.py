import argparse
import json
import os
import random
import re
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple


# ----------------------------
# Configuration defaults
# ----------------------------

DEFAULT_MODEL = "claude-sonnet-4-20250514"
DEFAULT_MAX_TOKENS = 2000

# Pricing used for feasibility; override if needed.
# Sonnet pricing (as provided in task):
# - $3/MTok input
# - $15/MTok output
DEFAULT_INPUT_COST_PER_MTOK_USD = 3.0
DEFAULT_OUTPUT_COST_PER_MTOK_USD = 15.0


TRIAGE_PROMPT = """You are an AI clinical triage assistant for a New Zealand general practice.

Your task is to analyse inbox items and provide:
1. URGENCY classification: HIGH (requires same-day action), ROUTINE (1-3 days), or FYI (information only)
2. CONFIDENCE score: 0.0-1.0 indicating your certainty
3. KEY FINDINGS: 1-2 sentence clinical summary
4. RECOMMENDED ACTION: Specific next steps for the GP

Inbox Item:
{content}

Patient Context:
{patient_context}

Respond ONLY with valid JSON in this exact format:
{{
  "urgency": "HIGH|ROUTINE|FYI",
  "confidence": 0.0-1.0,
  "key_findings": "Brief clinical summary",
  "recommended_action": "Specific next steps"
}}"""


ALLOWED_URGENCY = {"HIGH", "ROUTINE", "FYI"}


class TriageParseError(Exception):
    pass


def _extract_json_object(text: str) -> Dict[str, Any]:
    """
    Extract a JSON object from model output.

    Handles:
    - bare JSON
    - ```json ... ```
    - ``` ... ```
    - extra leading/trailing text (attempts to locate first {...} block)
    """

    t = text.strip()
    if not t:
        raise TriageParseError("Empty model response text")

    # Strip code fences if present.
    if "```" in t:
        # Prefer explicit json fence.
        m = re.search(r"```json\s*([\s\S]*?)\s*```", t, flags=re.IGNORECASE)
        if m:
            t = m.group(1).strip()
        else:
            m2 = re.search(r"```\s*([\s\S]*?)\s*```", t)
            if m2:
                t = m2.group(1).strip()

    # If still not an object, try to find the first {...} span.
    if not t.startswith("{"):
        m3 = re.search(r"\{[\s\S]*\}", t)
        if m3:
            t = m3.group(0).strip()

    try:
        parsed = json.loads(t)
    except json.JSONDecodeError as e:
        raise TriageParseError(f"Could not parse JSON: {e}") from e

    if not isinstance(parsed, dict):
        raise TriageParseError(f"Expected JSON object, got {type(parsed).__name__}")

    return parsed


def _validate_model_response(d: Dict[str, Any]) -> Dict[str, Any]:
    missing = [k for k in ("urgency", "confidence", "key_findings", "recommended_action") if k not in d]
    if missing:
        raise TriageParseError(f"Missing keys in response JSON: {missing}")

    urgency = str(d["urgency"]).strip().upper()
    if urgency not in ALLOWED_URGENCY:
        raise TriageParseError(f"Invalid urgency '{d['urgency']}'")

    try:
        confidence = float(d["confidence"])
    except Exception as e:
        raise TriageParseError("confidence must be a number") from e

    if not (0.0 <= confidence <= 1.0):
        raise TriageParseError(f"confidence out of range: {confidence}")

    key_findings = str(d["key_findings"]).strip()
    recommended_action = str(d["recommended_action"]).strip()
    if not key_findings:
        raise TriageParseError("key_findings is empty")
    if not recommended_action:
        raise TriageParseError("recommended_action is empty")

    return {
        "urgency": urgency,
        "confidence": confidence,
        "key_findings": key_findings,
        "recommended_action": recommended_action,
    }


@dataclass
class CallResult:
    response: Dict[str, Any]
    cost_usd: float
    latency_sec: float
    input_tokens: int
    output_tokens: int


def call_claude(
    *,
    content: str,
    patient_context: str,
    model: str,
    max_tokens: int,
    temperature: float,
    input_cost_per_mtok_usd: float,
    output_cost_per_mtok_usd: float,
    max_retries: int = 3,
    retry_backoff_base_sec: float = 1.5,
) -> CallResult:
    """
    Call Claude API and return parsed + validated JSON response with cost and latency.
    """

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY environment variable not set")

    # Lazy import so `--dry-run` can run without anthropic installed.
    import anthropic  # type: ignore

    client = anthropic.Anthropic(api_key=api_key)

    prompt = TRIAGE_PROMPT.format(content=content, patient_context=patient_context)

    last_err: Optional[Exception] = None
    for attempt in range(1, max_retries + 1):
        start_time = time.time()
        try:
            message = client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
            )
            latency = time.time() - start_time

            # Extract text content.
            response_text = ""
            if getattr(message, "content", None) and len(message.content) > 0:
                # anthropic SDK returns list of content blocks.
                response_text = getattr(message.content[0], "text", "") or ""

            parsed = _extract_json_object(response_text)
            validated = _validate_model_response(parsed)

            usage = getattr(message, "usage", None)
            input_tokens = int(getattr(usage, "input_tokens", 0) or 0)
            output_tokens = int(getattr(usage, "output_tokens", 0) or 0)

            cost_usd = (input_tokens * input_cost_per_mtok_usd / 1_000_000) + (
                output_tokens * output_cost_per_mtok_usd / 1_000_000
            )

            return CallResult(
                response=validated,
                cost_usd=cost_usd,
                latency_sec=latency,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            )
        except Exception as e:
            last_err = e
            if attempt >= max_retries:
                break
            sleep_for = retry_backoff_base_sec ** (attempt - 1)
            time.sleep(sleep_for)

    raise RuntimeError(f"Claude call failed after {max_retries} attempts: {last_err}")


def _validate_dataset_schema(cases: List[Dict[str, Any]]) -> None:
    required = {
        "id",
        "item_type",
        "content",
        "patient_context",
        "ground_truth_urgency",
        "ground_truth_reasoning",
        "ground_truth_action",
    }
    for idx, c in enumerate(cases):
        if not isinstance(c, dict):
            raise ValueError(f"Case at index {idx} is not an object")
        missing = required - set(c.keys())
        if missing:
            raise ValueError(f"Case id={c.get('id')} missing keys: {sorted(missing)}")
        gt = str(c["ground_truth_urgency"]).strip().upper()
        if gt not in ALLOWED_URGENCY:
            raise ValueError(f"Case id={c.get('id')} has invalid ground_truth_urgency: {c['ground_truth_urgency']}")


def evaluate_results(
    *,
    test_cases: List[Dict[str, Any]],
    model: str,
    max_tokens: int,
    temperature: float,
    input_cost_per_mtok_usd: float,
    output_cost_per_mtok_usd: float,
    dry_run: bool,
    max_cases: Optional[int],
    seed: int,
) -> Dict[str, Any]:
    results: List[Dict[str, Any]] = []
    total_cost = 0.0
    total_latency = 0.0
    total_input_tokens = 0
    total_output_tokens = 0

    correct = 0
    high_urgency_cases: List[int] = []
    high_urgency_detected = 0

    cases = list(test_cases)
    random.Random(seed).shuffle(cases)
    if max_cases is not None:
        cases = cases[: max_cases]

    for i, case in enumerate(cases):
        case_id = int(case["id"])
        print(f"\n[{i+1}/{len(cases)}] Processing case {case_id} ({case['item_type']})...")

        actual_urgency = str(case["ground_truth_urgency"]).strip().upper()

        if dry_run:
            # Deterministic placeholder response for validation of pipeline only.
            response = {
                "urgency": "FYI",
                "confidence": 0.0,
                "key_findings": "DRY RUN: No model call made.",
                "recommended_action": "DRY RUN: Set ANTHROPIC_API_KEY and rerun without --dry-run.",
            }
            cost = 0.0
            latency = 0.0
            input_tokens = 0
            output_tokens = 0
        else:
            try:
                call_res = call_claude(
                    content=case["content"],
                    patient_context=case["patient_context"],
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    input_cost_per_mtok_usd=input_cost_per_mtok_usd,
                    output_cost_per_mtok_usd=output_cost_per_mtok_usd,
                )
                response = call_res.response
                cost = call_res.cost_usd
                latency = call_res.latency_sec
                input_tokens = call_res.input_tokens
                output_tokens = call_res.output_tokens
            except Exception as e:
                print(f"ERROR on case {case_id}: {e}")
                results.append({"case_id": case_id, "error": str(e)})
                continue

        predicted_urgency = str(response["urgency"]).strip().upper()
        is_correct = predicted_urgency == actual_urgency
        if is_correct:
            correct += 1

        if actual_urgency == "HIGH":
            high_urgency_cases.append(case_id)
            if predicted_urgency == "HIGH":
                high_urgency_detected += 1

        results.append(
            {
                "case_id": case_id,
                "item_type": case["item_type"],
                "actual_urgency": actual_urgency,
                "predicted_urgency": predicted_urgency,
                "confidence": response["confidence"],
                "correct": is_correct,
                "cost_usd": cost,
                "latency_sec": latency,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "ai_findings": response["key_findings"],
                "ai_action": response["recommended_action"],
                "ground_truth_action": case["ground_truth_action"],
            }
        )

        total_cost += cost
        total_latency += latency
        total_input_tokens += input_tokens
        total_output_tokens += output_tokens

    num_valid = len([r for r in results if "correct" in r])
    overall_accuracy = correct / num_valid if num_valid > 0 else 0.0
    high_urgency_sensitivity = (
        high_urgency_detected / len(high_urgency_cases) if len(high_urgency_cases) > 0 else 0.0
    )
    avg_cost = total_cost / num_valid if num_valid > 0 else 0.0
    avg_latency = total_latency / num_valid if num_valid > 0 else 0.0

    # Per-item-type accuracy for quick error pattern scan.
    per_type: Dict[str, Dict[str, Any]] = {}
    for r in results:
        if "correct" not in r:
            continue
        t = r["item_type"]
        if t not in per_type:
            per_type[t] = {"n": 0, "correct": 0}
        per_type[t]["n"] += 1
        if r["correct"]:
            per_type[t]["correct"] += 1
    per_type_accuracy = {
        t: (v["correct"] / v["n"] if v["n"] else 0.0) for t, v in per_type.items()
    }

    summary = {
        "timestamp": datetime.now().isoformat(),
        "model": model,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "dry_run": dry_run,
        "total_cases": len(cases),
        "valid_results": num_valid,
        "overall_accuracy": overall_accuracy,
        "high_urgency_sensitivity": high_urgency_sensitivity,
        "high_urgency_cases": len(high_urgency_cases),
        "high_urgency_detected": high_urgency_detected,
        "total_cost_usd": total_cost,
        "avg_cost_per_item_usd": avg_cost,
        "avg_latency_sec": avg_latency,
        "total_input_tokens": total_input_tokens,
        "total_output_tokens": total_output_tokens,
        "pricing": {
            "input_cost_per_mtok_usd": input_cost_per_mtok_usd,
            "output_cost_per_mtok_usd": output_cost_per_mtok_usd,
        },
        "per_item_type_accuracy": per_type_accuracy,
        "targets": {
            "accuracy": 0.90,
            "high_sensitivity": 0.99,
            "avg_cost_usd": 0.01,
        },
        "cost_constraint_met": avg_cost <= 0.01,
        "accuracy_target_met": overall_accuracy >= 0.90,
        "sensitivity_target_met": high_urgency_sensitivity >= 0.99,
    }

    return {"summary": summary, "detailed_results": results}


def main() -> None:
    parser = argparse.ArgumentParser(description="GP inbox triage feasibility test harness")
    parser.add_argument("--dataset", default="test_dataset.json", help="Path to dataset JSON")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Anthropic model name")
    parser.add_argument("--max-tokens", type=int, default=DEFAULT_MAX_TOKENS)
    parser.add_argument("--temperature", type=float, default=0.0)
    parser.add_argument("--max-cases", type=int, default=None, help="Limit number of cases for quick test")
    parser.add_argument("--seed", type=int, default=42, help="Shuffle seed for case order")
    parser.add_argument("--dry-run", action="store_true", help="Do not call API; validate pipeline only")
    parser.add_argument("--output-dir", default=".", help="Where to write results JSON")
    parser.add_argument("--input-cost-per-mtok-usd", type=float, default=DEFAULT_INPUT_COST_PER_MTOK_USD)
    parser.add_argument("--output-cost-per-mtok-usd", type=float, default=DEFAULT_OUTPUT_COST_PER_MTOK_USD)
    args = parser.parse_args()

    with open(args.dataset, "r", encoding="utf-8") as f:
        test_cases = json.load(f)
    if not isinstance(test_cases, list):
        raise ValueError("Dataset JSON must be a list of cases")

    _validate_dataset_schema(test_cases)

    print(f"Loaded {len(test_cases)} test cases from {args.dataset}")
    print(f"Model: {args.model}")
    print(f"Dry run: {args.dry_run}")
    print("=" * 60)

    evaluation = evaluate_results(
        test_cases=test_cases,
        model=args.model,
        max_tokens=args.max_tokens,
        temperature=args.temperature,
        input_cost_per_mtok_usd=args.input_cost_per_mtok_usd,
        output_cost_per_mtok_usd=args.output_cost_per_mtok_usd,
        dry_run=args.dry_run,
        max_cases=args.max_cases,
        seed=args.seed,
    )

    os.makedirs(args.output_dir, exist_ok=True)
    output_file = os.path.join(
        args.output_dir, f"triage_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    )
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(evaluation, f, indent=2, ensure_ascii=False)

    summary = evaluation["summary"]
    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    print(f"Overall Accuracy: {summary['overall_accuracy']:.1%}")
    print(f"  Target: ≥90% {'✓' if summary['accuracy_target_met'] else '✗'}")
    print(f"\nHIGH Urgency Sensitivity: {summary['high_urgency_sensitivity']:.1%}")
    print(f"  Target: ≥99% {'✓' if summary['sensitivity_target_met'] else '✗'}")
    print(f"  Cases: {summary['high_urgency_detected']}/{summary['high_urgency_cases']} detected")
    print(f"\nAverage Cost: ${summary['avg_cost_per_item_usd']:.4f} per item")
    print(f"  Target: <$0.01 {'✓' if summary['cost_constraint_met'] else '✗'}")
    print(f"\nAverage Latency: {summary['avg_latency_sec']:.2f} seconds")
    print(f"\nTotal Cost: ${summary['total_cost_usd']:.2f}")
    print(f"Results saved to: {output_file}")

    failures = [r for r in evaluation["detailed_results"] if "correct" in r and not r["correct"]]
    if failures:
        print(f"\n{len(failures)} INCORRECT CLASSIFICATIONS (showing up to 5):")
        for f in failures[:5]:
            print(
                f"  - Case {f['case_id']}: Predicted {f['predicted_urgency']}, Actually {f['actual_urgency']}"
            )

    print("=" * 60)


if __name__ == "__main__":
    main()
