# ConsultAI NZ Development Progress

## Project Status Summary
- **Current Phase**: Core AI Integration Preparation
- **Next Immediate Tasks**: ChatGPT Integration and Note Generation System
- **Current Focus**: Core consultation functionality, real-time transcription, and global state management (complete)
- **Development Approach**: Following MVC (Minimum Viable Consultation) principles
- **AI Collaboration**: Pair programming with AI agent for implementation
- **Testing Approach**: Test-After Development (see [Testing Guidelines](../engineering/testing-guidelines.md))

## Completed Tasks

### Documentation [x]
### Planning [x]
- [x] Define core features for MVP
- [x] Establish development principles
- [x] Create initial project roadmap
- [x] Define template system requirements
- [x] Define state architecture
- [x] Define data flow architecture
- [x] Technical implementation planning
- [x] Testing strategy planning
### Development Environment [x]
- [x] Project Structure Setup
- [x] Development Tools
- [x] UI Framework Setup
- [x] External Services (Partial)
### Template Management System (Priority: Must Have) [x]
- [x] Database Setup
- [x] Core Template Operations
- [x] Template UI Components
- [x] Template Storage
- [x] Template Validation
- [x] Template Validation
- [x] Template Selection UI
### Basic UI Implementation (Priority: Must Have) [x]
- [x] Core Components
- [x] Layout Components
- [x] Template Components
- [x] Consultation Components
  - [x] TranscriptionControls
  - [x] QuickNotes
  - [x] GeneratedNotes
- [x] Main Layout
  - [x] Header
  - [x] Footer
  - [x] Consultation page layout
### Core Implementation [x]
- [x] Speech to Text Integration
- [x] State Management Implementation
### Core AI Integration (Priority: Must Have) [x]
- [x] ChatGPT Integration
   - [x] Note generation service
   - [x] Template prompt processing
   - [x] Error handling and retries
- [x] Note Generation System
   - [x] Template-to-prompt translation
   - [x] Note formatting and structure
   - [x] Review and edit interface

## Current Sprint Tasks
### Bug Fixes & Improvements of Main Consultation Page
- [ ] UI Improvements
  - [x] Template menu in the header only showing when logged in. It should show even when not logged in. When not-logged in user clicks on it, it should redirect to login page.
  - [x] The entire page should be compact with minimal white space.
  - [ ] Visual feedback when recording is in progress.
  - [ ] Visual feedback when note is being generated.
- [ ] Logic/state management improvements
  - [ ] GenerateNotes is only enabled when there's a quick notes entry. After the recording is done, even if there's no quick notes entry, GenerateNotes should be enabled, which is currently not the case. I suspect this is due to how we are handling the global state of the consultation.
  - [ ] After the recording and generating the note, when i refresh the page, the note and quick notes are saved but the transcription is not. The transcription should also be saved. 
- [ ] Improve Multi-problem SOAP template
  - [ ] When there's only one problem, the AI tries to create multiple problems when in fact there's only one.
  - [ ] When AI is not able to find the required information in the transcription, it is generating new information that is not part of the template. This is not good. The AI should only generate information that is part of the transcription.

## Upcoming Sprints

## Future Features
1. ACC integration (database of ACC codes, suggest based on generated note)
2. NZ guidelines/online resources (database, suggest based on generated note)
3. Useful checklist (database of checklists for common GP consultations)
4. Patient education handouts (database, suggest and provide for patient)
5. Follow-up/recall suggestions (suggest intervals, add to recall list)
7. Red flag detection (highlight red flags in generated note)
8. Consultation summary for patient (generate plain-language summary for patient)
9. Differential diagnosis (suggest differential diagnosis based on generated note)
10. Clinical tools (suggest clinical tools based on generated note)
11. Screening tools (suggest screening tools based on generated note e.g. PHQ-9, GAD-7, AUDIT-C, etc)

### MVP Design Decisions - ACC & NZ Guidelines Integration
#### Current Setup
- Database: Neon (PostgreSQL)
- Note format: Plain text (generated via ChatGPT)
- Goal: Build MVP quickly but allow future scalability for advanced features

#### Phase 1: MVP Implementation
##### ACC Code Matching
- Build a JSON or SQL database of ACC codes with fields:
  - code, description, body_part, injury_type, keywords
- Use basic matching logic:
  - Extract key terms from generated note (e.g. "ankle sprain")
  - Match against body part and injury type fields using SQL (ILIKE, full-text search, or pg_trgm)

##### NZ Guidelines Integration
- Build a guideline DB with:
  - title, URL, summary, tags, synonyms
- Match by keyword extraction and fuzzy string matching
- Return top relevant guideline URLs

#### Phase 2: Future Upgrade - Vector Search (RAG)
- Use OpenAI embeddings (text-embedding-3-small) to embed:
  - Notes
  - ACC codes and guideline entries
- Store embeddings using pgvector in Neon
- Retrieve matches based on cosine similarity

#### Phase 3: Advanced - OpenAI Agents
- Integrate OpenAI Agents when multiple tools are live (e.g., ACC codes, checklists, follow-up suggestions)
- Agents will:
  - Interpret the input
  - Decide which function/tool to call
  - Handle orchestration logic for multiple outputs

#### Decision Summary
| Stage | Method | Tools/Tech |
|-------|---------|------------|
| MVP | Keyword + metadata match | Neon + SQL (ILIKE, pg_trgm) |
| Post-MVP | RAG (Vector DB + embeddings) | OpenAI Embeddings + pgvector |
| Advanced | Agent-based orchestration | OpenAI Agents + tools |


## Progress Metrics

| Area                     | Progress |                                                  |
|-------------------------|----------|--------------------------------------------------|
| Documentation           | 100%     | ██████████ |
| Core Features Defined   | 100%     | ██████████ |
| Technical Design        | 100%     | ██████████ |
| Implementation         | 100%     | ██████████ |
| Template System        | 100%     | ██████████ |
| Database Setup         | 100%     | ██████████ |
| Basic UI              | 100%     | ██████████ |
| Speech to Text        | 100%     | ██████████ |
| State Management      | 100%     | ██████████ |

Legend: █ = Complete, ░ = Incomplete

## AI Collaboration Guidelines

### 1. Communication Style
- Use clear, non-technical language when explaining concepts
- Provide context for medical terms and workflows
- Ask for clarification when needed
- Break down complex tasks into smaller steps

### 2. Development Approach
- Follow MVC principles
- Focus on core consultation functionality first
- Prioritize GP workflow and usability
- Maintain clean, readable code
- Add clear comments explaining complex logic
- Follow test-after development approach

### 3. Documentation Standards
- Keep documentation up-to-date
- Use clear examples and explanations
- Document decisions and rationale
- Include TODO comments for future improvements

### 4. Code Review Process
- Review code changes together
- Explain technical decisions
- Consider GP perspective in design
- Test core functionality thoroughly
- Ensure tests are written for critical features

### 5. Task Management
- Break down tasks into manageable chunks
- Set clear completion criteria
- Track progress regularly
- Review and adjust estimates as needed

### 6. Learning and Improvement
- Document lessons learned
- Identify areas for improvement
- Share knowledge and best practices
- Maintain feedback loop

## Notes
- Focus on MVP features first
- Regular review of template system design
- Consider GP workflow in all decisions
- Maintain documentation as single source of truth
- Regular testing of core features
- Collect feedback early and often
- Write tests for critical functionality after implementation
- Prioritize testing based on component importance
- Template management is critical for MVP success

## Review Points
- Weekly progress review
- Bi-weekly technical design review
- Monthly risk assessment
- Quarterly feature prioritization
- Regular test coverage review
- Template system implementation review
