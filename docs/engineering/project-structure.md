# Project Structure

## Overview
This document outlines the project structure for ConsultAI NZ, following Next.js best practices while maintaining a feature-based organization. The structure is designed to support the single-page consultation flow while ensuring proper separation of concerns and maintainability.

## Next.js App Router Implementation (Next.js 15.3)

### Server vs Client Components

In Next.js 15.3, all components are Server Components by default. This architecture enables:
- Automatic code splitting and bundle optimization
- Server-side rendering with streaming
- Reduced client-side JavaScript
- Enhanced security for sensitive data

To mark a component as a Client Component, add the `'use client'` directive at the top of the file:

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### When to Use Each Type

#### Server Components (Default)
Use when the component:
- Needs direct database access
- Uses sensitive environment variables
- Performs heavy data fetching
- Doesn't require client-side interactivity
- Uses server-only packages

#### Client Components
Use when the component needs:
- Interactivity and event listeners
- Browser APIs or window object
- React hooks (useState, useEffect, etc.)
- Client-side state management
- Client-specific libraries

### Implementation Guidelines

1. Start with Server Components by default
2. Move to Client Components only when needed for interactivity
3. Keep Client Components small and focused
4. Use composition to minimize client-side JavaScript
5. Leverage the new Client Instrumentation Hook for analytics
6. Utilize improved Navigation Hooks for routing control


```

### Performance Optimizations

Next.js 15.3 introduces several performance improvements:
- Turbopack for faster builds (alpha)
- Enhanced TypeScript plugin performance
- Improved caching and bundling
- Optional Rspack integration for better Webpack compatibility

### Best Practices

1. **Code Organization**
   - Group related components by feature
   - Separate server and client code clearly
   - Use the new navigation hooks for better routing control

2. **Data Fetching**
   - Prefer Server Components for data fetching
   - Use React Suspense for loading states
   - Implement proper error boundaries

3. **Performance**
   - Enable Turbopack for development
   - Implement proper code splitting
   - Use Image and Link components for optimizations

4. **Type Safety**
   - Leverage improved TypeScript support
   - Use strict type checking
   - Implement proper error handling

## Project Structure
```
/
├── app/                    # Next.js App Router (page routing and API endpoints)
│   ├── (auth)/            # Auth routes (grouped for better organization)
│   │   ├── login/        # Login page
│   │   └── register/     # Register page
│   │
│   ├── api/              # API routes (Next.js API endpoints)
│   │   ├── auth/        # Authentication endpoints
│   │   ├── templates/   # Template management endpoints
│   │   └── notes/       # Note generation endpoints
│   │
│   ├── layout.tsx       # Root layout (shared across all pages)
│   ├── middleware.ts    # Auth middleware (Clerk integration)
│   └── page.tsx         # Main consultation page
│
├── src/                  # Source code (application logic)
│   ├── features/         # Feature-specific code (business logic)
│   │   ├── consultation/ # Consultation feature
│   │   │   ├── components/  # Consultation-specific components
│   │   │   ├── hooks/       # Consultation-specific hooks
│   │   │   └── utils/       # Consultation utilities
│   │   │
│   │   └── templates/    # Templates feature
│   │       ├── components/  # Template-specific components
│   │       ├── hooks/       # Template-specific hooks
│   │       └── utils/       # Template utilities
│   │
│   ├── shared/          # Shared code (reusable across features)
│   │   ├── components/  # Reusable UI components (e.g., buttons, inputs)
│   │   │
│   │   ├── hooks/       # Reusable React hooks
│   │   │   ├── useAuth.ts        # Authentication hook
│   │   │   ├── useTemplates.ts   # Template management hook
│   │   │   └── useTranscription.ts # Transcription hook
│   │   │
│   │   ├── services/    # Service implementations (external integrations)
│   │   │   ├── api/     # API client (fetch wrapper, error handling)
│   │   │   ├── auth/    # Auth service (Clerk integration)
│   │   │   ├── database/# Database service (Drizzle ORM)
│   │   │   ├── error/   # Error handling service
│   │   │   ├── notes/   # Note generation service (OpenAI)
│   │   │   ├── templates/# Template service
│   │   │   ├── transcription/ # Transcription service (Deepgram)
│   │   │   └── validation/   # Validation utilities
│   │   │
│   │   └── types/       # Application-specific type definitions
│   │       ├── api.ts   # API request/response types
│   │       ├── auth.ts  # Authentication types (Clerk)
│   │       ├── templates.ts # Template and section types
│   │       └── performance.ts # Performance metrics types
│   │
│   └── __tests__/       # Test files
│       ├── features/    # Feature-specific tests
│       └── shared/      # Shared code tests
│
├── database/            # Database related
│   ├── schema/         # Database schemas (Drizzle ORM)
│   │   ├── index.ts    # Schema exports
│   │   ├── templates.ts # Templates table schema
│   │   └── users.ts    # Users table schema
│   │
│   └── migrations/     # Database migrations
│
├── docs/               # Documentation
│   ├── engineering/   # Technical documentation
│   │   ├── api-specification.md    # API documentation
│   │   ├── data-flow.md            # Data flow documentation
│   │   ├── state-management.md     # State management docs
│   │   └── tech-stack.md           # Technology stack docs
│   │
│   ├── project/       # Project documentation
│   └── uiux/          # UI/UX documentation
│
├── public/            # Static assets (images, fonts)
├── styles/           # Global styles (Tailwind config)
│
├── types/            # Global type definitions (framework/library types)
│   ├── drizzle.d.ts  # Drizzle ORM type extensions
│   │   # Extends drizzle-kit module types
│   │   # Defines configuration types for database
│   │
│   └── next-env.d.ts # Next.js environment types
│       # Generated by Next.js
│       # Defines global types for Next.js
│
├── .github/          # GitHub configuration
│   ├── workflows/    # GitHub Actions workflows
│   └── ISSUE_TEMPLATE/ # Issue templates
│
├── .husky/          # Git hooks
├── .vercel/         # Vercel deployment config
├── .vscode/         # VS Code settings
│
├── package.json     # Project dependencies
├── tsconfig.json   # TypeScript configuration
├── next.config.mjs # Next.js configuration
├── drizzle.config.ts # Drizzle ORM configuration
├── tsconfig.json      # TypeScript configuration
├── components.json    # Shadcn UI components configuration
├── lint-staged.config.js # Lint staged configuration
├── commitlint.config.ts  # Commit lint configuration
├── codecov.yml        # Code coverage configuration
└── crowdin.yml        # Crowdin configuration

# Hidden directories (not shown in tree)
.git/                    # Git repository
.cursor/                # Cursor IDE configuration
.husky/                 # Git hooks
.vscode/                # VS Code configuration
.github/                # GitHub configuration
.vercel/                # Vercel configuration
node_modules/           # Node modules
```

## Directory Details

### 1. App Router (`app/`)
- Single consultation page design
- Authentication routes
- Middleware configuration
  - Route protection
  - Authentication rules
  - Public/private route management
- API routes for:
  - Authentication
  - Consultation
  - Custom templates

### 2. Source Directory (`src/`)
- Feature-based organization
  - `consultation/`: Core consultation functionality
  - `templates/`: Template management system
- Shared components and utilities
- API services and hooks
- Transcription service
  - Deepgram integration
  - Privacy features
  - Performance monitoring
  - Error handling

### 3. Configuration Files
- Root level configuration files:
  - `eslint.config.mjs`: ESLint configuration
  - `vitest-setup.ts`: Vitest setup configuration
  - `vitest.config.mts`: Vitest configuration
- `config/` directory:
  - Build tool configurations
  - Framework configurations
  - Integration configurations

### 4. Documentation Directory (`docs/`)
- `engineering/`: Technical documentation
  - API specifications
  - Data flow documentation
  - Testing guidelines
  - Technical architecture
- `project/`: Project documentation
  - Current tasks
  - Future plans
  - Project vision
- `uiux/`: UI/UX documentation
  - Wireframes
  - User flows
  - Design notes

### 5. Types Directory (`types/`)
- Global type definitions
- Framework type definitions
- Third-party library type definitions

### 6. Hidden Directories
- Git and IDE configurations
- Build and dependency directories
- Deployment configurations

## Key Design Decisions

### 1. Configuration Organization
- Core testing and linting configurations at root level for better visibility
- Framework and integration configurations in `config/` directory
- Type definitions centralized in `types/` directory
- Documentation organized in `docs/` directory with clear categorization

### 2. Build and Output Directories
- Build output in `out/` directory
- Database migrations in `migrations/` directory
- Node modules in `node_modules/` directory

### 3. Documentation Structure
- Clear separation between technical, project, and UI/UX documentation
- Easy navigation through categorized documentation
- Consistent documentation format across categories

## Related Documents
- [API Specification](./api-specification.md)
- [State Management](./state-management.md)
- [Template System](./template-prompt-system.md)
- [Data Flow](./data-flow.md)
- [Testing Guidelines](./testing-guidelines.md)
