import argparse
import json
from datetime import datetime
from typing import Any, Dict, List


def _pct(x: float) -> str:
    return f"{x*100:.1f}%"


def _usd(x: float) -> str:
    return f"${x:.4f}"


def load_results(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict) or "summary" not in data or "detailed_results" not in data:
        raise ValueError("Input does not look like a triage_test_results_*.json file")
    return data


def build_one_page_summary(results: Dict[str, Any]) -> str:
    s = results["summary"]
    model = s.get("model", "unknown-model")
    ts = s.get("timestamp") or datetime.now().isoformat()

    accuracy = float(s.get("overall_accuracy", 0.0))
    sens = float(s.get("high_urgency_sensitivity", 0.0))
    avg_cost = float(s.get("avg_cost_per_item_usd", 0.0))
    avg_latency = float(s.get("avg_latency_sec", 0.0))

    acc_met = bool(s.get("accuracy_target_met", False))
    sens_met = bool(s.get("sensitivity_target_met", False))
    cost_met = bool(s.get("cost_constraint_met", False))

    total_cases = int(s.get("total_cases", 0))
    valid_cases = int(s.get("valid_results", 0))
    high_cases = int(s.get("high_urgency_cases", 0))
    high_detected = int(s.get("high_urgency_detected", 0))

    # Failure snippets for appendix
    failures: List[Dict[str, Any]] = [
        r for r in results.get("detailed_results", []) if isinstance(r, dict) and r.get("correct") is False
    ]

    failure_lines = ""
    if failures:
        top = failures[:6]
        lines = [
            f"- Case {f.get('case_id')}: predicted {f.get('predicted_urgency')}, actual {f.get('actual_urgency')}"
            for f in top
        ]
        failure_lines = "\n".join(lines)

    interpretation = (
        "Initial performance is encouraging but falls short of clinical-grade requirements, confirming the need for systematic R&D investigation."
        if (accuracy >= 0.75 or sens >= 0.85)
        else "These preliminary results highlight the magnitude of the challenge and the genuine uncertainty about technical feasibility."
    )

    return "\n".join(
        [
            "## Preliminary Feasibility Assessment",
            "",
            f"To validate that our performance targets are plausible but not trivial, we conducted a baseline test using **{model}** on **{total_cases}** synthetic GP inbox items (valid results: {valid_cases}).",
            "",
            "- **Overall accuracy**: " + _pct(accuracy) + f" (target ≥90% {'met' if acc_met else 'not met'})",
            "- **HIGH-urgency sensitivity**: "
            + _pct(sens)
            + f" (target ≥99% {'met' if sens_met else 'not met'}; detected {high_detected}/{high_cases})",
            "- **Average inference cost**: " + _usd(avg_cost) + f" per item (target <$0.01 {'met' if cost_met else 'not met'})",
            "- **Average latency**: " + f"{avg_latency:.2f}s per item",
            "",
            interpretation,
            "",
            "### Notes",
            f"- **Run timestamp**: {ts}",
            "- **Dataset**: Synthetic items only; results do not include any patient-identifiable data.",
            "- **Safety metric**: HIGH-urgency sensitivity is the primary safety-critical metric.",
            "",
            "### Quick error sample (first few incorrect classifications)",
            (failure_lines if failure_lines else "- No misclassifications in this run (or dry-run mode)."),
            "",
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Summarise triage test results for grant appendix")
    parser.add_argument("results_json", help="Path to triage_test_results_*.json")
    parser.add_argument("--out", default=None, help="Write summary markdown to this path")
    args = parser.parse_args()

    results = load_results(args.results_json)
    md = build_one_page_summary(results)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(md)
        print(f"Wrote summary to {args.out}")
    else:
        print(md)


if __name__ == "__main__":
    main()
