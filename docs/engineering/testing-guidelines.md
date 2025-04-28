# Testing Guidelines

## Overview
This document outlines our testing approach and guidelines for ConsultAI NZ. We follow a Test-After Development approach, focusing on practical and effective testing strategies.

## Testing Strategy

### 1. Test-After Development Approach
We follow a Test-After Development approach where tests are written after component implementation. This approach is chosen because:
- It's more practical for rapid development
- Easier to understand for team members new to testing
- Allows for quick iteration and validation of ideas
- More aligned with our MVP-first development strategy

### 2. When to Write Tests

#### High Priority (Write Tests Immediately)
- User authentication flows
- Data submission and validation
- Critical business logic
- Error handling scenarios
- Bug fixes (to prevent regressions)

#### Medium Priority (Write Tests During Refinement)
- Form validations
- State management
- API integrations
- Navigation flows
- User interactions

#### Lower Priority (Write Tests When Time Permits)
- Helper functions
- UI components without business logic
- Optional features
- Visual styling

### 3. Testing Process

#### Component Testing Flow
1. Implement component functionality
2. Verify component works in UI
3. Write tests for:
   - Core functionality
   - Edge cases
   - Error scenarios
4. Refactor if needed while maintaining test coverage

#### Example Timeline
```
1. Create ConsultationForm component
2. Implement basic functionality
3. Test:
   - Form submission
   - Field validation
   - Error handling
   - State management

4. Create TemplateSelector component
5. Implement selection logic
6. Test:
   - Template loading
   - Selection handling
   - Default template behavior
```

### 4. Test Organization

#### Directory Structure
```
src/
├── __tests__/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/           # End-to-end tests
```

#### Naming Conventions
- Test files: `ComponentName.test.tsx` or `ComponentName.spec.tsx`
- Test suites: `describe('ComponentName', () => { ... })`
- Test cases: `it('should do something specific', () => { ... })`

### 5. Testing Tools

#### Core Testing Stack
- Vitest: Test runner
- React Testing Library: Component testing
- Jest DOM: DOM testing utilities

#### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test src/__tests__/unit/ComponentName.test.tsx
```

### 6. Best Practices

#### What to Test
- User interactions
- Component state changes
- API calls and responses
- Error scenarios
- Edge cases

#### What Not to Test
- Implementation details
- Third-party library behavior
- Styling (unless critical to functionality)
- Internal state management details

### 7. Test Coverage Goals

#### Minimum Coverage Requirements
- Critical components: 80%+
- Core business logic: 90%+
- Utility functions: 70%+
- UI components: 60%+

#### Coverage Exclusions
- Third-party code
- Generated code
- Configuration files
- Type definitions

## Related Documents
- [Project Structure](./project-structure.md)
- [Tech Stack](./tech-stack.md)
- [State Management](./state-management.md)
- [Data Flow](./data-flow.md)
