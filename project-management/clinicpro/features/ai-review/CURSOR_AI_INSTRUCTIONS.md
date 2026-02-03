# CURSOR AI AGENT - IMPLEMENTATION INSTRUCTIONS

## ⚠️ CRITICAL: THESE ARE PROPOSED PLANS - YOU MUST VALIDATE EVERYTHING

**READ THIS FIRST - DO NOT SKIP:**

The files provided represent a **PROPOSED IMPLEMENTATION** based on analysis of similar codebases. They are NOT guaranteed to match your actual project structure.

**THESE FILES ARE:**
✅ A detailed specification of what needs to be built  
✅ Working reference implementations  
✅ Starting points that need adaptation  

**THESE FILES ARE NOT:**
❌ Drop-in ready code  
❌ Guaranteed to match your import paths  
❌ Verified against your specific codebase  

---

You are being asked to implement an AI Clinical Review feature for a medical consultation application.

**YOUR RESPONSIBILITY:**
1. **DO NOT blindly copy files** - validate against actual codebase structure first
2. **CHECK all import paths** - they may differ from assumptions  
3. **VERIFY integration points** - confirm where components should be added
4. **STUDY existing patterns** - match the style and structure of existing code
5. **ADAPT code as needed** - fix paths, types, and patterns to match existing code
6. **TEST thoroughly** - ensure no breaking changes to existing functionality
7. **ASK questions early** - don't guess on critical integration decisions

**WORKFLOW:**
For each step:
1. Read the proposed implementation
2. Examine the actual codebase
3. Identify differences
4. Adapt the code to match actual structure
5. Verify it works before moving to next step

**IF SOMETHING DOESN'T MATCH:** 
- Don't force it to work
- Adapt the provided code to match the actual codebase structure
- Ask the user if you're unsure about critical decisions
- Never break existing functionality

---

## CONTEXT (Assumptions - Verify These)
This appears to be a Next.js application with:
- TypeScript + React 19
- PostgreSQL database with Drizzle ORM
- Zustand for state management
- Existing consultation interface (location to be confirmed)
- Anthropic Claude API integration already present for note generation

**VERIFY:** Check your actual tech stack matches these assumptions.

## OBJECTIVE
Add a new "AI Review" feature that allows GPs to get clinical decision support suggestions on their consultation notes using Claude 3.5 Sonnet.

---

## FILES PROVIDED IN THIS FOLDER

1. `README.md` - Overview of the feature
2. `INTEGRATION_GUIDE.md` - Detailed implementation steps
3. `ai-review-route.ts` - API endpoint for AI review
4. `feedback-route.ts` - API endpoint for feedback tracking
5. `schema-update.ts` - Database schema additions
6. `AIReviewButton.tsx` - React component for the button
7. `AIReviewModal.tsx` - React component for the modal

---

## STEP-BY-STEP IMPLEMENTATION

**BEFORE EACH STEP:** 
- Examine the actual codebase structure
- Verify the step applies to this project
- Adapt file paths and imports as needed
- If a step conflicts with existing code, ask the user

---

### STEP 1: Environment Variable
**Action:** Add the Anthropic API key to environment configuration

**FIRST - VERIFY:** 
- Check what environment file is used (`.env.local`, `.env`, `.env.development`)
- Look for existing `ANTHROPIC_API_KEY` or other API keys
- Check if there's a different env var naming convention

**File to modify:** `.env.local` (or whatever env file you find)

**What to add:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-placeholder-key-will-be-added-by-user
```

**Verification:** File exists and contains the variable (actual key will be added by user later)

---

### STEP 2: Install NPM Package
**Action:** Add Anthropic SDK to dependencies

**Command to run:**
```bash
pnpm add @anthropic-ai/sdk
```

**Verification:** Check that `@anthropic-ai/sdk` appears in `package.json` dependencies

---

### STEP 3: Database Schema Update
**Action:** Add new table to database schema

**FIRST - VERIFY:**
- Find the actual schema file location (could be `database/migrations/schema.ts`, `src/db/schema.ts`, `db/schema.ts`, etc.)
- Check existing table definitions to match the coding style
- Verify import statements used for Drizzle types
- Check if there's a specific pattern for foreign keys
- Look for existing similar tables (like logging or tracking tables)

**File to modify:** Find the actual schema file (check multiple locations if needed)

**What to do:**
1. Open `database/migrations/schema.ts`
2. Find where other `pgTable` definitions are (like `patientSessions`, `users`)
3. Add the content from `schema-update.ts` to this file
4. Make sure to import necessary types if not already imported:
   ```typescript
   import { pgTable, uuid, text, integer, timestamp, foreignKey } from 'drizzle-orm/pg-core';
   ```

**Verification:** The `aiSuggestions` table definition is added to the schema file

**Then run:**
```bash
pnpm db:generate
pnpm db:push
```

**Verification:** Database migration completes without errors

---

### STEP 4: Create API Routes
**Action:** Create two new API endpoint files

**FIRST - VERIFY:**
- Check the actual API route structure (is it `app/api/` or different?)
- Look at existing API routes to understand the pattern
- Verify the authentication/RBAC pattern (`extractRBACContext`, `checkCoreAccess`)
- Check how database client is imported (`getDb`, `db`, etc.)
- Look for existing Anthropic API usage to match the pattern
- Verify error handling patterns used in other routes

**CRITICAL:** Do NOT copy the provided code blindly. Adapt it to match your existing API route patterns.

#### 4A: Main AI Review Endpoint
**File to create:** Confirm the path matches your API structure (likely `app/api/(clinical)/consultation/ai-review/route.ts`)

**What to do:**
1. Create the directory path if it doesn't exist: `app/api/(clinical)/consultation/ai-review/`
2. Create `route.ts` in that directory
3. Copy the entire content from `ai-review-route.ts` into this new file

**Verification:** File exists at `app/api/(clinical)/consultation/ai-review/route.ts`

#### 4B: Feedback Endpoint
**File to create:** `app/api/(clinical)/consultation/ai-review/feedback/route.ts`

**What to do:**
1. Create the directory: `app/api/(clinical)/consultation/ai-review/feedback/`
2. Create `route.ts` in that directory
3. Copy the entire content from `feedback-route.ts` into this new file

**Verification:** File exists at `app/api/(clinical)/consultation/ai-review/feedback/route.ts`

**Important:** Check that all imports in both route files resolve correctly:
- `@anthropic-ai/sdk` 
- `@/src/lib/rbac-enforcer`
- `database/client`
- `@/db/schema`

If any imports have wrong paths, fix them to match your project structure.

---

### STEP 5: Create React Components
**Action:** Create the UI components for the feature

**FIRST - VERIFY:**
- Check the actual component directory structure (is it `src/features/`, `src/components/`, `components/`, etc.?)
- Look at existing feature components to understand folder organization
- Verify UI component library imports (Dialog, Button) - check actual paths
- Check how other features use Zustand stores
- Look for existing modal patterns to match styling

**CRITICAL:** The provided components use assumed import paths. You MUST update these to match actual paths in the codebase.

#### 5A: Create Feature Directory
**What to do:**
First, check where other clinical features are located. Then create directory matching that pattern:
```bash
# Might be one of these - check your actual structure:
# src/features/clinical/ai-review/components
# src/components/clinical/ai-review
# features/ai-review/components
```

**Verification:** Directory exists at `src/features/clinical/ai-review/components/`

#### 5B: AI Review Button Component
**File to create:** `src/features/clinical/ai-review/components/AIReviewButton.tsx`

**What to do:**
1. Create the file in the components directory
2. Copy the entire content from `AIReviewButton.tsx`

**Verification:** File exists at the correct path

#### 5C: AI Review Modal Component
**File to create:** `src/features/clinical/ai-review/components/AIReviewModal.tsx`

**What to do:**
1. Create the file in the components directory
2. Copy the entire content from `AIReviewModal.tsx`

**Verification:** File exists at the correct path

**Important:** Verify all imports in both components resolve:
- `lucide-react` icons
- `@/src/shared/components/ui/dialog`
- `@/src/shared/components/ui/button`
- `@/src/hooks/useConsultationStores`

Fix any import paths if needed.

---

### STEP 6: Integrate Button into Consultation Interface
**Action:** Add the AI Review button to the left sidebar of the consultation page

**🚨 MOST CRITICAL STEP - DO NOT GUESS:**

**BEFORE DOING ANYTHING:**
1. **Search the codebase** for where camera/referral icons are rendered
2. **Find the exact file and component** that renders the consultation interface
3. **Study the existing button pattern** - don't break the UI
4. **Check if there's a specific component** for the icon toolbar
5. **Verify the styling approach** (Tailwind classes, CSS modules, etc.)

**STOP AND ASK USER IF:**
- You cannot find where camera/referral icons are rendered
- There are multiple possible locations
- The UI structure is unclear
- You're not 100% certain where to add the button

**File to find and modify:** 
DO NOT assume a file path. Search for:
- "camera" or "referral" or "clinical image" in the codebase
- Look for icon components (like `<Camera />`, `<FileText />`)
- Check consultation page components
- Look for toolbar or sidebar components

Possible locations (CHECK EACH):
- `app/(clinical)/ai-scribe/consultation/page.tsx` 
- `src/features/clinical/main-ui/components/GeneratedNotes.tsx`
- `src/components/consultation/Toolbar.tsx`
- Or any file containing consultation UI

**What to do:**

1. **Find the location:** Search for where the camera icon button is rendered. You're looking for something like:
   ```typescript
   <button ... camera/image related ...>
   ```

2. **Import the component at the top of the file:**
   ```typescript
   import { AIReviewButton } from '@/src/features/clinical/ai-review/components/AIReviewButton';
   ```

3. **Add the button next to existing icons:**
   ```typescript
   {/* Existing camera icon */}
   <button>📷</button> {/* or whatever the camera button looks like */}
   
   {/* Existing referral/document icon */}
   <button>📄</button> {/* or whatever the referral button looks like */}
   
   {/* NEW: AI Review button */}
   <AIReviewButton />
   ```

**Verification:** The AI Review button appears in the left sidebar next to camera/referral icons

**CRITICAL:** If you cannot find where to add the button, ask the user to point you to the exact file and location where the camera/referral icons are rendered.

---

### STEP 7: Update Database Schema Export
**Action:** Ensure the new table is exported from schema

**File to check:** `database/migrations/schema.ts` or wherever schema exports are

**What to verify:**
The `aiSuggestions` table should be exported so it can be imported in the API routes:
```typescript
export { aiSuggestions } from './schema';
```

If there's an index file (`database/index.ts` or `db/schema.ts`), make sure it re-exports the table.

**Verification:** Import works in route files without errors

---

### STEP 8: Type Checking and Linting
**Action:** Ensure code compiles without errors

**Commands to run:**
```bash
pnpm type-check
# or
pnpm tsc --noEmit

pnpm lint
```

**What to fix:** 
- Resolve any TypeScript errors
- Fix any linting issues
- Ensure all imports resolve correctly

**Verification:** No TypeScript or lint errors

---

### STEP 9: Test the Implementation
**Action:** Verify the feature works end-to-end

**Manual Testing Steps:**

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to the consultation page**

3. **Verify UI:**
   - ✓ AI Review button appears in left sidebar
   - ✓ Button is disabled when notes are empty
   - ✓ Button is enabled when notes have content

4. **Test each module:**
   
   **Red Flags Test:**
   - Enter a note with red flag symptoms:
     ```
     Main Problems: Back pain with bilateral leg weakness and urinary retention
     Objective: Reduced power both legs 3/5, reduced sensation
     ```
   - Click AI Review → Red Flags Scanner
   - Should flag cauda equina syndrome

   **DDx Test:**
   - Enter a note with chest pain
   - Click AI Review → Differential Diagnosis
   - Should suggest alternative diagnoses

   **Investigations Test:**
   - Enter a note missing obvious tests
   - Click AI Review → Investigation Advisor
   - Should suggest appropriate investigations

   **Management Test:**
   - Enter a note with diagnosis but incomplete plan
   - Click AI Review → Management Review
   - Should suggest treatment and safety netting

5. **Test feedback:**
   - Click 👍 or 👎 after reviewing
   - Verify buttons disable after clicking
   - Check database to confirm feedback saved

6. **Test error handling:**
   - Try with empty notes (should show validation)
   - Check error UI displays correctly

**Database Verification:**
```sql
SELECT * FROM ai_suggestions ORDER BY created_at DESC LIMIT 5;
```
Should show logged reviews with timestamps, tokens, etc.

---

## COMMON ISSUES AND SOLUTIONS

### Issue: Import errors in route files
**Solution:** Check the import paths match your project structure. Common differences:
- `@/src/lib/...` vs `@/lib/...`
- `database/client` vs `@/database/client`
- `@/db/schema` vs `database/schema`

### Issue: Dialog component not found
**Solution:** Verify the path to your UI components. It might be:
- `@/components/ui/dialog`
- `@/src/shared/components/ui/dialog`
- `@/src/components/ui/dialog`

### Issue: useConsultationStores hook not found
**Solution:** Find where this hook is defined in the codebase and update the import path

### Issue: Database migration fails
**Solution:** 
1. Check PostgreSQL connection
2. Verify foreign key references (`users`, `patientSessions`) exist
3. Check if table already exists: `DROP TABLE IF EXISTS ai_suggestions;`

### Issue: Button doesn't appear
**Solution:**
1. Check React component rendered without errors (check console)
2. Verify import path is correct
3. Check if parent component re-rendered
4. Inspect element to see if it's rendered but hidden

### Issue: API returns 500 error
**Solution:**
1. Check API route console logs for error details
2. Verify ANTHROPIC_API_KEY is set (placeholder is fine for now)
3. Check database connection
4. Verify all imports resolve

---

## VALIDATION CHECKLIST

**BEFORE Starting Implementation:**
- [ ] I have examined the actual codebase structure
- [ ] I understand the existing patterns for API routes, components, and database
- [ ] I have identified all import paths that need adjustment
- [ ] I have found where the camera/referral icons are rendered
- [ ] I have verified the environment variable setup
- [ ] I understand this is a PROPOSED plan that needs adaptation

**After Each Step:**
- [ ] Code compiles without TypeScript errors
- [ ] All imports resolve correctly
- [ ] No existing functionality is broken
- [ ] Changes follow existing code patterns

**Before Marking Complete:**
- [ ] `@anthropic-ai/sdk` installed in package.json
- [ ] `ANTHROPIC_API_KEY` added to correct env file
- [ ] `aiSuggestions` table in database schema (in actual schema file location)
- [ ] Database migration ran successfully
- [ ] API route created at ACTUAL api route location (verified structure)
- [ ] Feedback route created at ACTUAL api route location (verified structure)
- [ ] Components created in ACTUAL component directory (verified structure)
- [ ] AI Review button integrated into ACTUAL consultation interface (verified location)
- [ ] All import paths updated to match actual codebase
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No lint errors (`pnpm lint`)
- [ ] Development server starts without errors
- [ ] AI Review button visible in UI
- [ ] Can click button and see module options
- [ ] Can select a module and see loading state
- [ ] API endpoint responds (even with placeholder API key error)
- [ ] Database logs suggestions

---

## FINAL NOTES

**CRITICAL MINDSET:**
This is NOT a copy-paste job. You are adapting a proposed implementation to fit an actual codebase. Think of the provided files as a detailed specification, not gospel.

**YOUR JOB:**
1. Understand what needs to be built (the feature requirements)
2. Understand how it SHOULD be built (the provided implementation)  
3. Understand how it MUST be built (your actual codebase patterns)
4. Adapt #2 to match #3 while achieving #1

**WHEN TO ASK FOR HELP:**
- Integration points are unclear
- Existing patterns conflict with proposed approach
- Import paths don't resolve after reasonable attempts
- Database structure differs significantly
- You'd need to refactor existing code significantly

**WHEN TO PROCEED:**
- Pattern is clear and matches existing code
- Simple path adjustments needed
- Styling tweaks to match existing UI
- Minor type adjustments

---

**Additional Context:**

1. **API Key:** The actual Anthropic API key will be added by the user after implementation. The placeholder in `.env.local` is sufficient for now.

2. **Testing with real API:** User will need to add their API key from https://console.anthropic.com/ to fully test.

3. **Customization:** User may want to adjust prompt configurations in the API route based on their specific needs.

4. **Integration Point:** If you cannot find where to add the AI Review button (Step 6), STOP and ask the user to specify the exact file and line number where camera/referral icons are rendered.

5. **Import Paths:** This codebase likely uses path aliases. Check `tsconfig.json` for path mappings and adjust all imports accordingly.

6. **Existing Patterns:** Always match existing patterns rather than introducing new ones. Look at how other features are implemented and follow the same structure.

---

## QUESTIONS TO ASK USER (ASK EARLY, NOT AFTER BREAKING THINGS)

**BEFORE Starting (if any uncertainty):**

1. "I've examined the codebase. I found [X pattern/structure]. The provided implementation assumes [Y]. Should I adapt the implementation to match [X], or is there a reason to use [Y]?"

2. "I cannot locate where the camera and referral icons are rendered. I've searched [files A, B, C]. Can you point me to the exact file and line number?"

3. "The provided code uses import path `@/src/lib/rbac-enforcer` but I see the actual path is `@/lib/rbac`. Should I update all imports to match the actual structure?"

4. "I see the database schema is in [actual location] not [assumed location]. Should I proceed with adapting the schema to match your existing pattern?"

5. "The Dialog component appears to be at [actual path] not [assumed path]. I'll update the import - is this correct?"

6. "I notice your existing API routes use [pattern X] but the provided code uses [pattern Y]. Should I refactor to match your existing pattern?"

7. "The feedback route assumes we can find the most recent suggestion by user/session/reviewType. Is this approach appropriate for your data model, or should we use a different strategy?"

**CRITICAL RULE:** If you're uncertain about a structural decision or integration point, ASK FIRST. Don't implement something that might break existing functionality.

---

## SUCCESS CRITERIA

Implementation is complete when:
1. All files are in place
2. No build/type errors
3. AI Review button appears in the UI
4. Clicking the button shows 4 module options
5. Selecting a module opens a modal
6. Modal shows loading state
7. API responds (even if with "API key missing" error initially)
8. Database table exists and can store suggestions

User will handle:
- Adding real API key
- Testing with real consultation notes
- Collecting feedback data
- Iterating on prompts

---

**Good luck! Follow each step carefully and verify completion before moving to the next step.**
