# Template-Based Prompt System

## Overview

This document outlines how templates are used to generate structured prompts for ChatGPT, which then creates organized medical notes from consultation transcriptions.

## Design Decisions

### 1. Template Structure
- Templates define structure for AI-generated notes
- Not forms to be filled by GPs
- Include system, template, and section-level prompts
- See [State Management](./state-management.md#core-state-structure) for state handling

### 2. Template Processing
- Templates guide how ChatGPT organizes content
- Each section has specific prompt and format
- Supports hierarchical structures
- See [API Specification](./api-specification.md#note-generation) for implementation

### 3. Validation Approach
- Essential validations only for MVP
- Focus on data integrity
- See [Data Flow](./data-flow.md#validation-points) for validation points

## Core Concept

Templates are NOT forms to be filled out by GPs. Instead, they:
1. Define the structure for AI-generated notes
2. Guide how ChatGPT should organize the consultation content
3. Ensure consistent note formatting across consultations
4. Provide preview and examples for GPs to understand the output
5. Include comprehensive metadata for template selection

## Basic Template Structure

```typescript
// Core template type definition
type Template = {
  id: string; // Unique identifier for the template
  name: string; // Human-readable name (e.g., "SOAP Note")
  type: 'default' | 'custom'; // System template or user-created
  ownerId?: string; // For custom templates
  sessionId: string; // Associated consultation session

  // Each section defines a part of the medical note
  sections: {
    name: string; // Section identifier (e.g., "subjective")
    type: 'text' | 'array'; // Output format: paragraph or bullet points
    required: boolean; // Whether this section must be filled
    description: string; // What this section is for
    prompt: string; // Specific instructions for this section
    subsections?: Section[]; // For nested sections if needed
  }[];

  // Global prompts for the entire template
  prompts: {
    system: string; // Sets the AI's role and context
    structure: string; // Overall structure guidance
  };
};
```

## Validation Rules

### 1. Template Structure Validation
```typescript
type TemplateValidation = {
  // Required fields
  requiredFields: ['id', 'name', 'type', 'sections', 'prompts', 'sessionId'];

  // Section validation
  sectionRules: {
    minSections: 1;
    maxSections: 20;
    validTypes: ['text', 'array'];
    requiredFields: ['name', 'type', 'required', 'description', 'prompt'];
  };

  // Prompt validation
  promptRules: {
    requiredFields: ['system', 'structure'];
    maxLength: {
      system: 500;
      structure: 1000;
    };
  };
};
```

### 2. Content Validation
```typescript
type ContentValidation = {
  // Transcription validation
  transcriptionRules: {
    minLength: 10; // Minimum characters
    maxLength: 10000; // Maximum characters
    required: true;
  };

  // Quick notes validation
  quickNotesRules: {
    maxNotes: 20; // Maximum number of quick notes
    maxLength: 200; // Maximum characters per note
  };
};
```

## Template Examples

### 1. Basic SOAP Note Template
```typescript
const soapTemplate: Template = {
  id: 'default-soap',
  name: 'SOAP Note',
  type: 'default',
  sessionId: 'session1',

  sections: [
    {
      name: 'subjective',
      type: 'text',
      required: true,
      description: 'Patient\'s description of symptoms and history',
      prompt: 'Summarize the patient\'s main concerns and history in 1-2 concise paragraphs.'
    },
    {
      name: 'objective',
      type: 'array',
      required: true,
      description: 'Clinical findings and examination results',
      prompt: 'List all clinical findings, vital signs, and examination results as bullet points.'
    },
    {
      name: 'assessment',
      type: 'text',
      required: true,
      description: 'Clinical diagnosis or impression',
      prompt: 'Provide a clear clinical assessment or diagnosis.'
    },
    {
      name: 'plan',
      type: 'array',
      required: true,
      description: 'Treatment plan and follow-up',
      prompt: 'List all treatment actions, medications, and follow-up plans as bullet points.'
    }
  ],

  prompts: {
    system: 'You are a medical documentation assistant for New Zealand GPs. Follow NZ medical documentation standards.',
    structure: 'Generate a medical note following the SOAP format. Include all relevant clinical information.'
  }
};
```

### 2. Hierarchical Multi-Problem SOAP Note Template
```typescript
const hierarchicalMultiProblemSoapTemplate: Template = {
  id: 'default-hierarchical-multi-problem-soap',
  name: 'Hierarchical Multi-Problem SOAP Note',
  type: 'default',
  sessionId: 'session2',

  sections: [
    {
      name: 'overview',
      type: 'array',
      required: true,
      description: 'List of all problems discussed',
      prompt: 'List each problem the patient presented with as a bullet point.'
    },
    {
      name: 'problems',
      type: 'array',
      required: true,
      description: 'SOAP notes for each problem',
      prompt: 'For each problem listed in the overview, provide a complete SOAP note.',
      subsections: [
        {
          name: 'problem_name',
          type: 'text',
          required: true,
          description: 'Name of the problem',
          prompt: 'State the problem name clearly.'
        },
        {
          name: 'subjective',
          type: 'text',
          required: true,
          description: 'Patient\'s description for this problem',
          prompt: 'Summarize the patient\'s concerns and history specific to this problem.'
        },
        {
          name: 'objective',
          type: 'array',
          required: true,
          description: 'Clinical findings for this problem',
          prompt: 'List all relevant clinical findings, vital signs, and examination results as bullet points.'
        },
        {
          name: 'assessment',
          type: 'text',
          required: true,
          description: 'Assessment for this problem',
          prompt: 'Provide a clear assessment specific to this problem.'
        },
        {
          name: 'plan',
          type: 'array',
          required: true,
          description: 'Treatment plan for this problem',
          prompt: 'List all treatment actions, medications, and follow-up plans as bullet points.'
        }
      ]
    }
  ],

  prompts: {
    system: 'You are a medical documentation assistant for New Zealand GPs. Follow NZ medical documentation standards.',
    structure: 'Generate a hierarchical medical note where each problem has its own complete SOAP note. Start with an overview of all problems, then provide detailed SOAP notes for each problem separately.'
  }
};
```

## How Templates Process Transcripts

### Example Transcript
```plaintext
Patient presented with three main concerns:
1. Ongoing knee pain for 2 months, worse with walking
2. Recent onset of heartburn after meals
3. Follow-up for blood pressure management

For the knee: No recent injury, pain is 6/10, no swelling
For heartburn: Started 2 weeks ago, worse at night, no vomiting
BP today is 145/90, on amlodipine 5mg daily

Exam findings:
- Knee: Mild crepitus, full ROM, no effusion
- Heartburn: Epigastric tenderness
- BP: 145/90, HR 72 regular

Plan to:
- Knee: Start physio, consider x-ray if no improvement
- Heartburn: Trial PPI, lifestyle advice
- BP: Increase amlodipine to 10mg, review in 1 month
```

### Example Output (Hierarchical Multi-Problem SOAP)
```typescript
{
  overview: [
    "Knee pain",
    "Heartburn",
    "Hypertension follow-up"
  ],
  problems: [
    {
      problem_name: "Knee pain",
      subjective: "2-month history of pain, worse with walking, no recent injury, pain 6/10",
      objective: [
        "Mild crepitus",
        "Full ROM",
        "No effusion"
      ],
      assessment: "Likely osteoarthritis",
      plan: [
        "Start physio",
        "Consider x-ray if no improvement"
      ]
    },
    {
      problem_name: "Heartburn",
      subjective: "2-week history, worse at night, no vomiting",
      objective: [
        "Epigastric tenderness"
      ],
      assessment: "Probable GERD",
      plan: [
        "Trial PPI",
        "Lifestyle advice"
      ]
    },
    {
      problem_name: "Hypertension follow-up",
      subjective: "On amlodipine 5mg daily",
      objective: [
        "BP: 145/90",
        "HR: 72 regular"
      ],
      assessment: "Suboptimal control",
      plan: [
        "Increase amlodipine to 10mg",
        "Review in 1 month"
      ]
    }
  ]
}
```

## Template Management

### 1. User Access Levels
- **Logged-in Users**:
  - Can create, read, update, and delete (CRUD) their own templates
  - Can copy and modify system templates

- **Non-logged-in Users**:
  - Can only access and use system templates
  - Cannot create or modify templates

### 2. Template Operations
```typescript
type TemplateOperations = {
  // Create a new template
  createTemplate: (template: Omit<Template, 'id'>) => Promise<Template>;

  // Read a template by ID
  getTemplate: (id: string) => Promise<Template>;

  // Update an existing template
  updateTemplate: (id: string, template: Partial<Template>) => Promise<Template>;

  // Delete a template
  deleteTemplate: (id: string) => Promise<void>;

  // Copy a template
  copyTemplate: (sourceId: string, newName: string) => Promise<Template>;

  // List templates
  listTemplates: (options: {
    userId?: string;
    type?: 'default' | 'custom';
  }) => Promise<Template[]>;
};
```

### 3. Template Storage
- Templates are stored in a database
- Basic access control based on user authentication
- Simple error handling for common scenarios

### 4. Template Validation
```typescript
type TemplateValidation = {
  // Required fields
  requiredFields: ['id', 'name', 'type', 'sections', 'prompts'];

  // Section validation
  sectionRules: {
    minSections: 1;
    maxSections: 20;
    validTypes: ['text', 'array'];
    requiredFields: ['name', 'type', 'required', 'description', 'prompt'];
  };

  // Prompt validation
  promptRules: {
    requiredFields: ['system', 'structure'];
    maxLength: {
      system: 500;
      structure: 1000;
    };
  };
};
```

## TODO: Future Enhancements

### Template Management Improvements
- Template sharing between users
- Template visibility settings (private/public)
- Template usage statistics and tracking
- Audit trails for template changes
- Backup and recovery procedures
- Template categorization system
- Enhanced security features
- Template version control

### Template Features
- Add support for more section types (e.g., tables, tags)
- Implement template versioning
- Add template validation system
- Create template sharing system
- Add template usage analytics

### User Experience
- Template preview functionality
- Advanced template search and filtering
- Template comparison tools
- Template usage statistics dashboard

## Related Documents
- [State Management](./state-management.md)
- [API Specification](./api-specification.md)
- [Data Flow](./data-flow.md)
- [User Flows](../uiux/user-flows.md)
- [Logic Flows](./logic-flows.md)
