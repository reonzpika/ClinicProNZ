# Template-Based Prompt System

This document outlines how templates are used to generate structured prompts for ChatGPT, which then creates organized medical notes from consultation transcriptions.

## Core Concept

Templates are NOT forms to be filled out by GPs. Instead, they:
1. Define the structure for AI-generated notes
2. Guide how ChatGPT should organize the consultation content
3. Ensure consistent note formatting across consultations
4. Provide preview and examples for GPs to understand the output
5. Include comprehensive metadata for template selection

## Template Structure

### 1. Basic Template Structure
```typescript
// Simplified MVP Template Structure
type Template = {
  id: string;
  name: string;
  type: 'default' | 'custom';
  ownerId?: string;

  // Core structure
  sections: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    subsections?: Section[];
  }[];

  // Basic prompts
  prompts: {
    system: string;     // Base medical context
    structure: string;  // How to organize the note
  };
};

// Simplified Database Schema
const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['default', 'custom'] }).notNull(),
  ownerId: text('owner_id'),
  sections: jsonb('sections').notNull(),
  prompts: jsonb('prompts').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

### 2. Enhanced Template Format
```typescript
// This type defines what a template looks like in our system
type Template = {
  // Basic Identification
  id: string; // Unique identifier for the template
  name: string; // Human-readable name (e.g., "Multi-problem SOAP")
  type: 'default' | 'custom'; // Whether it's a system template or user-created
  ownerId?: string; // For custom templates, who created it

  // Metadata for Better Organization
  metadata: {
    description: string; // Brief description of template's purpose
    category: 'general' | 'specialized' | 'custom';
    useCase: string; // e.g., "routine checkup", "driver's license medical"
    estimatedDuration: string; // e.g., "15-20 minutes"
    commonConditions: string[]; // Typical conditions this template covers
  };

  // Preview System
  preview: {
    structure: string; // Human-readable preview of note structure
    example: string; // Example note using this template
    placeholders: { // Example placeholders for each section
      [sectionName: string]: string;
    };
  };

  // Prompt System
  prompts: {
    system: string; // Base system prompt for medical context
    structure: string; // Template-specific structure instructions
    analysis: string; // Instructions for analyzing consultation
    formatting: string; // How to format the final note
  };

  // Note Structure
  sections: Section[];
};

// Section Type Definition
type Section = {
  name: string;
  type: 'text' | 'array';
  required: boolean;
  description: string;
  subsections?: Section[];
  defaultContent?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    requiredFields?: string[];
  };
};
```

### 2. Example Templates

#### Multi-problem SOAP Template
```typescript
const multiProblemSOAPTemplate: Template = {
  id: 'default-multi-problem-soap',
  name: 'Multi-problem SOAP',
  type: 'default',

  metadata: {
    description: 'Standard SOAP format for consultations with multiple problems',
    category: 'general',
    useCase: 'general consultation',
    estimatedDuration: '15-20 minutes',
    commonConditions: ['acute illness', 'chronic disease management', 'follow-up']
  },

  preview: {
    structure: `
Overview:
[Brief summary of consultation]

Problems:
1. [Problem Name]
   - Subjective: [Patient's description]
   - Objective: [Clinical findings]
   - Assessment: [Diagnosis]
   - Plan: [Treatment plan]
`,
    example: `
Overview:
Patient presented for follow-up of hypertension and new onset headache.

Problems:
1. Hypertension
   - Subjective: BP well controlled on current medication
   - Objective: BP 125/80, HR 72
   - Assessment: Well controlled hypertension
   - Plan: Continue current medication
`,
    placeholders: {
      overview: 'Brief summary of the consultation',
      problems: 'List of identified problems',
      subjective: 'Patient\'s description of symptoms',
      objective: 'Clinical examination findings',
      assessment: 'Clinical diagnosis or impression',
      plan: 'Treatment recommendations'
    }
  },

  prompts: {
    system: `You are a medical documentation assistant for New Zealand GPs.
    Follow NZ medical documentation standards and use appropriate medical terminology.
    Consider NZ healthcare system context and available resources.`,
    structure: `Generate a medical note following the SOAP format for each identified problem.
    Include an overview section summarizing the consultation.
    For each problem, document subjective findings, objective observations,
    assessment, and plan separately.`,
    analysis: `Analyze the consultation transcript to:
    1. Identify all medical problems discussed
    2. Extract relevant symptoms and findings
    3. Note any medications or treatments mentioned
    4. Record follow-up plans or referrals`,
    formatting: `Format the note with clear section headers.
    Use bullet points for lists.
    Include relevant measurements and vital signs.
    Highlight important clinical decisions.`
  },

  sections: [
    {
      name: 'overview',
      type: 'text',
      required: true,
      description: 'Brief summary of the consultation',
      validation: {
        minLength: 20,
        maxLength: 500
      }
    },
    {
      name: 'problems',
      type: 'array',
      required: true,
      description: 'List of medical problems discussed',
      subsections: [
        {
          name: 'subjective',
          type: 'text',
          required: true,
          description: 'Patient\'s description of symptoms'
        },
        {
          name: 'objective',
          type: 'text',
          required: true,
          description: 'Clinical examination findings'
        },
        {
          name: 'assessment',
          type: 'text',
          required: true,
          description: 'Clinical diagnosis or impression'
        },
        {
          name: 'plan',
          type: 'text',
          required: true,
          description: 'Treatment recommendations'
        }
      ]
    }
  ]
};
```

## How Templates Become Prompts

### 1. Template to Prompt Translation
The system converts the template structure into a text prompt that ChatGPT can understand. Here's how it works:

```typescript
function generatePrompt(template: Template, transcription: string): string {
  // 1. Combine system and structure prompts
  const basePrompt = `
${template.prompts.system}

${template.prompts.structure}

${template.prompts.analysis}

${template.prompts.formatting}
`;

  // 2. Add consultation context
  return `
${basePrompt}

Based on the following consultation transcription, create a medical note following this structure:

${template.preview.structure}

Transcription:
${transcription}

Quick Notes:
${quickNotes.join('\n')}
`;
}
```
## Potential Flaws and Considerations of the enhanced template format

1. **Template Complexity**
   - The current system might be too complex for initial MVP
   - Many features (preview, metadata, validation) could be added incrementally
   - Suggestion: Start with core functionality and expand based on user feedback

2. **Prompt System Limitations**
   - Current prompt structure might not handle complex medical scenarios well
   - No clear strategy for handling ambiguous or incomplete information
   - Suggestion: Add error handling and fallback strategies for unclear cases

3. **Database Design Concerns**
   - JSONB storage might make it harder to query specific template parts
   - No versioning system for templates
   - Suggestion: Consider adding template versions and more structured storage

4. **Missing Critical Features**
   - No mention of template sharing between GPs
   - No template rating or feedback system
   - No way to track template effectiveness
   - Suggestion: Add these features to the roadmap

5. **Integration Challenges**
   - Complex template structure might make it harder to integrate with PMS
   - No clear strategy for handling different PMS formats
   - Suggestion: Add PMS integration considerations

6. **Security and Privacy**
   - No mention of data encryption for sensitive template content
   - No clear access control for custom templates
   - Suggestion: Add security considerations

7. **Performance Considerations**
   - Large templates might impact database performance
   - No caching strategy mentioned
   - Suggestion: Add performance optimization guidelines

8. **User Experience Gaps**
   - No mention of template search/filtering
   - No template categories or tags
   - Suggestion: Add UX considerations

## Database Integration

### 1. Database Schema
```typescript
// Schema definition using Drizzle ORM
import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Template table
export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['default', 'custom'] }).notNull(),
  ownerId: text('owner_id'), // References users table
  metadata: jsonb('metadata').notNull(), // Stores TemplateMetadata
  preview: jsonb('preview').notNull(), // Stores TemplatePreview
  prompts: jsonb('prompts').notNull(), // Stores TemplatePrompts
  sections: jsonb('sections').notNull(), // Stores Section[]
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Template usage tracking
export const templateUsage = pgTable('template_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').references(() => templates.id),
  userId: text('user_id').notNull(),
  consultationId: uuid('consultation_id').notNull(),
  usedAt: timestamp('used_at').defaultNow(),
});
```

### 2. Template Repository
```typescript
import { db } from '../db';
import { templates, templateUsage } from '../schema';
import { Template } from './types/template.types';

export class TemplateRepository {
  // Create a new template
  async createTemplate(template: Omit<Template, 'id'>): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values({
        name: template.name,
        type: template.type,
        ownerId: template.ownerId,
        metadata: template.metadata,
        preview: template.preview,
        prompts: template.prompts,
        sections: template.sections,
      })
      .returning();

    return this.mapDbToTemplate(newTemplate);
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<Template | null> {
    const result = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id))
      .limit(1);

    return result[0] ? this.mapDbToTemplate(result[0]) : null;
  }

  // Get all default templates
  async getDefaultTemplates(): Promise<Template[]> {
    const results = await db
      .select()
      .from(templates)
      .where(eq(templates.type, 'default'));

    return results.map(this.mapDbToTemplate);
  }

  // Get user's custom templates
  async getUserTemplates(userId: string): Promise<Template[]> {
    const results = await db
      .select()
      .from(templates)
      .where(and(
        eq(templates.type, 'custom'),
        eq(templates.ownerId, userId)
      ));

    return results.map(this.mapDbToTemplate);
  }

  // Track template usage
  async trackTemplateUsage(templateId: string, userId: string, consultationId: string): Promise<void> {
    await db.insert(templateUsage).values({
      templateId,
      userId,
      consultationId,
    });
  }

  // Helper to map database record to Template type
  private mapDbToTemplate(dbTemplate: any): Template {
    return {
      id: dbTemplate.id,
      name: dbTemplate.name,
      type: dbTemplate.type,
      ownerId: dbTemplate.ownerId,
      metadata: dbTemplate.metadata,
      preview: dbTemplate.preview,
      prompts: dbTemplate.prompts,
      sections: dbTemplate.sections,
    };
  }
}
```

### 3. Template Service with Database Integration
```typescript
import { TemplateRepository } from './template.repository';
import { Template } from './types/template.types';

export class TemplateService {
  private repository: TemplateRepository;

  constructor() {
    this.repository = new TemplateRepository();
  }

  async getDefaultTemplates(): Promise<Template[]> {
    return this.repository.getDefaultTemplates();
  }

  async getTemplateById(id: string): Promise<Template | null> {
    return this.repository.getTemplateById(id);
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    return this.repository.getUserTemplates(userId);
  }

  async createTemplate(userId: string, template: Omit<Template, 'id'>): Promise<Template> {
    // Validate template structure
    this.validateTemplate(template);

    // Create template in database
    const newTemplate = await this.repository.createTemplate({
      ...template,
      type: 'custom',
      ownerId: userId,
    });

    return newTemplate;
  }

  async trackTemplateUsage(templateId: string, userId: string, consultationId: string): Promise<void> {
    await this.repository.trackTemplateUsage(templateId, userId, consultationId);
  }

  private validateTemplate(template: Omit<Template, 'id'>): void {
    // Implement template validation logic
    // Check required fields, structure, etc.
  }
}
```

### 4. Initialization of Default Templates
```typescript
import { db } from '../db';
import { templates } from '../schema';
import { multiProblemSOAPTemplate } from './default/general/multi-problem-soap';
import { driversLicenseTemplate } from './default/specialized/drivers-license';
// ... other default templates

export async function initializeDefaultTemplates() {
  const defaultTemplates = [
    multiProblemSOAPTemplate,
    driversLicenseTemplate,
    // ... other default templates
  ];

  // Check if templates already exist
  const existingTemplates = await db
    .select()
    .from(templates)
    .where(eq(templates.type, 'default'));

  if (existingTemplates.length === 0) {
    // Insert default templates
    await db.insert(templates).values(
      defaultTemplates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        metadata: template.metadata,
        preview: template.preview,
        prompts: template.prompts,
        sections: template.sections,
      }))
    );
  }
}
```

### 5. Key Database Features
1. **JSON Storage**:
   - Uses PostgreSQL's JSONB type for complex template data
   - Efficient storage and querying of template structures
   - Maintains type safety through TypeScript

2. **Template Management**:
   - CRUD operations for templates
   - Separation of default and custom templates
   - User-specific template access

3. **Usage Tracking**:
   - Records template usage per consultation
   - Enables analytics and template improvement
   - Helps identify popular templates

4. **Data Integrity**:
   - Foreign key constraints for relationships
   - Timestamps for tracking changes
   - Active/inactive status for templates
