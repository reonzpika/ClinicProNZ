# Phase 3: Component Migration Plan

## Components Using ConsultationContext (29 total)

### Priority 1: Simple Components (Low Risk) - Start Here
These components use minimal state and have few dependencies.

| Component | File | Primary Usage | Risk Level |
|-----------|------|---------------|------------|
| `InputModeToggle` | `/src/features/clinical/main-ui/components/InputModeToggle.tsx` | `inputMode`, `setInputMode` | 🟢 **Low** |
| `DocumentationSettingsBadge` | `/src/features/clinical/main-ui/components/DocumentationSettingsBadge.tsx` | `templateId`, `MULTIPROBLEM_SOAP_UUID` | 🟢 **Low** |
| `TypedInput` | `/src/features/clinical/main-ui/components/TypedInput.tsx` | `typedInput`, `setTypedInput` | 🟢 **Low** |
| `AdditionalNotes` | `/src/features/clinical/main-ui/components/AdditionalNotes.tsx` | `consultationNotes`, `setConsultationNotes` | 🟢 **Low** |
| `TemplateSelector` | `/src/features/templates/components/TemplateSelector.tsx` | `templateId`, `setTemplateId` | 🟢 **Low** |
| `useSelectedTemplate` | `/src/features/templates/hooks/useSelectedTemplate.ts` | `templateId`, `userDefaultTemplateId` | 🟢 **Low** |

### Priority 2: Medium Components (Medium Risk) - Migrate Next
These components use moderate state but are self-contained.

| Component | File | Primary Usage | Risk Level |
|-----------|------|---------------|------------|
| `AudioSettingsModal` | `/src/features/clinical/mobile/components/AudioSettingsModal.tsx` | Audio settings | 🟡 **Medium** |
| `GeneratedNotes` | `/src/features/clinical/main-ui/components/GeneratedNotes.tsx` | `generatedNotes` display | 🟡 **Medium** |
| `AccCodeSuggestions` | `/src/features/clinical/right-sidebar/components/AccCodeSuggestions.tsx` | Consultation items | 🟡 **Medium** |
| `ChecklistTab` | `/src/features/clinical/right-sidebar/components/ChecklistTab.tsx` | Consultation items | 🟡 **Medium** |
| `DifferentialDiagnosisTab` | `/src/features/clinical/right-sidebar/components/DifferentialDiagnosisTab.tsx` | Consultation items | 🟡 **Medium** |
| `ExaminationChecklistModal` | `/src/features/clinical/examination-checklist/components/ExaminationChecklistModal.tsx` | Modal state | 🟡 **Medium** |
| `PlanSafetyNettingModal` | `/src/features/clinical/plan-safety-netting/components/PlanSafetyNettingModal.tsx` | Modal state | 🟡 **Medium** |
| `TemplateSelectorModal` | `/src/features/templates/components/TemplateSelectorModal.tsx` | Template selection | 🟡 **Medium** |

### Priority 3: Complex Components (High Risk) - Migrate Last
These components have complex dependencies and multiple state interactions.

| Component | File | Primary Usage | Risk Level |
|-----------|------|---------------|------------|
| `ChatbotWidget` | `/src/features/clinical/right-sidebar/components/ChatbotWidget.tsx` | Chat history, loading | 🔴 **High** |
| `ClinicalImageTab` | `/src/features/clinical/right-sidebar/components/ClinicalImageTab.tsx` | Clinical images | 🔴 **High** |
| `TranscriptionControls` | `/src/features/clinical/main-ui/components/TranscriptionControls.tsx` | Transcription logic | 🔴 **High** |
| `ConsultationInputHeader` | `/src/features/clinical/main-ui/components/ConsultationInputHeader.tsx` | Multiple state | 🔴 **High** |
| `useTranscription` | `/src/features/clinical/main-ui/hooks/useTranscription.ts` | Core transcription | 🔴 **High** |
| `MobileRecordingQRV2` | `/src/features/clinical/mobile/components/MobileRecordingQRV2.tsx` | Mobile state | 🔴 **High** |
| `UsageDashboard` | `/src/features/clinical/right-sidebar/components/UsageDashboard.tsx` | Usage tracking | 🔴 **High** |

### Priority 4: Session Management (Critical) - Migrate Carefully
These components manage patient sessions and have server state dependencies.

| Component | File | Primary Usage | Risk Level |
|-----------|------|---------------|------------|
| `PatientSessionManager` | `/src/features/clinical/session-management/components/PatientSessionManager.tsx` | Session CRUD | 🟠 **Critical** |
| `CurrentSessionBar` | `/src/features/clinical/session-management/components/CurrentSessionBar.tsx` | Current session | 🟠 **Critical** |
| `SessionModal` | `/src/features/clinical/session-management/components/SessionModal.tsx` | Session creation | 🟠 **Critical** |

### Priority 5: Main Pages (Final) - Test Thoroughly
These are the main entry points and should be migrated last.

| Component | File | Primary Usage | Risk Level |
|-----------|------|---------------|------------|
| `consultation/page.tsx` | `/app/(clinical)/consultation/page.tsx` | Main consultation page | 🔴 **Critical** |
| `templates/page.tsx` | `/app/(business)/templates/page.tsx` | Templates page | 🟡 **Medium** |

## Migration Strategy

### Phase 3.1: Foundation (Priority 1)
**Goal**: Migrate 6 simple components with minimal risk

**Steps**:
1. Update imports from `useConsultation` to `useConsultationStores`
2. Test each component individually
3. Verify no breaking changes
4. Deploy incrementally

**Estimated Time**: 1-2 hours

### Phase 3.2: Building Momentum (Priority 2)
**Goal**: Migrate 8 medium-complexity components

**Steps**:
1. Update imports one component at a time
2. Test interaction between components
3. Verify modal behaviors and state persistence
4. Monitor for any performance regressions

**Estimated Time**: 2-3 hours

### Phase 3.3: Complex Migration (Priority 3)
**Goal**: Migrate 7 high-complexity components

**Steps**:
1. Careful analysis of each component's state usage
2. Update imports with extensive testing
3. Verify transcription and chat functionality
4. Test mobile integration thoroughly

**Estimated Time**: 3-4 hours

### Phase 3.4: Session Management (Priority 4)
**Goal**: Migrate 3 session management components

**Steps**:
1. Ensure React Query integration works correctly
2. Test session CRUD operations
3. Verify patient session persistence
4. Test session switching functionality

**Estimated Time**: 2 hours

### Phase 3.5: Main Pages (Priority 5)
**Goal**: Migrate 2 main page components

**Steps**:
1. Comprehensive testing of main consultation flow
2. End-to-end testing of template management
3. Performance monitoring
4. User acceptance testing

**Estimated Time**: 2-3 hours

### Phase 3.6: Cleanup
**Goal**: Remove old ConsultationContext

**Steps**:
1. Verify no remaining imports of `useConsultation`
2. Remove `ConsultationProvider` from layout
3. Delete `ConsultationContext.tsx` file
4. Update documentation

**Estimated Time**: 1 hour

## Risk Mitigation

### Testing Strategy
1. **Component Level**: Test each migrated component individually
2. **Integration Level**: Test component interactions
3. **E2E Level**: Test complete user workflows
4. **Performance Level**: Monitor re-render frequency

### Rollback Plan
1. Keep `ConsultationContext.tsx` until all components migrated
2. Use feature flags to control which components use new stores
3. Monitor error rates in production
4. Have immediate rollback capability

### Quality Gates
- ✅ TypeScript compilation passes
- ✅ No runtime errors in console
- ✅ All user workflows work correctly
- ✅ Performance metrics maintained or improved
- ✅ No memory leaks detected

## Success Metrics

### Performance Goals
- **Re-render Reduction**: Maintain 80%+ reduction vs original
- **Memory Usage**: No memory leaks detected
- **Bundle Size**: Maintain 64% code reduction
- **Type Safety**: 100% TypeScript coverage maintained

### Functional Goals
- **Feature Parity**: All existing functionality preserved
- **User Experience**: No regression in UX
- **Data Integrity**: No data loss during migration
- **Error Handling**: Improved error states with new stores

**Total Estimated Time: 11-15 hours**
**Migration Risk: Moderate** (mitigated by gradual approach)
**Expected Benefits: Significant** (performance, maintainability, developer experience)