# Template Management Documentation

## Overview
This document provides guidelines for managing templates in the system, particularly for adding new default templates.

## Template Structure

### Database Schema
```typescript
{
  id: uuid; // Unique identifier
  name: string; // Template name
  type: string; // 'default' or 'custom'
  sections: jsonb; // Array of section objects
  prompts: jsonb; // System and structure prompts
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Section Structure
```typescript
{
  name: string        // Section name
  type: string        // 'text' or 'array'
  required: boolean   // Whether the section is required
  description: string // Section description
  prompt: string      // Prompt for this section
      description: string
    }
  ]
}

## Adding New Default Templates</edit>

### Method 1: Using the Seed Script (Recommended)

1. **Update the Seed File**
   Add your new template to `database/seed-templates.ts`:

   ```typescript
   const defaultTemplates = [
     // ... existing templates ...
     {
       id: uuidv4(),
       name: 'Your Template Name',
       type: 'default',
       sections: [
         {
           name: 'Section Name',
           type: 'text', // or 'array'
           required: true,
           description: 'Section description',
           prompt: 'Prompt for this section',
           // If type is 'array', include subsections
           subsections: [
             {
               name: 'Subsection Name',
               type: 'text',
               required: true,
               description: 'Subsection description',
               prompt: 'Prompt for this subsection'
             }
           ]
         }
       ],
       prompts: {
         structure: 'Overall structure guidance for the template'
       }
     }
   ];
   ```

2. **Run the Seed Command**
   ```bash
   npm run db:seed-templates
   ```

### Method 2: Direct Database Insertion

```typescript
import { v4 as uuidv4 } from 'uuid';

import { sql } from './client';

const newTemplate = {
  id: uuidv4(),
  name: 'Your Template Name',
  type: 'default',
  sections: [
    // ... sections array ...
  ],
  prompts: {
    structure: '...'
  }
};

await sql.query(
  'INSERT INTO templates (id, name, type, sections, prompts) VALUES ($1, $2, $3, $4, $5)',
  [
    newTemplate.id,
    newTemplate.name,
    newTemplate.type,
    JSON.stringify(newTemplate.sections),
    JSON.stringify(newTemplate.prompts)
  ]
);
```

## Best Practices

1. **Template Design**
   - Keep section names clear and descriptive
   - Use consistent naming conventions
   - Make prompts specific and actionable
   - Include helpful descriptions for each section

2. **Data Validation**
   - Always use `uuidv4()` for new template IDs
   - Ensure `type` is either 'default' or 'custom'
   - Validate JSON structure before insertion
   - Use parameterized queries to prevent SQL injection

3. **Error Handling**
   - Check for existing templates before insertion
   - Validate JSON structure
   - Handle database connection errors
   - Log errors appropriately

## Common Issues and Solutions

1. **Environment Variables**
   ```typescript
   // Ensure DATABASE_URL is loaded
   dotenv.config({ path: resolve(process.cwd(), '.env.local') });
   dotenv.config();
   ```

2. **JSON Handling**
   - Always use `JSON.stringify()` for sections and prompts
   - Parse JSON data when retrieving from database
   - Validate JSON structure before insertion

3. **Type Errors**
   - Ensure `type` field is a string ('default' or 'custom')
   - Use proper data types for all fields
   - Consider using TypeScript interfaces for type safety

## Example Templates

### SOAP Note Template
```typescript
{
  id: uuidv4(),
  name: 'SOAP Note',
  type: 'default',
  sections: [
    {
      name: 'Subjective',
      type: 'text',
      required: true,
      description: 'Patient-reported information',
      prompt: 'Document the patient\'s chief complaint and history.'
    },
    {
      name: 'Objective',
      type: 'text',
      required: true,
      description: 'Clinical findings',
      prompt: 'Record vital signs and examination findings.'
    },
    {
      name: 'Assessment',
      type: 'text',
      required: true,
      description: 'Clinical assessment',
      prompt: 'Provide your clinical assessment and diagnosis.'
    },
    {
      name: 'Plan',
      type: 'text',
      required: true,
      description: 'Treatment plan',
      prompt: 'Outline the treatment plan and follow-up.'
    }
  ],
  prompts: {
    structure: 'Document the encounter following the SOAP format.'
  }
}
```

### Progress Note Template
```typescript
{
  id: uuidv4(),
  name: 'Progress Note',
  type: 'default',
  sections: [
    {
      name: 'Current Status',
      type: 'text',
      required: true,
      description: 'Patient\'s current condition',
      prompt: 'Describe the patient\'s current status and progress.'
    },
    {
      name: 'Treatment Response',
      type: 'text',
      required: true,
      description: 'Response to treatment',
      prompt: 'Document the patient\'s response to current treatment.'
    },
    {
      name: 'Plan',
      type: 'text',
      required: true,
      description: 'Next steps',
      prompt: 'Outline the next steps in treatment.'
    }
  ],
  prompts: {
    structure: 'Document the patient\'s progress and update the treatment plan.'
  }
}
```

## Testing Templates

1. **Verify Template Insertion**
   ```typescript
   const result = await sql.query('SELECT * FROM templates WHERE type = $1', ['default']);
   console.log(result.rows);
   ```

2. **Check Template Structure**
   ```typescript
   const template = result.rows[0];
   console.log(JSON.parse(template.sections));
   console.log(JSON.parse(template.prompts));
   ```

## Maintenance

1. **Updating Templates**
   - Use the seed script to update all default templates
   - Consider versioning for template changes
   - Document template changes in version control

2. **Removing Templates**
   ```typescript
   await sql.query('DELETE FROM templates WHERE type = $1 AND name = $2', ['default', 'Template Name']);
   ```

3. **Backup Considerations**
   - Export templates before major changes
   - Keep template definitions in version control
   - Document template changes in changelog
