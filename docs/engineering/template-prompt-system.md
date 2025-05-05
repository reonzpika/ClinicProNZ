# Template-Based Prompt System

## Overview

This document outlines how templates are used to generate structured prompts for ChatGPT, which then creates organized medical notes from consultation transcriptions.

## Design Decisions

### 1. Template Structure
- Templates define structure for AI-generated notes
- Not forms to be filled by GPs
- Include template-level and section-level prompts (no system prompt)
- See [State Management](./state-management.md#core-state-structure) for state handling

### 2. Template Processing
- Templates guide how ChatGPT organizes content
- Each section has a specific prompt and format
- Supports hierarchical structures (including recursive subsections in the UI)
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

## UI Implementation Notes

- The UI supports recursive editing of sections and subsections using the SectionBuilder component.
- The template preview uses the prompt construction utility to show the exact prompt that will be sent to the AI.
- All UI components are aligned with the canonical Template and TemplateSection types.

## Basic Template Structure

```typescript
// Core template type definition
export type Template = {
  id: string; // Unique identifier for the template
  name: string; // Human-readable name (e.g., "SOAP Note")
  description: string; // Short summary for UI
  type: 'default' | 'custom'; // System template or user-created
  ownerId?: string; // For custom templates
  sections: TemplateSection[];
  prompts: TemplatePrompts;
  createdAt?: string;
  updatedAt?: string;
};

export type TemplateSection = {
  name: string;
  type: 'text' | 'array';
  required: boolean;
  description: string;
  prompt: string;
  subsections?: TemplateSection[];
};

export type TemplatePrompts = {
  structure: string; // Overall structure guidance for the template
  example?: string; // (Optional) Example output for this template
};
```

## Validation Rules

### 1. Template Structure Validation
```typescript
type TemplateValidation = {
  // Required fields
  requiredFields: ['id', 'name', 'description', 'type', 'sections', 'prompts'];

  // Section validation
  sectionRules: {
    minSections: 1;
    maxSections: 20;
    validTypes: ['text', 'array'];
    requiredFields: ['name', 'type', 'required', 'description', 'prompt'];
  };

  // Prompt validation
  promptRules: {
    requiredFields: ['structure'];
    maxLength: {
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
  description: 'Standard SOAP format for general consultations',
  type: 'default',
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
    structure: 'Generate a medical note following the SOAP format. Include all relevant clinical information.'
  }
};
```

### 2. Hierarchical Multi-Problem SOAP Note Template
```typescript
const hierarchicalMultiProblemSoapTemplate: Template = {
  id: 'default-hierarchical-multi-problem-soap',
  name: 'Hierarchical Multi-Problem SOAP Note',
  description: 'SOAP note with separate sections for each problem',
  type: 'default',
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
    structure: 'Generate a hierarchical medical note where each problem has its own complete SOAP note. Start with an overview of all problems, then provide detailed SOAP notes for each problem separately.'
  }
};
```

## How Templates Are Converted to Prompts (MVP)

### Simplified Prompt Construction (MVP)

For the MVP, the prompt sent to ChatGPT is constructed in a minimal, focused way:
- **The structure prompt is placed at the top.**
- **Then, for each section, only the section name and prompt are included.**
- **If a section has subsections, only the subsection name and prompt are included (as a simple bullet list).**
- **If present, the example output is appended at the end.**
- **No extra metadata** (such as description, required, or format) is included in the prompt.

This approach keeps the prompt short, clear, and easy for the AI to follow, improving consistency and reducing token usage.

### Example: Hierarchical Multi-Problem SOAP Note Template

**Template Definition:**
```typescript
const hierarchicalMultiProblemSoapTemplate: Template = {
  id: 'default-hierarchical-multi-problem-soap',
  name: 'Hierarchical Multi-Problem SOAP Note',
  description: 'SOAP note with separate sections for each problem',
  type: 'default',
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
    structure: 'Generate a hierarchical medical note where each problem has its own complete SOAP note. Start with an overview of all problems, then provide detailed SOAP notes for each problem separately.'
  }
};
```

**Converted Prompt (MVP):**
```
Generate a hierarchical medical note where each problem has its own complete SOAP note. Start with an overview of all problems, then provide detailed SOAP notes for each problem separately.

overview:
List each problem the patient presented with as a bullet point.

problems:
For each problem listed in the overview, provide a complete SOAP note.
Subsections:
- problem_name: State the problem name clearly.
- subjective: Summarize the patient's concerns and history specific to this problem.
- objective: List all relevant clinical findings, vital signs, and examination results as bullet points.
- assessment: Provide a clear assessment specific to this problem.
- plan: List all treatment actions, medications, and follow-up plans as bullet points.
```

**Key Points:**
- The structure prompt is at the top.
- Only the section and subsection names and prompts are included.
- The example output (if present) is appended at the end.
- This structure is used for all templates in the MVP.

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
  requiredFields: ['id', 'name', 'description', 'type', 'sections', 'prompts'];

  // Section validation
  sectionRules: {
    minSections: 1;
    maxSections: 20;
    validTypes: ['text', 'array'];
    requiredFields: ['name', 'type', 'required', 'description', 'prompt'];
  };

  // Prompt validation
  promptRules: {
    requiredFields: ['structure'];
    maxLength: {
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
- [Project Structure](./project-structure.md)

## UI/UX Best Practices for Template Prompt Editing

To ensure a good user experience and maintain the quality of template prompts, follow these guidelines when building the template management system:

- **Use multi-line editors** (e.g., `<textarea>`, rich text editor) for all prompt fields:
  - `structure` (TemplatePrompts)
  - `example` (TemplatePrompts, optional)
  - `prompt` (each TemplateSection and subsection)
- **Preserve and display line breaks** in both the editor and any preview components. This ensures prompts are readable and easy to edit.
- **Optionally, provide a preview** of the final prompt as it will be sent to the AI, so users can verify formatting and structure.
- **Validate and sanitize input** to avoid accidental removal of line breaks or formatting.
- **Apply these practices to both system and user-created templates.**

**Why this matters:**
- Multi-line editing improves readability and usability for complex prompts.
- Accurate formatting leads to more consistent and reliable AI output.
- Good UI/UX reduces user errors and support burden.

_Reference this section when building or updating the template management UI._
