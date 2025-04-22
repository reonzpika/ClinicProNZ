# ConsultAI NZ Reference Documentation

> **Context for Cursor AI**: I am a General Practitioner (GP) building ConsultAI NZ by myself, with no prior coding experience. This documentation serves as our shared context for our pair programming sessions in Cursor. When I ask for help, please reference these documents to understand my project's goals, current state, and implementation approach. I need clear, step-by-step guidance that explains technical concepts in an accessible way.

This is my personal project to create an AI-powered medical consultation platform for New Zealand healthcare professionals. I'm developing it entirely through pair programming with Cursor's AI agent, combining my medical expertise with your development guidance.

## Why This Documentation Exists

- **Shared Context**: These documents help you (Cursor AI) understand my project's current state when I ask for help
- **Development History**: Tracks the decisions and progress we've made together
- **Implementation Guide**: References for both of us about how different parts should work
- **Consistency**: Helps maintain consistent development approach across our sessions

## Directory Structure

```
/docs
├── engineering/     # Technical implementation details
│   ├── project-structure.md  # Project organization and architecture
│   ├── tech-stack.md        # Technology choices and configurations
│   ├── git-rules.md         # Version control guidelines
│   └── logic-flows.md       # Core system interactions and data flow
│
├── project/        # Project vision and principles
│   ├── overview.md          # Project goals and features
│   ├── dev-principles.md    # Development standards and practices
│   └── ai-agent-instruction.md  # AI agent interaction guidelines
│
└── uiux/          # Design documentation
    ├── ui-notes.md         # UI components and styling guidelines
    ├── wireframes.md       # Layout and interface designs
    └── user-flows.md       # GP consultation journey and interactions
```

## How to Use This Documentation

1. **Start with Project Fundamentals**
   - Begin with `project/overview.md` to understand the platform's purpose and goals
   - Review `project/dev-principles.md` for development standards and practices
   - Check `project/ai-agent-instruction.md` for AI-assisted development guidelines

2. **Technical Implementation**
   - Study `engineering/project-structure.md` for codebase organization
   - Review `engineering/tech-stack.md` for technology choices and setup
   - Follow `engineering/git-rules.md` for version control practices
   - Consult `engineering/logic-flows.md` for system behavior and data flow
     - Understand the separation of Deepgram (transcription) and ChatGPT (note generation)
     - Review template management during consultations
     - Study state management and real-time processing

3. **Design and Interface**
   - Reference `uiux/ui-notes.md` for component and styling guidelines
   - Consult `uiux/wireframes.md` for layout and interface specifications
   - Study `uiux/user-flows.md` for consultation workflow and interactions
     - Review the single-page consultation interface
     - Understand template selection and changes
     - Follow the real-time transcription flow

## Quick Links

- [Project Overview](project/overview.md)
- [Development Principles](project/dev-principles.md)
- [Project Structure](engineering/project-structure.md)
- [Logic Flows](engineering/logic-flows.md)
- [User Flows](uiux/user-flows.md)

## Contributing

When adding new documentation:
1. Follow the existing structure and format
2. Use clear, concise language
3. Include relevant examples
4. Update this README.md if adding new sections
5. Ensure consistency with development principles
