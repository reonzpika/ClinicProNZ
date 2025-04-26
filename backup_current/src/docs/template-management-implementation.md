# Template Management Implementation Plan

## Current State ✅
- Templates managed in database with full CRUD operations
- Four base system templates implemented:
  - Multi-problem SOAP
  - 6 Week Check
  - Driver License Medical
  - ACC Initial
- Full database integration with version control
- Templates used in `NoteGenerationControls.tsx`
- Enhanced note generation via `useNoteGeneration.ts`
- AI-powered content generation

## Phase 1: Database and Type Enhancement ✅

### Database Schema Update ✅
```typescript
// src/models/Schema.ts - Implemented
export const templateSchema = pgTable('template', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).$type<TemplateType>().notNull(),
  content: text('content').notNull(),
  structure: jsonb('structure').notNull(),
  variables: jsonb('variables').notNull(),
  version: integer('version').default(1).notNull(),
  isLatest: boolean('is_latest').default(true).notNull(),
  isSystem: boolean('is_system').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  parentId: integer('parent_id').references(() => templateSchema.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const templateSectionSchema = pgTable('template_section', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').references(() => templateSchema.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Type Definitions ✅
```typescript
// src/types/templates.ts - Implemented
export type Template = InferModel<typeof templateSchema>;
export type NewTemplate = InferModel<typeof templateSchema, 'insert'>;
export type TemplateSection = InferModel<typeof templateSectionSchema>;
export type NewTemplateSection = InferModel<typeof templateSectionSchema, 'insert'>;

export type TemplateType = 'multi-problem' | 'specialized' | 'follow-up' | 'assessment';

export type TemplateVariable = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue: string;
  description?: string;
};

export type TemplateWithSections = {
  sections: TemplateSection[];
  variables: Record<string, TemplateVariable>;
  type: TemplateType;
  isSystem: boolean;
} & Template;
```

## Phase 2: Template Management Interface ✅

### Template List View ✅
```typescript
// src/app/(auth)/template-management/page.tsx - Implemented
export default function TemplateManagementPage() {
  // Features implemented:
  // - Template listing with filters
  // - Search functionality
  // - Type filtering
  // - Version management
  // - CRUD operations
  // - System template copying
}
```

### Template Editor Component ✅
```typescript
// src/components/template-editor/TemplateEditor.tsx - Implemented
export function TemplateEditor({ template, isNew, onSave }: TemplateEditorProps) {
  // Features implemented:
  // - Full template editing
  // - Section management
  // - Variable management
  // - Preview functionality
  // - Validation
}
```

### Section Builder & Variable Manager ✅
```typescript
// Components implemented in src/components/template-editor/
-SectionBuilder.tsx
- VariableManager.tsx;
```

## Phase 3: Template Storage and Retrieval ✅

### Template Service ✅
```typescript
// src/services/template.service.ts - Implemented
export class TemplateService {
  static async create(template: NewTemplate): Promise<Template>;
  static async getById(id: number): Promise<Template | null>;
  static async getWithSections(id: number): Promise<TemplateWithSections | null>;
  static async getAllByUserId(userId: string): Promise<Template[]>;
  static async update(id: number, template: Partial<Template>, createNewVersion = false): Promise<Template>;
  static async delete(id: number): Promise<void>;
  static async getVersions(id: number): Promise<Template[]>;
  static async copySystemTemplate(templateId: number, userId: string): Promise<Template>;
}
```

## Phase 4: Note Generation Enhancement ✅

### Enhanced Services ✅
```typescript
// Implemented services:
-NoteGenerationService
- PromptConfigService
- AIProcessingService;
```

### Note Generation API ✅
```typescript
// src/app/api/generate-notes/route.ts - Implemented
export async function POST(request: Request) {
  // Features implemented:
  // - Template loading
  // - Variable processing
  // - AI-powered content generation
  // - Error handling
  // - Response formatting
}
```

## Phase 5: UI Integration 🔄

### 1. Enhanced Template Selection
```typescript
// src/components/note-generator/NoteGenerationControls.tsx
export function NoteGenerationControls() {
  // Tasks:
  // 1.1. Template Browser ✅
  //   - Grid/list view of available templates
  //   - Template type filtering
  //   - Search functionality
  //   - Preview on hover/select
  // Implementation: src/components/template-management/TemplateBrowser.tsx

  // 1.2. Template Configuration Panel ✅
  //   - Variable input fields based on template
  //   - Section visibility toggles
  //   - Order customization
  //   - Save preferences per template
  // Implementation: src/components/template-management/TemplateConfigPanel.tsx

  // 1.3. Analysis Options ✅
  //   - Analysis level selection (basic/detailed/comprehensive)
  //   - Conciseness level selection
  //   - AI processing options
  // Implementation: src/components/note-generator/AnalysisOptions.tsx
}
```

### 2. Template Management Routes
```typescript
// Implementation Status: ✅ Complete
// - src/app/(auth)/template-management/page.tsx
//   - Template listing with TemplateBrowser
//   - Create new template button
//   - Navigation handling

// - src/app/(auth)/template-management/new/page.tsx
//   - New template creation
//   - Template editor integration
//   - Success/error notifications

// - src/app/(auth)/template-management/[id]/page.tsx
//   - Template editing
//   - Loading states
//   - Back navigation
//   - Success/error notifications
```

### 3. Template Preview Component
```typescript
// src/components/template-preview/TemplatePreview.tsx
type TemplatePreviewProps = {
  template: Template;
  variables?: Record<string, any>;
};

// Tasks:
// 2.1. Live Preview ✅
//   - Real-time variable interpolation
//   - Section structure visualization
//   - Formatting preview

// 2.2. Sample Data Display ✅
//   - Example note generation
//   - Variable placeholder visualization
//   - Section content previews

// 2.3. Interactive Elements ✅
//   - Section collapse/expand
//   - Variable value quick edit
//   - Format switching (detailed/concise/bullet)
```

### 4. Integration with Note Generation
```typescript
// Tasks:
// 3.1. Template-Note Synchronization ✅
//   - Real-time template updates
//   - Variable validation
//   - Error handling

// 3.2. AI Processing Integration ✅
//   - Progress indicators
//   - Cancel/retry options
//   - Error recovery

// 3.3. Output Formatting ✅
//   - Consistent styling
//   - Export options
//   - Print layout
```

### 5. User Experience Enhancements
```typescript
// Tasks:
// 4.1. Loading States ✅
//   - Skeleton loaders in TemplateBrowser
//   - Progress indicators in edit/new pages
//   - Transition animations

// 4.2. Error Handling ✅
//   - User-friendly error messages
//   - Recovery options
//   - Validation feedback

// 4.3. Responsive Design ✅
//   - Mobile-friendly layout
//   - Touch interactions
//   - Adaptive UI
```

### 6. Performance Optimization (Not to be worked on for now)
```typescript
// Tasks:
// 5.1. Template Caching ⏳
//   - Local storage for frequently used templates
//   - Version checking
//   - Cache invalidation

// 5.2. Lazy Loading ⏳
//   - Dynamic imports
//   - Component code splitting
//   - Resource optimization

// 5.3. State Management ⏳
//   - Efficient updates
//   - Memory management
//   - Event debouncing
```

## Implementation Priority
1. 🔴 High Priority
   - ✅ Template Browser (1.1)
   - ✅ Template Configuration Panel (1.2)
   - ✅ Live Preview (2.1)
   - ✅ Template-Note Synchronization (3.1)

2. 🟡 Medium Priority
   - ✅ Analysis Options (1.3)
   - ✅ Sample Data Display (2.2)
   - ✅ AI Processing Integration (3.2)
   - ✅ Error Handling (4.2)

3. 🟢 Low Priority
   - ✅ Interactive Elements (2.3)
   - ✅ Output Formatting (3.3)
   - ✅ Loading States (4.1)
   - ✅ Responsive Design (4.3)
   - ⏳ Performance Optimization (5.1-5.3)

## Status Summary
- ✅ Phase 1: Database & Types - Complete
- ✅ Phase 2: Template Management UI - Complete
- ✅ Phase 3: Template Storage - Complete
- ✅ Phase 4: Note Generation - Complete
- 🔄 Phase 5: UI Integration - In Progress
  - ⏳ Tasks Planned: 15
  - ✅ Tasks Completed: 13
