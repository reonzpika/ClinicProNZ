# API Specification

## Overview
This document outlines the API endpoints for ConsultAI NZ MVP implementation.

## Design Decisions

### 1. API Structure
- REST endpoints for control operations
- WebSocket for real-time transcription
- Simple request/response format
- See [Data Flow](./data-flow.md#data-flow) for implementation details

### 2. Session Management
- Session ID required for all endpoints
- Used for API usage tracking and rate limiting
- See [State Management](./state-management.md#core-state-structure) for state handling

#### Session Types
1. **Logged-in Users**:
   - Session ID associated with user account
   - Persisted across devices
   - Used for template management and customization
   - Expires after 24 hours of inactivity

2. **Non-logged-in Users**:
   - Temporary session ID generated on first visit
   - Stored in localStorage only
   - Limited to default templates
   - Expires after 24 hours of inactivity

### 3. Validation Approach
- Essential validations only for MVP
- Focus on data integrity
- See [Template System](./template-prompt-system.md#validation-rules) for validation rules

## API Routes
All API endpoints are Next.js API routes located in the `/api` directory. For example:
- Template endpoints: `/api/templates`
- Transcription endpoints: `/api/transcription`
- Note generation endpoints: `/api/notes`

## Authentication

### External Service Authentication
// API keys for external services (Deepgram, ChatGPT) are stored in `.env.local` and used server-side only.
// This ensures API keys are never exposed to the client.

### Internal API Authentication
// For client-side requests to our API endpoints:

1. **Logged-in Users**:
   // Use Clerk session token in the header for authenticated requests
   ```
   Authorization: Bearer <clerk_session_token>
   ```

2. **Non-logged-in Users**:
   // Use a temporary session ID for anonymous users
   ```
   X-Session-ID: <temporary_session_id>
   ```
   // Session ID is stored in localStorage
   // Expires after 24 hours of inactivity
   // Used for usage tracking and rate limiting

## Validation Rules

### 1. Request Validation
```typescript
type RequestValidation = {
  // Session validation
  sessionRules: {
    required: true;
    format: /^[a-zA-Z0-9-_]{20,}$/; // Minimum 20 characters
    maxAge: 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  };

  // Template validation
  templateRules: {
    requiredFields: ['id', 'name', 'type', 'sections', 'prompts'];
    sectionRules: {
      minSections: 1;
      maxSections: 20;
      validTypes: ['text', 'array'];
    };
  };

  // Content validation
  contentRules: {
    transcription: {
      minLength: 10;
      maxLength: 10000;
      required: true;
    };
    quickNotes: {
      maxNotes: 20;
      maxLength: 200;
    };
  };
};
```

### 2. Response Validation
```typescript
type ResponseValidation = {
  // Error response validation
  errorRules: {
    requiredFields: ['code', 'message'];
    validCodes: [
      'INVALID_API_KEY',
      'INVALID_TEMPLATE',
      'INVALID_SESSION',
      'TRANSCRIPTION_ERROR',
      'GENERATION_ERROR'
    ];
  };

  // Success response validation
  successRules: {
    requiredFields: ['status'];
    validStatus: ['success'];
  };
};
```

## Endpoints

### 1. Templates

#### Get Templates
// Returns all available templates for the current user
// For non-logged-in users, returns only default templates
// For logged-in users, returns both default and custom templates
```
GET /api/templates
```
Response:
```typescript
{
  templates: {
    id: string;
    name: string;
    type: 'default' | 'custom';
    sections: {
      name: string;
      type: 'text' | 'array';
      required: boolean;
      description: string;
      prompt: string;
    }[];
  }[];
}
```

#### Get Template by ID
// Returns a specific template by its ID
// Access control: Default templates are public, custom templates only accessible to owner
```
GET /api/templates/:id
```
Response:
```typescript
{
  id: string;
  name: string;
  type: 'default' | 'custom';
  sections: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    prompt: string;
  }[];
}
```

#### Create Template (Logged-in Users Only)
// Creates a new custom template
// Requires authentication
// Validates template structure before saving
```
POST /api/templates
```
Request:
```typescript
{
  name: string;
  sections: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    prompt: string;
  }[];
}
```
Response:
```typescript
{
  id: string;
  name: string;
  type: 'custom';
  sections: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    prompt: string;
  }[];
}
```

#### Update Template (Logged-in Users Only)
// Updates an existing custom template
// Requires authentication and ownership
// Validates template structure before saving
```
PATCH /api/templates/:id
```
Request:
```typescript
{
  name?: string;
  sections?: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    prompt: string;
  }[];
}
```
Response:
```typescript
{
  id: string;
  name: string;
  type: 'custom';
  sections: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    prompt: string;
  }[];
}
```

#### Delete Template (Logged-in Users Only)
// Deletes a custom template
// Requires authentication and ownership
// Cannot delete default templates
```
DELETE /api/templates/:id
```
Response:
```typescript
{
  success: boolean;
}
```

#### Copy Template (Logged-in Users Only)
// Creates a copy of an existing template
// Can copy both default and custom templates
// Requires authentication
```
POST /api/templates/:id/copy
```
Request:
```typescript
{
  newName: string;
}
```
Response:
```typescript
{
  id: string;
  name: string;
  type: 'custom';
  sections: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    prompt: string;
  }[];
}
```

### 2. Transcription

#### Start Transcription (WebSocket)
// Establishes a WebSocket connection for real-time transcription
// Handles audio streaming and transcription updates
```
WebSocket Connection: wss://api.deepgram.com/v1/listen
```
Headers:
```
Authorization: Bearer <deepgram_api_key>
Content-Type: application/json
```
Initial Message:
```typescript
{
  model: "nova", // Most accurate model for medical transcription
  encoding: "linear16", // Standard PCM encoding
  sample_rate: 16000, // Optimal for speech recognition
  channels: 1, // Mono audio for better clarity
  interim_results: true, // Get real-time updates
  utterances: true, // Better sentence segmentation
  smart_format: true, // Improved formatting
  medical: true, // Enable medical terminology
  diarize: true, // Identify different speakers
  punctuate: true, // Add proper punctuation
  language: "en-NZ" // New Zealand English
}
```

#### Stream Audio
// Send audio data through the WebSocket connection
// Audio must be properly formatted for optimal transcription
```typescript
// Audio data should be:
// - Linear PCM
// - 16-bit
// - 16kHz sample rate
// - Mono channel
```

#### Receive Transcription
// WebSocket messages containing transcription updates
// Includes confidence scores and final status
```typescript
{
  channel: {
    alternatives: [{
      transcript: string;
      confidence: number;
    }];
  };
  is_final: boolean;
}
```

#### Close Connection
// Special message to gracefully close the WebSocket connection
```typescript
{
  type: 'CloseStream';
}
```

#### Pause Transcription
// Pauses the transcription session
// WebSocket connection remains open but stops processing audio
// Requires session ID to identify the correct session
```
POST /api/transcription/pause
```
Request:
```typescript
{
  sessionId: string;
}
```
Response:
```typescript
{
  status: 'paused';
  error?: string;
}
```

#### Resume Transcription
// Resumes a paused transcription session
// Continues processing audio through the existing WebSocket connection
```
POST /api/transcription/resume
```
Request:
```typescript
{
  sessionId: string;
}
```
Response:
```typescript
{
  status: 'recording';
  error?: string;
}
```

#### Stop Transcription
// Stops the transcription session
// Closes the WebSocket connection
// Returns the final transcription
```
POST /api/transcription/stop
```
Request:
```typescript
{
  sessionId: string;
}
```
Response:
```typescript
{
  status: 'completed';
  finalTranscription: string;
  error?: string;
}
```

#### Get Transcription Status
// Checks the current status of a transcription session
// Useful for recovery after connection issues
```
GET /api/transcription/:sessionId/status
```
Response:
```typescript
{
  status: 'ready' | 'recording' | 'paused' | 'completed' | 'error';
  currentTranscription: string;
  error?: string;
}
```

### 3. Note Generation

#### Generate Notes
// Generates medical notes from transcription using ChatGPT
// Applies the selected template structure with hierarchical prompts
// Combines system, template, and section-level prompts
// Processes transcription content according to template structure
```
POST /notes/generate
```
Request:
```typescript
{
  sessionId: string;
  transcription: string;
  template: {
    id: string;
    name: string;
    type: 'default' | 'custom';
    // System-level prompts that set the AI's role and context
    prompts: {
      system: string; // Sets the AI's role and context
      structure: string; // Overall structure guidance
    };
    // Hierarchical section structure with individual prompts
    sections: {
      name: string;
      type: 'text' | 'array';
      required: boolean;
      description: string;
      prompt: string;
      subsections?: {
        name: string;
        type: 'text' | 'array';
        required: boolean;
        description: string;
        prompt: string;
      }[];
    }[];
  };
  quickNotes: string[]; // Additional notes added during consultation
}
```
Response:
```typescript
{
  notes: {
    // Each section follows the template structure
    [sectionName: string]: {
      content: string | string[]; // Text or array based on section type
      subsections?: {
        [subsectionName: string]: {
          content: string | string[];
        };
      };
    };
  };
  status: 'success' | 'error';
  error?: string;
}
```

// Example Response:
```typescript
{
  notes: {
    overview: {
      content: ["Knee pain", "Heartburn", "Hypertension follow-up"]
    },
    problems: {
      content: [
        {
          problem_name: "Knee pain",
          subjective: "2-month history of pain, worse with walking, no recent injury, pain 6/10",
          objective: ["Mild crepitus", "Full ROM", "No effusion"],
          assessment: "Likely osteoarthritis",
          plan: ["Start physio", "Consider x-ray if no improvement"]
        },
        // ... other problems
      ]
    }
  },
  status: 'success'
}
```

## Error Responses

// All error responses follow a consistent format
// Includes error code for programmatic handling
// Includes user-friendly error message
```typescript
{
  error: {
    code: string;
    message: string;
  }
}
```

Common error codes:
- `INVALID_API_KEY`: Invalid or missing API key
- `INVALID_TEMPLATE`: Template not found
- `INVALID_SESSION`: Session not found or expired
- `TRANSCRIPTION_ERROR`: Error during transcription
- `GENERATION_ERROR`: Error during note generation

## API Usage Tracking
// Each API request includes usage tracking in response headers
// Helps monitor API usage and enforce rate limits
```
X-API-Usage: <current_usage>/<limit>
X-API-Reset: <reset_timestamp>
```

## Related Documents
- [State Management](./state-management.md)
- [Data Flow](./data-flow.md)
- [Template System](./template-prompt-system.md)
- [User Flows](../uiux/user-flows.md)
- [Logic Flows](./logic-flows.md)
- [Project Structure](./project-structure.md)
