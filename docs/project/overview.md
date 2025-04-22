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
- Default templates for common consultation types:
  - Multi-problem SOAP template (covers ~80% of GP consultations)
  - Specialized templates for specific visits:
    - Driver's license medical
    - 6-week baby check-up
    - Initial medical enrollment
    - Other common consultation types
- Role-based template access:
  - Non-logged-in users: Access to default templates only
  - Logged-in users: Full CRUD operations for custom templates
- Simple template selection interface

### 3. Intelligent Note Generation
- AI-powered consultation note generation
- Integration with selected template content
- Context-aware medical terminology handling

### 4. User Interface
- Clean, intuitive design optimized for medical workflows
- Responsive layout for various devices
- Accessibility compliance for healthcare environments

## Technical Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Shadcn UI + Radix UI
- Tailwind CSS

### Backend & APIs
- Neon (PostgreSQL database)
- ChatGPT API (language processing)
- Deepgram API (transcription)
- Clerk (authentication)

## Development Principles

1. **User-Centric Design**
   - Prioritize GP workflow efficiency
   - Minimize cognitive load during consultations
   - Ensure intuitive navigation

2. **Performance**
   - Optimize for real-time transcription
   - Minimize latency in note generation
   - Ensure reliable offline capabilities

3. **Scalability**
   - Modular architecture
   - Microservices-ready design
   - Cloud-native deployment

## Project Roadmap

### Phase 1: MVP (Current Focus)
- Basic transcription functionality
- Template management system
- Note generation and editing
- User authentication

### Phase 2: Enhancement
- Advanced template customization
- Integration with NZ health systems
- Analytics and reporting
- Mobile app development

### Phase 3: Expansion
- Multi-language support
- Advanced AI features
- Integration with EHR systems
- API for third-party applications

## Success Metrics
- User adoption rate among GPs
- Average time saved per consultation
- Note generation accuracy
- User satisfaction scores
- System uptime and reliability
