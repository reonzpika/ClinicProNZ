# Template-Based Prompt System

This document outlines how templates are used to generate structured prompts for ChatGPT, which then creates organized medical notes from consultation transcriptions.

## Core Concept

Templates are NOT forms to be filled out by GPs. Instead, they:
1. Define the structure for AI-generated notes
2. Guide how ChatGPT should organize the consultation content
3. Ensure consistent note formatting across consultations
4. Provide preview and examples for GPs to understand the output
5. Include comprehensive metadata for template selection

## Basic Template Structure

```typescript
// This is what a template looks like in our system
type Template = {
  id: string; // Unique identifier (like a patient's NHI number)
  name: string; // Template name (e.g., "SOAP Note", "Driver's License Medical")
  type: 'default' | 'custom'; // System template or one you created
  ownerId?: string; // Who created the template (for custom templates)

  // The different parts of your medical note
  sections: {
    name: string; // Section name (e.g., "History", "Examination")
    type: 'text' | 'array'; // Single text or multiple items
    required: boolean; // Whether this section must be filled
    description: string; // What goes in this section
    subsections?: Section[]; // Nested sections if needed
  }[];

  // Instructions for the AI
  prompts: {
    system: string; // Basic medical context
    structure: string; // How to organize the note
  };
};

// Example of a simple SOAP template
const soapTemplate: Template = {
  id: 'default-soap',
  name: 'SOAP Note',
  type: 'default',

  sections: [
    {
      name: 'subjective',
      type: 'text',
      required: true,
      description: 'Patient\'s description of symptoms and history'
    },
    {
      name: 'objective',
      type: 'text',
      required: true,
      description: 'Clinical findings and examination results'
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
      description: 'Treatment plan and follow-up'
    }
  ],

  prompts: {
    system: 'You are a medical documentation assistant for New Zealand GPs. Follow NZ medical documentation standards.',
    structure: 'Generate a medical note following the SOAP format. Include all relevant clinical information.'
  }
};
```

## How Templates Become Prompts

When you use a template, the system converts it into instructions for the AI. Here's how it works:

```typescript
// Example of how a template becomes a medical note
function generateMedicalNote(template: Template, consultation: string): string {
  // 1. Start with the basic instructions
  const instructions = `
${template.prompts.system}

${template.prompts.structure}
`;

  // 2. Add the consultation details
  return `
${instructions}

Based on this consultation:

${consultation}

Please create a medical note following the SOAP format.
`;
}

// Example usage:
const consultation = `
Patient presented with 3-day history of sore throat and fever.
No cough or runny nose. Temperature 38.2°C, throat red with exudate.
No previous history of similar episodes.
`;

const medicalNote = generateMedicalNote(soapTemplate, consultation);
```

## Template Management

### 1. Using Templates
- System templates are always available
- You can create your own templates
- Templates can be copied and modified

### 2. Copying Templates
```typescript
// Function to copy a template
function copyTemplate(template: Template, newName: string): Template {
  return {
    ...template,
    id: generateNewId(), // Creates a new unique ID
    name: newName,
    type: 'custom',
    ownerId: currentUserId // Your user ID
  };
}

// Example: Copy the SOAP template
const myCustomSOAP = copyTemplate(soapTemplate, 'My Custom SOAP Note');
```

### 3. Template Examples

#### Driver's License Medical Template
```typescript
const driversLicenseTemplate: Template = {
  id: 'default-drivers-license',
  name: 'Driver\'s License Medical',
  type: 'default',

  sections: [
    {
      name: 'patientDetails',
      type: 'text',
      required: true,
      description: 'Patient identification and license details'
    },
    {
      name: 'medicalHistory',
      type: 'text',
      required: true,
      description: 'Relevant medical conditions and medications'
    },
    {
      name: 'examination',
      type: 'text',
      required: true,
      description: 'Physical examination findings'
    },
    {
      name: 'assessment',
      type: 'text',
      required: true,
      description: 'Fitness to drive assessment'
    }
  ],

  prompts: {
    system: 'You are completing a driver\'s license medical assessment. Follow NZTA guidelines.',
    structure: 'Document the medical assessment for driver\'s license renewal.'
  }
};
```

#### Well Child Check Template
```typescript
const wellChildTemplate: Template = {
  id: 'default-well-child',
  name: 'Well Child Check',
  type: 'default',

  sections: [
    {
      name: 'growth',
      type: 'text',
      required: true,
      description: 'Growth measurements and percentiles'
    },
    {
      name: 'development',
      type: 'text',
      required: true,
      description: 'Developmental milestones'
    },
    {
      name: 'immunisations',
      type: 'text',
      required: true,
      description: 'Immunisation status and plan'
    },
    {
      name: 'healthPromotion',
      type: 'text',
      required: true,
      description: 'Health promotion and advice given'
    }
  ],

  prompts: {
    system: 'You are completing a Well Child check. Follow the B4 School Check guidelines.',
    structure: 'Document the Well Child assessment and any concerns identified.'
  }
};
```

## Key Features

1. **Template Management**:
   - CRUD operations for templates
   - Separation of default and custom templates
   - User-specific template access (not logged in users can only access default templates)

2. **Usage Tracking**:
   - Records template usage per consultation
   - Helps identify popular templates

## TODO: Structure Prompt Improvements

### Current Issues
- Structure prompts are too generic
- No standardized format for different consultation types
- Inconsistent information extraction from live transcriptions
- Variable quality in generated notes

### Required Improvements
1. **Standardized Prompt Format**
   - Create a consistent structure for all templates
   - Include specific instructions for each section
   - Add examples of expected content

2. **Information Extraction Guidelines**
   - Define clear rules for identifying key information
   - Specify how to handle ambiguous or incomplete information
   - Add context-specific extraction rules

3. **Section-Specific Instructions**
   - Detailed guidelines for each section type
   - Required vs optional information
   - Formatting requirements

4. **Template Categories**
   - Group similar consultation types
   - Create category-specific guidelines
   - Standardize prompts within categories

### Example of Improved Structure
```typescript
// TODO: Implement standardized structure prompts
const improvedStructurePrompt = {
  extraction: {
    rules: [
      'Identify and extract all medical conditions mentioned',
      'Note all medications and dosages',
      'Record vital signs and measurements',
      'Capture follow-up plans and referrals'
    ],
    handling: {
      ambiguous: 'Flag for review if information is unclear',
      incomplete: 'Note missing information for follow-up'
    }
  },
  sections: {
    subjective: {
      required: ['chief complaint', 'history of present illness'],
      optional: ['review of systems', 'past medical history'],
      format: 'Use bullet points for symptoms and timeline'
    },
    objective: {
      required: ['vital signs', 'physical exam findings'],
      optional: ['lab results', 'imaging findings'],
      format: 'Organize by system, use measurements where available'
    }
  }
};
```

### Next Steps
1. Review existing templates and identify common patterns
2. Create a standardized prompt format
3. Test with different consultation types
4. Implement feedback mechanism for continuous improvement
