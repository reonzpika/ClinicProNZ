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
        GP->>UI: Add Quick Notes (Local)
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
    TemplateService->>ChatGPT: Send Transcription + Template Prompt
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
