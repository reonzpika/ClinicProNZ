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
│   │       └── QuickInsert.tsx
│   │
│   ├── dashboard/          # Dashboard components
│   │   ├── RecentConsultations.tsx
│   │   ├── TemplateManager.tsx
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
│   │   └── templates.ts
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
│   │   └── useTemplates.ts
│   │
│   └── common/        # Shared hooks
│       ├── useDebounce.ts
│       └── useLocalStorage.ts
│
├── types/             # TypeScript types
│   ├── consultation.ts
│   ├── medical.ts
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

### 3. Template Management
- Easy template access
- Quick template insertion
- Context-aware suggestions

## Performance Considerations

### 1. Real-time Features
- Optimized transcription
- Efficient state updates
- Background processing

### 2. Resource Management
- Audio handling
- Memory optimization
- Network efficiency
