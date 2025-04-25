# Logic Flows

This document outlines the core system interactions and data flows in ConsultAI NZ. It focuses on how different components interact during a consultation session.

> Note: For detailed template structure, see [template-prompt-system.md](./template-prompt-system.md). For state management details, see [state-management.md](./state-management.md).

## Main Consultation Flow

```mermaid
sequenceDiagram
    participant GP
    participant UI
    participant Deepgram
    participant ChatGPT
    participant State
    participant TemplateService

    GP->>UI: Start Consultation
    activate UI
    UI->>State: Initialize Session (status: idle)
    UI->>TemplateService: Load Default Template
    TemplateService->>State: Set Template ID
    UI->>State: Update Status (recording)
    UI->>Deepgram: Start Recording

    loop Real-time Processing
        Deepgram->>UI: Update Live Transcript
        UI->>State: Update Transcription
        GP->>UI: Add Quick Note
        UI->>UI: Update Quick Notes (Local Component State)
        GP->>UI: Change Template
        UI->>TemplateService: Get Template Details
        TemplateService->>State: Update Template ID
    end

    alt Stop Recording
        GP->>UI: Stop Recording
        UI->>Deepgram: End Stream
    else Generate Notes Button
        GP->>UI: Click Generate Notes
    end

    UI->>State: Update Status (processing)
    UI->>TemplateService: Get Template Prompt
    TemplateService->>ChatGPT: Send Transcription + Template + Quick Notes
    ChatGPT->>ChatGPT: Process Template Sections
    ChatGPT->>ChatGPT: Generate Structured Notes
    alt Success
        ChatGPT->>UI: Display Generated Notes (completed)
        GP->>UI: Review/Edit
    else Error
        ChatGPT->>UI: Display Error
        UI->>State: Set Error State
    end
    deactivate UI
```

## Template Section Processing

```mermaid
sequenceDiagram
    participant ChatGPT
    participant Template
    participant Transcription
    participant QuickNotes

    ChatGPT->>Template: Get Section Structure
    Template->>ChatGPT: Return Sections
    loop For Each Section
        ChatGPT->>Transcription: Extract Relevant Content
        ChatGPT->>QuickNotes: Check for Additional Info (Local State Only)
        ChatGPT->>ChatGPT: Format Section Content
    end
    ChatGPT->>ChatGPT: Combine Sections
    ChatGPT->>ChatGPT: Apply Final Formatting
```

## Error Recovery Flow

```mermaid
sequenceDiagram
    participant GP
    participant UI
    participant State
    participant API

    alt Network Error
        UI->>State: Set Error State
        State->>UI: Show Error Message
        GP->>UI: Retry Action
        UI->>API: Retry Request (max 3)
    else API Error
        UI->>State: Set Error State
        State->>UI: Show Error Message
        GP->>UI: Take Corrective Action
    else Session Error
        UI->>State: Recover from localStorage
        State->>UI: Restore Session
    end
```
