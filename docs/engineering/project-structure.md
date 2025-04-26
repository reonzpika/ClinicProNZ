# Project Structure

## Overview
This document outlines the project structure for ConsultAI NZ, following Next.js best practices while maintaining a feature-based organization. The structure is designed to support the single-page consultation flow while ensuring proper separation of concerns and maintainability.

## Project Structure
```
/
├── app/                    # App Router directory
│   ├── page.tsx           # Single consultation page
│   ├── layout.tsx         # Root layout
│   ├── (auth)/            # Auth routes group
│   │   ├── login/        # Login page
│   │   └── register/     # Register page
│   │
│   └── api/               # Backend API routes (Next.js API routes)
│       ├── auth/          # Authentication endpoints
│       │   ├── session/   # Session management
│       │   └── user/      # User management
│       ├── consultation/  # Consultation endpoints
│       │   ├── transcription/ # Transcription endpoints
│       │   └── notes/         # Notes endpoints
│       └── templates/     # Template endpoints (for custom templates only)
│
├── src/                   # Source directory
│   ├── features/         # Feature-specific code
│   │   ├── consultation/
│   │   │   ├── components/     # Consultation components
│   │   │   │   ├── TemplateSelection.tsx    # Template selector
│   │   │   │   │   ├── DefaultTemplates.tsx # Default templates (hardcoded)
│   │   │   │   │   └── CustomTemplates.tsx  # Custom templates (from API)
│   │   │   │   ├── TranscriptionSection.tsx # Transcription controls and monitor
│   │   │   │   ├── QuickNotes.tsx           # Quick notes component
│   │   │   │   ├── NotesSection.tsx         # Notes generation and display
│   │   │   │   ├── ErrorBoundary.tsx        # Error boundary component
│   │   │   │   └── ErrorDisplay.tsx         # Error display component
│   │   │   │
│   │   │   ├── hooks/         # Consultation hooks
│   │   │   │   ├── useConsultation.ts       # Main consultation state
│   │   │   │   ├── useAudio.ts              # Audio handling
│   │   │   │   ├── useTranscription.ts      # Transcription handling
│   │   │   │   └── useNotes.ts              # Notes generation and display
│   │   │   │
│   │   │   └── utils/         # Consultation utilities
│   │   │
│   │   ├── templates/
│   │   │   ├── components/    # Template components
│   │   │   │   ├── TemplateSelector.tsx     # Template selection dropdown
│   │   │   │   ├── TemplatePreview.tsx      # Template preview
│   │   │   │   ├── TemplateEditor.tsx       # Template editor (auth required)
│   │   │   │   └── TemplateManager.tsx      # Template management (auth required)
│   │   │   │
│   │   │   ├── hooks/        # Template hooks
│   │   │   │   ├── useTemplates.ts          # Template management hook
│   │   │   │   └── useTemplateAuth.ts       # Template auth hook
│   │   │   │
│   │   │   ├── utils/        # Template utilities
│   │   │   │   └── validation.ts            # Template validation utilities
│   │   │   └── data/         # Template data
│   │   │       └── default-templates.ts     # Hardcoded default templates
│   │   │
│   └── shared/             # Shared code
│       ├── components/     # Reusable components
│       ├── hooks/         # Reusable hooks
│       └── services/      # API services and utilities
│           ├── api/       # API client and utilities
│           │   ├── client.ts               # API client configuration
│           │   ├── error-handling.ts       # Error handling utilities
│           │   └── types.ts                # API types
│           ├── auth/      # Auth services
│           │   ├── session.ts              # Session management
│           │   └── validation.ts           # Auth validation
│           └── validation/# Validation utilities
│
├── public/                # Static assets
├── styles/               # Global styles
├── types/                # Global TypeScript types
│   ├── consultation.ts   # Consultation types
│   ├── templates.ts      # Template types
│   ├── auth.ts           # Auth types
│   └── api.ts            # API types
├── config/               # Configuration files
├── tests/                # Test files
└── docs/                 # Documentation
```

## Directory Details

### 1. App Router (`app/`)
- Single consultation page design
- Authentication routes
- API routes for:
  - Authentication
  - Consultation
  - Custom templates

### 2. Source Directory (`src/`)
- Feature-based organization
- Shared components and utilities
- API services and hooks

### 3. Feature Organization
- Consultation feature
- Template management
- Authentication
- Shared utilities

## Key Design Decisions

### 1. Template Management
- Default templates: Hardcoded in frontend
- Custom templates: Database-backed with API endpoints
- Clear separation between public and private templates

### 2. API Organization
- Backend routes in `app/api/`
- Frontend services in `src/shared/services/`
- Clear separation of concerns

### 3. State Management
- Feature-specific state in feature hooks
- Shared state in shared hooks
- Clear state boundaries

## Related Documents
- [API Specification](./api-specification.md)
- [State Management](./state-management.md)
- [Template System](./template-prompt-system.md)
- [Data Flow](./data-flow.md)
