# Prompt Management System

## Directory Structure

```
prompts/
├── README.md
├── base/
│   ├── clinical-context.md     # Core clinical context and requirements
│   └── medical-standards.md    # NZ medical documentation standards
├── functional/
│   └── input-processing.md     # Rules for processing transcribed consultations
└── templates/
    └── multi-problem-soap.md   # Template for multi-problem SOAP notes
```

## Overview

This prompt management system provides a hierarchical structure for managing AI prompts used in generating medical consultation notes. The system is designed to ensure consistency, maintain medical standards, and support multi-problem SOAP note generation.

## Components

### 1. Base Prompts
Located in `/base`, these prompts establish the fundamental context and requirements:
- `clinical-context.md`: Defines the AI's role, responsibilities, and core requirements
- `medical-standards.md`: Specifies NZ-specific medical documentation standards

### 2. Functional Prompts
Located in `/functional`, these prompts define specific processing rules:
- `input-processing.md`: Contains rules for processing and structuring transcribed consultations

### 3. Templates
Located in `/templates`, these provide structured formats:
- `multi-problem-soap.md`: Defines the template for multi-problem SOAP notes

## Usage

1. **Base Context**
   - Always include relevant base prompts first
   - Combine clinical context with medical standards
   - Ensure NZ-specific requirements are met

2. **Processing Rules**
   - Apply input processing rules to transcribed text
   - Follow the defined analysis levels
   - Maintain proper information structure

3. **Template Application**
   - Use templates for consistent output format
   - Follow all formatting rules
   - Include required sections and codes

## Version Control

- All prompt files are version controlled
- Changes should be documented in commit messages
- Major changes require updating the PRD

## Maintenance

1. **Regular Reviews**
   - Check for updated medical standards
   - Verify NZ compliance requirements
   - Update templates as needed

2. **Quality Assurance**
   - Test prompts with sample consultations
   - Verify output meets standards
   - Check for consistency across outputs

3. **Updates**
   - Document all changes
   - Test before deployment
   - Maintain backward compatibility

## Integration

The prompt management system integrates with:
- Transcription processing pipeline
- Note generation system
- Medical coding validation
- Quality assurance tools

## Security

- No patient data in prompts
- Follow NZ Privacy Act requirements
- Maintain HIPAA compliance
- Regular security audits
