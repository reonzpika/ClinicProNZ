# Project Structure Guidelines

## Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (consultation)/        # Main consultation workflow
│   │   ├── layout.tsx         # Consultation layout with providers
│   │   ├── page.tsx           # Main consultation interface
│   │   └── loading.tsx        # Consultation loading state
│   │
│   ├── (dashboard)/          # Healthcare professional dashboard
│   │   ├── layout.tsx        # Dashboard layout
│   │   ├── page.tsx          # Overview and quick actions
│   │   └── templates/        # Template management
│   │       ├── page.tsx      # Template list
│   │       └── [id]/         # Template editing
│   │           └── page.tsx
│   │
│   ├── api/                  # API Route Handlers
│   │   ├── consultation/     # Consultation related endpoints
│   │   │   ├── transcribe/
│   │   │   │   └── route.ts  # POST /api/consultation/transcribe
│   │   │   ├── notes/
│   │   │   │   ├── route.ts  # POST /api/consultation/notes
│   │   │   │   └── generate/
│   │   │   │       └── route.ts
│   │   │   └── session/
│   │   │       └── route.ts  # Consultation session management
│   │   │
│   │   └── templates/       # Template management
│   │       ├── route.ts     # Template CRUD
│   │       └── [id]/
│   │           └── route.ts
│   │
│   ├── auth/                # Authentication (Clerk)
│   │   └── [...clerk]/
│   │
│   ├── layout.tsx           # Root layout
│   └── error.tsx            # Global error handling
│
├── components/
│   ├── consultation/        # Main consultation components
│   │   ├── TranscriptionPanel/
│   │   │   ├── index.tsx    # Real-time transcription
│   │   │   ├── Controls.tsx # Recording controls
│   │   │   └── Display.tsx  # Transcription display
│   │   │
│   │   ├── QuickNotes.tsx  # Simple quick notes component
│   │   │
│   │   ├── NotesPanel/
│   │   │   ├── index.tsx    # Final notes interface
│   │   │   ├── Editor.tsx   # Note editing
│   │   │   └── Preview.tsx  # Note preview
│   │   │
│   │   └── TemplatePanel/
│   │       ├── index.tsx    # Template selection
│   │       ├── TemplateSelector.tsx  # Template selection UI
│   │       ├── TemplatePreview.tsx   # Template structure preview
│   │       └── QuickInsert.tsx
│   │
│   ├── dashboard/          # Dashboard components
│   │   ├── RecentConsultations.tsx
│   │   ├── TemplateManager/
│   │   │   ├── index.tsx    # Template management interface
│   │   │   ├── TemplateEditor.tsx  # Template structure editor
│   │   │   ├── TemplateList.tsx    # List of available templates
│   │   │   └── TemplatePreview.tsx # Template preview
│   │   └── Stats.tsx
│   │
│   └── ui/                # Shared UI components
│       ├── Button/
│       ├── Input/
│       └── Modal/
│
├── lib/                   # Core business logic
│   ├── consultation/      # Consultation services
│   │   ├── transcription.ts
│   │   ├── quick-notes.ts # Quick notes logic
│   │   ├── notes.ts
│   │   └── templates/
│   │       ├── index.ts   # Template service
│   │       ├── types.ts   # Template types
│   │       ├── prompt.ts  # Prompt generation
│   │       └── validation.ts  # Template validation
│   │
│   ├── medical/          # Medical-specific utilities
│   │   ├── terminology.ts
│   │   └── validation.ts
│   │
│   └── utils/           # General utilities
│       ├── format.ts
│       └── validation.ts
│
├── hooks/               # React hooks
│   ├── consultation/   # Consultation-specific hooks
│   │   ├── useTranscription.ts
│   │   ├── useQuickNotes.ts  # Simple quick notes state
│   │   ├── useNotes.ts
│   │   └── useTemplates/
│   │       ├── index.ts      # Template hooks
│   │       ├── useTemplateSelection.ts
│   │       ├── useTemplateEditor.ts
│   │       └── usePromptGeneration.ts
│   │
│   └── common/        # Shared hooks
│       ├── useDebounce.ts
│       └── useLocalStorage.ts
│
├── types/             # TypeScript types
│   ├── consultation.ts
│   ├── medical.ts
│   ├── templates.ts   # Template-related types
│   └── common.ts
│
└── styles/           # Styling
    └── globals.css   # Global styles with Tailwind
```

## Feature-Specific Organization

### 1. Medical Context
- Separate medical-specific logic
- Terminology handling
- Healthcare validation rules

### 2. Consultation Flow
- Clear component hierarchy
- Intuitive data flow
- Real-time updates

### 3. Template System
- Template Structure:
  - JSON-based template definitions
  - Section types (text/array)
  - Required/optional sections
- Template Management:
  - Default templates
  - Custom templates
  - Template validation
- Prompt Generation:
  - Template to prompt conversion
  - Section formatting
  - AI instruction generation

## Performance Considerations

### 1. Real-time Features
- Optimized transcription
- Efficient state updates
- Background processing

### 2. Resource Management
- Audio handling
- Memory optimization
- Network efficiency
