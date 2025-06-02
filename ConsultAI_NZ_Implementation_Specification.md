# ConsultAI NZ Implementation Specification

## Overview

ConsultAI NZ is an AI-powered medical consultation platform specifically designed for New Zealand healthcare professionals. The application provides real-time transcription, AI-generated clinical notes, and customisable templates to streamline GP consultation workflows.

## Architecture

### Technology Stack

- **Framework**: Next.js 15.3.1 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5.6.2
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **UI Framework**: Tailwind CSS 3.4.1 + shadcn/ui
- **AI Services**: OpenAI GPT-4 and o4-mini
- **Speech-to-Text**: Deepgram Nova-3 (NZ English)
- **State Management**: React Context API
- **Deployment**: Vercel-ready configuration

### Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── consultation/       # Main consultation interface
│   ├── templates/          # Template management
│   ├── api/               # API routes
│   └── (auth)/            # Authentication pages
├── src/
│   ├── features/          # Feature-based modules
│   │   ├── consultation/  # Consultation functionality
│   │   ├── templates/     # Template management
│   │   └── roadmap/       # Feature roadmap
│   ├── shared/            # Shared components and utilities
│   │   ├── components/    # Reusable UI components
│   │   ├── types/         # TypeScript definitions
│   │   └── services/      # Shared services
│   └── lib/               # Utility functions
├── database/              # Database schema and migrations
│   ├── schema/            # Drizzle schema definitions
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## Core Features

### 1. Consultation Interface

The main consultation page (`/consultation`) provides a comprehensive interface for conducting and documenting medical consultations.

#### Key Components:
- **Template Selection**: Choose from default or custom templates
- **Input Mode Toggle**: Switch between audio transcription and typed input
- **Transcription Controls**: Real-time audio recording and transcription
- **Quick Notes**: Add structured notes during consultation
- **AI Note Generation**: Generate formatted clinical notes using AI
- **Chatbot Widget**: Context-aware clinical assistant

#### Input Modes:
- **Audio Mode**: Real-time transcription with Deepgram
- **Typed Mode**: Direct text input for consultation notes

### 2. Template Management

Templates define the structure and format for AI-generated clinical notes.

#### Template Types:
- **Default Templates**: System-provided templates (e.g., Multi-problem SOAP)
- **Custom Templates**: User-created templates (requires authentication)

#### Template Structure:
```typescript
type Template = {
  id: string;
  name: string;
  description?: string;
  type: 'default' | 'custom';
  ownerId?: string;
  prompts: {
    prompt: string;
    example?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};
```

### 3. AI-Powered Note Generation

The system uses OpenAI models to generate structured clinical notes based on consultation transcripts and templates.

#### Process Flow:
1. User selects template and input mode
2. Consultation data is captured (audio transcription or typed input)
3. Quick notes are added as needed
4. AI generates structured notes using template prompts
5. Notes are streamed back to the user interface

#### AI Models:
- **Note Generation**: OpenAI o4-mini with streaming
- **Clinical Chat**: GPT-4 for clinical reasoning and advice

### 4. Real-time Transcription

Deepgram Nova-3 provides accurate speech-to-text conversion optimised for New Zealand English.

#### Features:
- Real-time transcription with live updates
- PII redaction for privacy
- Punctuation and smart formatting
- Paragraph detection

### 5. Clinical Chatbot

Context-aware AI assistant specifically designed for New Zealand GPs.

#### Capabilities:
- Evidence-based clinical guidance
- New Zealand healthcare guidelines integration
- Consultation context awareness
- Concise, actionable responses

## Data Models

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### Templates Table
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('default', 'custom')),
  owner_id TEXT REFERENCES users(id),
  prompts JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### User Settings Table
```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  settings JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### State Management

The application uses React Context for global state management through `ConsultationContext`.

#### Consultation State:
```typescript
type ConsultationState = {
  sessionId: string;
  templateId: string;
  status: 'idle' | 'recording' | 'processing' | 'completed';
  inputMode: 'audio' | 'typed';
  transcription: {
    transcript: string;
    isLive: boolean;
  };
  typedInput: string;
  quickNotes: string[];
  generatedNotes: string | null;
  error: string | null;
  userDefaultTemplateId: string | null;
  consentObtained: boolean;
  chatHistory: ChatMessage[];
  isChatContextEnabled: boolean;
  isChatLoading: boolean;
};
```

## API Endpoints

### Consultation APIs

#### POST `/api/consultation/notes`
Generates AI-powered clinical notes based on consultation data.

**Request Body:**
```json
{
  "transcription": "string",
  "typedInput": "string",
  "templateId": "string",
  "quickNotes": ["string"],
  "inputMode": "audio" | "typed"
}
```

**Response:** Streaming text response with generated notes

#### POST `/api/consultation/chat`
Provides clinical AI assistance with optional consultation context.

**Request Body:**
```json
{
  "messages": [{"role": "user", "content": "string"}],
  "consultationNote": "string",
  "useContext": boolean
}
```

**Response:** Streaming text response with AI advice

### Transcription APIs

#### POST `/api/deepgram/transcribe`
Transcribes audio files using Deepgram.

**Request:** Multipart form data with audio file
**Response:**
```json
{
  "transcript": "string",
  "paragraphs": [],
  "metadata": {}
}
```

### Template APIs

#### GET `/api/templates`
Retrieves available templates (public access for default templates).

#### POST `/api/templates`
Creates a new custom template (requires authentication).

#### PUT `/api/templates/[id]`
Updates an existing template (requires authentication and ownership).

#### DELETE `/api/templates/[id]`
Deletes a template (requires authentication and ownership).

## Authentication & Authorisation

### Clerk Integration

The application uses Clerk for user authentication and management.

#### Configuration:
- **Provider**: ClerkProvider wraps the entire application
- **Middleware**: Protects template management routes
- **Public Access**: Consultation features available without authentication
- **Protected Features**: Custom template creation and management

#### Route Protection:
```typescript
// middleware.ts
export default clerkMiddleware(async (auth, req) => {
  // Allow GET requests to templates for everyone
  if (req.method === 'GET' && req.nextUrl.pathname.startsWith('/api/templates')) {
    return NextResponse.next();
  }

  // Protect template modification routes
  if (req.nextUrl.pathname.startsWith('/api/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return resolvedAuth.redirectToSignIn();
    }
  }

  return NextResponse.next();
});
```

## UI Framework & Design System

### Tailwind CSS Configuration

The application uses a custom Tailwind configuration with CSS variables for theming.

#### Key Features:
- **Design Tokens**: CSS custom properties for colours and spacing
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Class-based dark mode support
- **Component Variants**: Using `class-variance-authority`

### shadcn/ui Components

The UI is built using shadcn/ui components for consistency and accessibility.

#### Available Components:
- **Form Controls**: Button, Input, Textarea, Select, Checkbox, Switch
- **Layout**: Card, Dialog, Dropdown Menu, Tabs
- **Feedback**: Alert, Toast notifications
- **Navigation**: Scroll Area, Separator

#### Component Configuration:
```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/lib/utils"
  }
}
```

## External Integrations

### OpenAI Integration

#### Models Used:
- **o4-mini**: For note generation (cost-effective, fast)
- **GPT-4**: For clinical chatbot (higher reasoning capability)

#### Configuration:
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

#### Prompt Engineering:
- **System Prompt**: Defines AI behaviour for NZ healthcare context
- **Template Prompts**: User-defined structures for note generation
- **Context Integration**: Consultation notes provide context for chatbot

### Deepgram Integration

#### Configuration:
```typescript
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Transcription settings
{
  model: 'nova-3',
  punctuate: true,
  language: 'en-NZ',
  smart_format: true,
  redaction: { type: 'pii' },
  diarize: false,
  paragraphs: true,
  utterances: false
}
```

### Database Integration

#### Neon PostgreSQL:
- **Connection**: Serverless PostgreSQL via `@neondatabase/serverless`
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Automated schema management

#### Configuration:
```typescript
// database/client.ts
export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

## Configuration & Environment

### Environment Variables

#### Required Variables:
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI Services
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...

# Optional
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Build Configuration

#### Next.js Configuration:
```javascript
// next.config.mjs
const nextConfig = {
  eslint: { dirs: ['.'] },
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite'],
};
```

#### TypeScript Configuration:
- **Strict Mode**: Enabled with comprehensive type checking
- **Path Aliases**: `@/*` for clean imports
- **Module Resolution**: Bundler mode for optimal performance

## Development Setup

### Prerequisites

- **Node.js**: Version 18+ recommended
- **PostgreSQL**: Database instance (Neon recommended)
- **API Keys**: OpenAI, Deepgram, Clerk accounts

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd consultai-nz
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure environment variables
   ```

4. **Database Setup**
   ```bash
   npm run db:generate  # Generate migrations
   npm run db:push      # Apply schema
   npm run db:seed-templates  # Seed default templates
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```

### Available Scripts

```json
{
  "dev": "run-p dev:*",
  "dev:next": "next dev",
  "dev:spotlight": "spotlight-sidecar",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "test": "vitest run",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "db:seed-templates": "tsx database/seed-templates.ts"
}
```

### Development Tools

- **ESLint**: Code linting with Antfu config
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality assurance
- **Vitest**: Unit testing framework
- **Drizzle Studio**: Database management interface

## Deployment

### Vercel Deployment

The application is optimised for Vercel deployment with automatic CI/CD.

#### Configuration:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables**: Configure in Vercel dashboard
- **Database**: Neon PostgreSQL (serverless-compatible)

#### Production Considerations:
- **Environment Variables**: Ensure all required variables are set
- **Database Migrations**: Run migrations before deployment
- **API Rate Limits**: Configure appropriate limits for OpenAI/Deepgram
- **Error Monitoring**: Consider integrating error tracking

### Performance Optimisations

- **Bundle Analysis**: Available via `npm run build-stats`
- **Image Optimisation**: Next.js automatic image optimisation
- **Code Splitting**: Automatic route-based splitting
- **Streaming**: AI responses use streaming for better UX

## Security Considerations

### Data Protection

- **PII Redaction**: Deepgram automatically redacts personally identifiable information
- **Authentication**: Clerk provides secure user authentication
- **API Security**: Rate limiting and input validation on all endpoints
- **Database Security**: Parameterised queries prevent SQL injection

### Privacy Compliance

- **Data Minimisation**: Only necessary data is stored
- **User Consent**: Consent modal for data processing
- **Data Retention**: Consider implementing data retention policies
- **Audit Logging**: Track user actions for compliance

## Testing Strategy

### Unit Testing

- **Framework**: Vitest with React Testing Library
- **Coverage**: Configured with V8 coverage provider
- **Setup**: `vitest-setup.ts` for test environment configuration

### Integration Testing

- **API Testing**: Test API endpoints with mock data
- **Database Testing**: Test database operations with test database
- **Component Testing**: Test React components in isolation

### End-to-End Testing

- **Playwright**: Configured for E2E testing
- **User Flows**: Test complete consultation workflows
- **Cross-browser**: Ensure compatibility across browsers

## Monitoring & Analytics

### Error Tracking

- **Console Logging**: Comprehensive error logging
- **API Error Handling**: Structured error responses
- **Client-side Errors**: React error boundaries

### Performance Monitoring

- **Core Web Vitals**: Monitor loading performance
- **API Response Times**: Track backend performance
- **User Experience**: Monitor consultation completion rates

## Future Enhancements

### Planned Features

- **Voice Commands**: Voice-activated controls during consultation
- **Template Sharing**: Share templates between users
- **Advanced Analytics**: Consultation insights and reporting
- **Mobile App**: React Native mobile application
- **Offline Support**: Offline-first consultation capabilities

### Technical Improvements

- **Structured Output**: JSON-formatted AI responses
- **Real-time Collaboration**: Multi-user consultation support
- **Advanced Search**: Full-text search across templates and notes
- **API Versioning**: Versioned API endpoints for backward compatibility
- **Microservices**: Split into focused microservices for scalability

## Support & Maintenance

### Documentation

- **API Documentation**: OpenAPI/Swagger documentation
- **Component Storybook**: UI component documentation
- **User Guides**: End-user documentation for GPs
- **Developer Onboarding**: Comprehensive setup guides

### Maintenance Tasks

- **Dependency Updates**: Regular security and feature updates
- **Database Maintenance**: Regular backups and optimisation
- **Performance Monitoring**: Continuous performance assessment
- **User Feedback**: Regular collection and implementation of user feedback

---

This specification provides a comprehensive overview of the ConsultAI NZ application architecture, features, and implementation details. It serves as a reference for development teams, stakeholders, and future maintainers of the system.
