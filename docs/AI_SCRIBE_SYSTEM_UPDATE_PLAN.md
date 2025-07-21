
# ✅ AI Scribe System Architecture — Updated (21 July 2025)

## 🎯 Goal

Generate accurate, concise, clinically factual consultation notes tailored to NZ general practice — with minimal editing required by the GP.

---

## 🧱 System Overview

### 🔹 Inputs

* `TRANSCRIPTION`: Raw ambient speech converted to text via Deepgram Nova-3.
* `TYPED INPUT`: Structured notes manually typed by GP during consultation.
* `ADDITIONAL NOTES`: Optional summary or context added by GP post-consultation.
* `TEMPLATE`: Custom user-defined note structure using `[placeholders]`, `(instructions)`, and headings.

---

### 🔹 Output

* Fully filled draft consultation note in clinical language.
* Embedded QA Checklist verifying accuracy (Omission, Hallucination, Uncertainty).
* Editable in-app by GP before saving/exporting.

---

## 📤 Transcript Pre-processing Pipeline (Before LLM Calls)

| Step                            | Description                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| **1. VAD (optional)**           | Use Silero VAD to trim non-speech segments if needed.                                   |
| **2. Regex Cleanup**            | Strip disfluencies (e.g. “um”, “like”), filler words, repeated words, extra whitespace. |
| **3. (Future)**                 | Optional lightweight disfluency model for better cleaning.                              |
| **4. Prepare Structured Input** | Format input with section headers: `--- TRANSCRIPTION ---`, `--- TYPED INPUT ---`, etc. |

---

## 🧠 Multi-Stage Note Generation (LLM Pipeline)

### **Stage 1: Transcript Structuring**

**Goal**: Clean and group transcript into logically ordered blocks by presenting problem.

| Input        | Cleaned transcript                                                 |
| ------------ | ------------------------------------------------------------------ |
| Output       | Problem-organised structured transcript                            |
| Model        | GPT‑4o‑mini or higher                                              |
| Prompt style | Fact-only, no inference, group by topic, retain all information    |
| Notes        | Enforces logical coherence and prepares input for template filling |

---

### **Stage 2: Template Filling**

**Goal**: Populate GP’s custom template with structured clinical content.

| Input        | Structured transcript + template                                                                |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Output       | Full consultation note draft                                                                    |
| Model        | GPT‑4o‑mini or higher                                                                           |
| Prompt style | Map each topic to relevant template section; use clinical language; do not hallucinate or infer |
| Notes        | Template headings and placeholders must always be AI-friendly                                   |

---

### **Stage 3: QA Checklist**

**Goal**: Validate draft note accuracy vs original consultation data.

| Input        | Structured transcript + AI-generated note                                        |
| ------------ | -------------------------------------------------------------------------------- |
| Output       | Checklist with flags: Omission, Hallucination, Uncertain                         |
| Model        | GPT‑4o‑mini or higher                                                            |
| Prompt style | Only flag issues; do not revise the note                                         |
| Notes        | Optional: link checklist items to specific sections in note (future improvement) |

---

## 🖥️ UI Logic

* GPs trigger note generation manually by clicking `Generate Note`.
* System shows progress through stages (Stage 1 → Stage 2 → Stage 3).
* Final draft and QA checklist are shown together in editor.

---

## 🔄 Post-Consultation Features

* GP edits note directly in-app or copy-pastes to PMS.
* Post-edit vs. pre-edit note pairs can be logged for future fine-tuning/training.
* GPs can reuse the same template across sessions (with personalisation).

---

## 🔧 Model & Ops Considerations

* Current model: GPT‑4o‑mini
* Open to switching to GPT‑4o or GPT‑4 if quality demands.
* Can call API multiple times per consultation.
* Latency (\~10s total) acceptable at current usage.
