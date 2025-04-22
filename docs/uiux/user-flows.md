# User Flows

This document outlines the key user journeys and interactions in ConsultAI NZ from a GP's perspective. It focuses on the real-world clinical workflow and how the platform supports it.

## Consultation Journey

### 1. Starting a Consultation

**User Actions**:
1. Open consultation page
2. Multi-problem SOAP template loaded by default
3. (Optional) Select different template
4. Start recording
5. Begin patient interaction

**System Response**:
- Loads default Multi-problem SOAP template
- Updates template if different one selected
- Initializes transcription
- Shows real-time transcription

### 2. During Consultation

**User Actions**:
1. Conduct patient interview
2. Ask relevant questions
3. Make clinical observations
4. Add quick notes as needed
5. Monitor transcription accuracy

**System Response**:
- Updates transcription in real-time
- Displays quick notes in dedicated section
```

### 3. Note Generation

**User Actions**:
1. Complete history taking
2. Click "Generate Note" button or stop recording
3. Review AI-generated notes
4. Edit if needed

**System Response**:
- Processes transcription and quick notes
- Applies selected template structure
- Generates comprehensive clinical notes via ChatGPT
- Displays generated note for review and editing

**Generation Options**:
- Generate while recording continues
- Generate after stopping recording
- Regenerate with modifications

### 4. Finishing Consultation

**User Actions**:
1. Review final notes
2. Copy generated notes
3. Switch to patient management software (PMS)
4. Paste notes into PMS record
5. Clear/restart session

**System Response**:
- Provides formatted notes optimized for copying
- Maintains session until explicitly cleared
- Confirms before clearing session data
- Resets all components for new consultation when cleared

**Session Management**:
- Clear all transcription data
- Reset template selection
- Clear quick notes
- Remove generated notes
- Return to default template state
- Option to recover last session if accidentally cleared
