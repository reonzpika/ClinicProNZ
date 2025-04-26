# Future Tasks

This document outlines planned features and enhancements for future development after the MVP release.

## Post-MVP Features (Priority: Nice to Have)

### 1. Note Conciseness Control
- Add conciseness level selection UI
- Implement conciseness levels in templates
- Update state management for conciseness
- Modify note generation for conciseness
- **Estimate**: 3 days
- **Dependencies**: Core AI Integration
- **Technical Notes**:
  - Extend ConsultationState with conciseLevel
  - Add UI controls in template selection
  - Update template system to support conciseness
  - Modify note generation service to handle conciseness
  - **Code Examples**:
    ```typescript
    // State Management Extension
    type ConsultationState = {
      // ... existing properties ...
      conciseLevel: 'detailed' | 'concise' | 'very-concise';
    };

    // Template System Extension
    type Template = {
      // ... existing properties ...
      conciseLevels: {
        'detailed': string;
        'concise': string;
        'very-concise': string;
      };
    };

    // Note Generation Request Extension
    type NoteGenerationRequest = {
      // ... existing properties ...
      conciseLevel: string;
    };
    ```

### 2. Core AI Assistance Features
- **Consult Assist**
  - Real-time AI consultation assistance
  - Integration with consultation flow
  - **Estimate**: 4 days
  - **Dependencies**: Core AI Integration

- **Differential Diagnosis**
  - AI-powered differential diagnosis generation
  - Integration with patient history
  - **Estimate**: 3 days
  - **Dependencies**: Consult Assist

- **Custom Prompts System**
  - User-defined AI prompts
  - Prompt management interface
  - **Estimate**: 3 days
  - **Dependencies**: Authentication System

## Future Considerations

### 1. Performance Optimization
- Implement caching strategies
- Optimize API calls
- Add performance monitoring
- **Estimate**: 2 days

### 2. User Experience Enhancements
- Add keyboard shortcuts
- Implement drag-and-drop functionality
- Add dark mode support
- **Estimate**: 3 days

### 3. Integration Features
- PMS (Practice Management System) integration
- EMR (Electronic Medical Records) integration
- Calendar integration
- **Estimate**: 5 days

## Technical Debt
- Code refactoring
- Test coverage improvement
- Documentation updates
- **Estimate**: 3 days
