# MVP Feature Specification Document

## 1. Interactive Examination Checklist

### Overview

A structured modal-based component to enable GPs to quickly insert high-quality, interpretable examination findings into the consultation note.

### UI/UX Design

* **Trigger**: Accessible via a button near the “Additional Notes” box or via `Ctrl + E` keyboard shortcut.
* **Layout**: Modal with a list of common examination types on the left and their checklists on the right.

### Navigation Logic

* **Up/Down Arrows**: Navigate through the list of examination types (e.g. Resp, Cardio, Abdo, etc.).
* **Right Arrow / Enter**: Opens the checklist for the selected examination type.
* **Left Arrow**: Goes back to the main menu of examination types.
* **Within Checklist**:

  * Use **Up/Down Arrows** to navigate individual checklist items.
  * Use **Enter** to tick/untick a checkbox.
  * Use **Shift + Enter** or click **"Add to Note"** button to insert the currently selected checklist as a formatted paragraph into the "Additional Notes".
* **All Normal Button**: Ticks all items within the selected checklist.

### Data Handling

* All selections are saved temporarily within the modal until explicitly added to the note.

---

## 2. Plan & Safety-Netting Panel

### Overview

A dedicated checklist-based modal that allows GPs to add structured entries related to clinical planning and patient safety-netting steps.

### UI/UX Design

* **Trigger**: Button located near or below the Additional Notes section.
* **Layout**: Modal containing grouped items under headings like:

  * Management (e.g. "Provided self-care advice", "Discussed red flags")
  * Follow-up (e.g. "F/U in 2 weeks", "Routine review scheduled")
  * Safety-netting (e.g. "Advised to represent if symptoms worsen")

### Interaction

* GP selects multiple applicable checklist items.
* All selected items are previewed in a text field before insertion.
* Text is editable pre-insert.
* Single button to **Insert All to Notes** or keyboard shortcut to confirm.

---

## 3. Quick Access Panel

### Overview

A persistent component on the **left column** of the consultation panel that provides fast access to personalised commonly used checklists and planning/safety-netting entries.

### Features

* **Exam Shortcuts**: Shows a list of frequently used examination types or checklists. Clicking reveals saved checklist items or opens full checklist view.
* **Plan/Safety-Netting Shortcuts**: Shows commonly used plan entries.
* **Add All as Normal**: Option next to each section to tick all checklist items as normal.
* **Personalisation**:

  * GPs can pin certain checklists or entries to appear in the Quick Access panel.
  * Data is saved on Neon DB for long-term user-specific customisation.

---

## Future Agent Integration

* Data from these checklists will be made available to orchestration agents via Neon DB.
* If no Plan section is detected in the transcript, the system will proactively prompt the GP with the Plan/Safety-Netting modal.

---

Ready for UI prototyping and frontend implementation.
