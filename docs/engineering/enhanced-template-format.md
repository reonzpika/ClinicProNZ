# Enhanced Template Format (Future Considerations)

This document outlines the enhanced template format for future implementation, building upon the basic template structure.

## Enhanced Template Structure

```typescript
// This type defines what a template looks like in our enhanced system
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

## Example Implementation

### Multi-problem SOAP Template
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

## Future Considerations

1. **Template Complexity**
   - The enhanced system might be too complex for initial MVP
   - Many features (preview, metadata, validation) could be added incrementally
   - Start with core functionality and expand based on user feedback

2. **Prompt System Limitations**
   - Current prompt structure might not handle complex medical scenarios well
   - No clear strategy for handling ambiguous or incomplete information
   - Add error handling and fallback strategies for unclear cases

3. **Database Design Concerns**
   - JSONB storage might make it harder to query specific template parts
   - No versioning system for templates
   - Consider adding template versions and more structured storage

4. **Missing Critical Features**
   - Template sharing between GPs
   - Template rating or feedback system
   - Template effectiveness tracking
   - Add these features to the roadmap

5. **Integration Challenges**
   - Complex template structure might make it harder to integrate with PMS
   - No clear strategy for handling different PMS formats
   - Add PMS integration considerations

6. **Security and Privacy**
   - Data encryption for sensitive template content
   - Access control for custom templates
   - Add security considerations

7. **Performance Considerations**
   - Large templates might impact database performance
   - Caching strategy
   - Add performance optimization guidelines

8. **User Experience Gaps**
   - Template search/filtering
   - Template categories or tags
   - Add UX considerations 