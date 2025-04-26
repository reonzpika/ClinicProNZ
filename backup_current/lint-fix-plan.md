# Linting Issues Fix Plan

## Overview
This document outlines the plan for systematically fixing the 70 linting issues (55 errors, 15 warnings) identified in the project. The issues are categorized by type and priority to ensure a methodical approach that minimizes the risk of introducing new problems.

## Issue Categories and Fix Order

### 1. Core Infrastructure Issues (Priority: Highest)
These issues affect the foundation of the application and should be addressed first.

#### Database and Migration Issues
- **File**: `src/lib/db.ts`
  - **Issue**: Exporting mutable 'let' binding, use 'const' instead
  - **Fix**: Replace mutable export with const

- **File**: `src/db/migrations/0002_template_enhancements.ts`
  - **Issue**: Unused 'db' parameter
  - **Fix**: Prefix unused parameter with underscore (_db)

- **File**: `src/lib/migrate.server.ts`
  - **Issue**: Unexpected console statement
  - **Fix**: Replace with proper logging mechanism

### 2. TypeScript/JavaScript Language Issues (Priority: High)
These are fundamental language issues that could affect multiple components.

#### Variable Usage Before Definition (DONE)
- **File**: `src/app/(auth)/template-management/[id]/page.tsx`
  - **Issue**: 'loadTemplate' was used before it was defined
  - **Fix**: Move function definition before usage

- **File**: `src/app/(unauth)/templates/page.tsx`
  - **Issue**: 'loadTemplates' was used before it was defined
  - **Fix**: Move function definition before usage

- **File**: `src/components/ui/notification.tsx`
  - **Issue**: 'removeNotification' was used before it was defined
  - **Fix**: Move function definition before usage

- **File**: `src/components/ui/scroll-area.tsx`
  - **Issue**: 'ScrollBar' was used before it was defined
  - **Fix**: Move component definition before usage

- **File**: `src/hooks/useAIProcessing.ts`
  - **Issue**: 'startProcessing' was used before it was defined
  - **Fix**: Move function definition before usage

#### Unused Variables/Parameters
- **File**: `src/app/layout.tsx`
  - **Issue**: 'inter' is assigned a value but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/components/AudioRecorder.tsx`
  - **Issue**: 'getNoteGenerationErrorMessage' is assigned but never used
  - **Issue**: 'onNoteGenerated' is defined but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/components/ConsultationNote.tsx`
  - **Issue**: 'setAnalysisLevel' is assigned but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/components/Header.tsx`
  - **Issue**: 'isSignedIn' is assigned but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/components/PatientSummary.tsx`
  - **Issue**: Multiple unused parameters ('error', 'recordingError', 'isLoading')
  - **Issue**: 'correctionError' is assigned but never used
  - **Issue**: 'setAnalysisLevel' is assigned but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/components/Tools.tsx`
  - **Issue**: 'activeCategory' and 'setActiveCategory' are defined but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/components/note-generator/FormattedNote.tsx`
  - **Issue**: 'error' is defined but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/components/ui/use-toast.ts`
  - **Issue**: 'actionTypes' is assigned but only used as a type
  - **Fix**: Convert to type or prefix with underscore

- **File**: `src/hooks/note-generation/useNoteGeneration.ts`
  - **Issue**: 'err' is defined but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/hooks/useAIProcessing.ts`
  - **Issue**: 'error' is defined but never used
  - **Fix**: Remove or prefix with underscore

- **File**: `src/utils/prompt-loader.ts`
  - **Issue**: 'error' is defined but never used
  - **Fix**: Remove or prefix with underscore

#### Number Handling
- **File**: `src/hooks/useTemplateNoteSync.ts`
  - **Issue**: Prefer `Number.isNaN` over `isNaN` (2 instances)
  - **Fix**: Replace `isNaN` with `Number.isNaN`

- **File**: `src/services/note-generation.service.ts`
  - **Issue**: Prefer `Number.isNaN` over `isNaN` (2 instances)
  - **Issue**: Unexpected lexical declaration in case block (2 instances)
  - **Fix**: Replace `isNaN` with `Number.isNaN` and move declarations outside case blocks

### 3. React-Specific Issues (Priority: Medium)
These issues are specific to React components and hooks.

#### React Hook Dependencies
- **File**: `src/app/(auth)/template-management/[id]/page.tsx`
  - **Issue**: React Hook useEffect has a missing dependency: 'loadTemplate'
  - **Fix**: Add 'loadTemplate' to dependency array or use useCallback

- **File**: `src/hooks/useAIProcessing.ts`
  - **Issue**: React Hook useCallback has a missing dependency: 'startProcessing'
  - **Fix**: Add 'startProcessing' to dependency array or restructure

#### React Refresh Issues
- **File**: `src/components/ui/badge.tsx`
  - **Issue**: Fast refresh only works when a file only exports components
  - **Fix**: Move constants/functions to a separate file

- **File**: `src/components/ui/button.tsx`
  - **Issue**: Fast refresh only works when a file only exports components
  - **Fix**: Move constants/functions to a separate file

- **File**: `src/components/ui/notification.tsx`
  - **Issue**: Fast refresh only works when a file only exports components
  - **Issue**: A/an 'object expression' passed as the value prop to the context provider should not be constructed
  - **Issue**: Add missing 'type' attribute on 'button' component
  - **Fix**: Move constants/functions to a separate file, wrap context value in useMemo, add type attribute

### 4. Accessibility Issues (Priority: Medium)
These are important for user experience but don't affect core functionality.

#### Keyboard Accessibility
- **File**: `src/components/template-browser/TemplateBrowser.tsx`
  - **Issue**: Visible, non-interactive elements with click handlers must have keyboard listeners
  - **Issue**: Avoid non-native interactive elements
  - **Fix**: Add keyboard listeners and appropriate ARIA roles

- **File**: `src/components/template-management/TemplateBrowser.tsx`
  - **Issue**: Visible, non-interactive elements with click handlers must have keyboard listeners (2 instances)
  - **Issue**: Avoid non-native interactive elements (2 instances)
  - **Fix**: Add keyboard listeners and appropriate ARIA roles

#### Form Labels
- **File**: `src/components/template-editor/VariableManager.tsx`
  - **Issue**: A form label must be associated with a control (3 instances)
  - **Fix**: Associate labels with form controls using htmlFor/id or nesting

#### Heading Content
- **File**: `src/components/ui/alert.tsx`
  - **Issue**: Headings must have content and the content must be accessible
  - **Fix**: Ensure heading has accessible content

- **File**: `src/components/ui/card.tsx`
  - **Issue**: Headings must have content and the content must be accessible
  - **Fix**: Ensure heading has accessible content

#### Autofocus
- **File**: `src/components/template-preview/TemplatePreview.tsx`
  - **Issue**: The autoFocus prop should not be used
  - **Fix**: Remove autoFocus or implement a more accessible alternative

### 5. Styling and UI Issues (Priority: Low)
These are less critical and can be addressed after core functionality is fixed.

#### Trailing Spaces and Commas
- **File**: `src/components/ConsultationNote.tsx`
  - **Issue**: Trailing spaces not allowed (2 instances)
  - **Issue**: Missing trailing comma
  - **Fix**: Remove trailing spaces and add trailing comma

- **File**: `src/components/PatientSummary.tsx`
  - **Issue**: Trailing spaces not allowed (2 instances)
  - **Issue**: Missing trailing comma
  - **Fix**: Remove trailing spaces and add trailing comma

#### Tailwind CSS Issues
- **File**: `src/components/note-generator/FormattedNote.tsx`
  - **Issue**: Classname '@container/note' is not a Tailwind CSS class
  - **Fix**: Replace with valid Tailwind class or add to Tailwind config

- **File**: `src/components/ui/toast.tsx`
  - **Issue**: Classname 'destructive' is not a Tailwind CSS class
  - **Fix**: Replace with valid Tailwind class or add to Tailwind config

#### Import Sorting
- **File**: `src/components/PatientSummary.tsx`
  - **Issue**: Run autofix to sort these imports
  - **Fix**: Sort imports according to project conventions

#### Other Issues
- **File**: `src/components/ConsultReminders.tsx`
  - **Issue**: Do not use item index in the array as its key (3 instances)
  - **Fix**: Use unique identifiers instead of array indices

- **File**: `src/components/analysis/AnalysisLevelSelector.tsx`
  - **Issue**: Do not use item index in the array as its key
  - **Fix**: Use unique identifiers instead of array indices

- **File**: `src/components/note-generator/NoteGenerationControls.tsx`
  - **Issue**: Do not use item index in the array as its key
  - **Fix**: Use unique identifiers instead of array indices

- **File**: `src/components/template-editor/TemplateEditor.tsx`
  - **Issue**: Do not use item index in the array as its key
  - **Fix**: Use unique identifiers instead of array indices

- **File**: `src/components/template-editor/VariableManager.tsx`
  - **Issue**: Do not use item index in the array as its key
  - **Fix**: Use unique identifiers instead of array indices

- **File**: `src/components/note-generator/FormattedNote.tsx`
  - **Issue**: Prefer `.textContent` over `.innerText`
  - **Fix**: Replace `.innerText` with `.textContent`

- **File**: `tailwind.config.ts`
  - **Issue**: A `require()` style import is forbidden
  - **Fix**: Replace with ES module import

## Implementation Strategy

1. **Fix one category at a time** in the order specified above
2. **Within each category, fix one file at a time**
3. **After each file fix, run the linter** to ensure no new issues were introduced
4. **Document any changes** that might affect other parts of the application
5. **Test functionality** after fixing each file to ensure no regressions

## Notes

- Some issues can be automatically fixed with `eslint --fix`
- For complex issues, manual intervention may be required
- Some fixes may require understanding the broader context of the application
- Accessibility fixes should be tested with screen readers when possible
- React hook dependency fixes may require restructuring code to avoid infinite loops

## Progress Tracking

| Category | Status | Notes |
|----------|--------|-------|
| Core Infrastructure Issues | Completed | Fixed mutable export in db.ts, unused parameters in migrations, and console statements in migrate.server.ts |
| TypeScript/JavaScript Language Issues | Not Started | |
| React-Specific Issues | Not Started | |
| Accessibility Issues | Not Started | |
| Styling and UI Issues | Not Started | |
