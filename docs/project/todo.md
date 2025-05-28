# ConsultAI NZ Development Progress

## Project Status Summary
- **Current Phase:** Roadmap, Feedback, and Core UI Complete
- **Next Immediate Tasks:** About Page, Privacy Policy Content Updates
- **Current Focus:** Polish, documentation, and user feedback
- **Development Approach:** MVC (Minimum Viable Consultation) principles
- **AI Collaboration:** Pair programming with AI agent for implementation

## Completed Tasks

### Documentation [x]
### Planning [x]
### Development Environment [x]
### Template Management System (Priority: Must Have) [x]
### Basic UI Implementation (Priority: Must Have) [x]
### Core Implementation [x]
### Core AI Integration (Priority: Must Have) [x]
### Roadmap & Feedback [x]
### Bug Fixes & Improvements of Main Consultation Page
### Bug Fixes & Improvements of Template Management System
### Add more AI analysis features
### Privacy Page Structure [x]
### Privacy Info Page [x]

## Current Sprint Tasks
### UI & Info Pages
- [ ] About page
- [x] Privacy page (structure complete)
- [x] Privacy info page (user-friendly summary)
- [ ] Polish roadmap page (update features, statuses)
- [ ] Polish feedback modal (copy, style, etc.)

### Privacy Policy Content Updates (High Priority)
- [ ] Update effective date in privacy policy
- [ ] Add physical address for ConsultAI NZ
- [ ] Add email address for ConsultAI NZ
- [ ] Add phone number for ConsultAI NZ
- [ ] Review and finalize all privacy policy content with legal advisor

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
12. Chat with AI agent (use consultation note as input, allow user to ask specific questions, agent can perform tasks with triggers)
    - See: https://openai.com/index/new-tools-for-building-agents/
    - See: https://platform.openai.com/docs/guides/agents

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
| Roadmap & Feedback    | 100%     | ██████████ |
| About/Privacy Pages   |  75%     | ███████░░░ |

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
