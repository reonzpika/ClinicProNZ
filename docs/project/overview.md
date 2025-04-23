# ConsultAI NZ - Project Overview

## Vision
ConsultAI NZ is an AI-powered medical consultation platform designed specifically for New Zealand healthcare professionals. The platform aims to streamline the consultation process by providing real-time transcription, intelligent note generation, and integrated access to NZ health resources.

## Target Users
Primary:
- General Practitioners in New Zealand
- Medical professionals requiring consultation documentation
- Healthcare providers needing efficient note-taking solutions

## Core Features

### 1. Live Transcription
- Real-time transcription of patient consultations using Deepgram
- Support for New Zealand English and medical terminology
- Automatic speaker diarization (doctor vs patient)

### 2. Template-Based Prompt System
- Templates define the structure for AI-generated notes, NOT forms to be filled out manually
- How it works:
  1. GP selects appropriate template for the consultation
  2. Template structure is used to create a prompt for ChatGPT
  3. ChatGPT uses this prompt to analyze the live transcription
  4. AI generates a structured note following the template's format
- Template types:
  - Multi-problem SOAP template (covers ~80% of GP consultations)
    - Creates SOAP format for each problem
  - Specialized templates for specific visits:
    - Driver's license medical
    - 6-week baby check-up
    - Initial medical enrollment
    - Other common consultation types
  - Custom templates created by GPs
- Template access:
  - Default templates: Available to all users
  - Custom templates: Only visible to creator

### 3. Intelligent Note Generation
- AI-powered consultation note generation
- Integration with selected template content
- Context-aware medical terminology handling

### 4. User Interface
- Clean, intuitive design optimized for medical workflows
- Responsive layout for various devices
- Accessibility compliance for healthcare environments
