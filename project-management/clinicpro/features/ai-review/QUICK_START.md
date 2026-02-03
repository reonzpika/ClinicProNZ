# Quick Start Prompt for Cursor AI

Copy and paste this into Cursor AI after opening the implementation folder:

---

## PROMPT:

```
I have 8 files in this folder for implementing an AI Clinical Review feature.

IMPORTANT: These files are PROPOSED implementations that need to be 
adapted to match my actual codebase structure.

Please start by reading CURSOR_AI_INSTRUCTIONS.md carefully. 
It contains critical warnings and step-by-step instructions.

Your job is to:
1. Examine my actual codebase structure
2. Identify where the proposed code differs from my actual structure
3. Adapt the implementation to match my existing patterns
4. Ask me questions when integration points are unclear

DO NOT blindly copy code. VALIDATE and ADAPT each step.

Key things to verify before proceeding:
- Where are my API routes actually located?
- Where is my database schema file?
- Where are my React components organized?
- What are my actual import path patterns?
- Where are the camera/referral icons rendered in the UI?

Start by confirming you've read CURSOR_AI_INSTRUCTIONS.md and 
tell me what you need to verify before beginning implementation.
```

---

## Expected Response from Cursor:

Cursor should respond with something like:

"I've read CURSOR_AI_INSTRUCTIONS.md. Before implementing, I need to verify:

1. Your actual API route structure (checking app/api/)
2. Your database schema location (checking for schema files)
3. Your component organization pattern (checking src/ or components/)
4. Where camera/referral icons are rendered (searching codebase)
5. Your import path aliases (checking tsconfig.json)

Let me examine the codebase and report back what I find..."

---

## If Cursor Starts Copying Without Validation:

STOP IT and say:

```
STOP - you're copying code without validating against the actual codebase.

Go back and read the warning at the top of CURSOR_AI_INSTRUCTIONS.md.

Before implementing anything, show me:
1. Where you found the camera/referral icons in MY codebase
2. What MY actual API route structure looks like
3. Where MY database schema file is located
4. What MY import paths actually are

Don't proceed until you've verified these against my actual code.
```

---

## Good Signs Cursor is Doing it Right:

✅ Asks questions about your actual structure
✅ Shows you what it found in your codebase
✅ Proposes adaptations to match your patterns
✅ Verifies integration points before implementing
✅ Runs type checking after each step

## Bad Signs Cursor is Doing it Wrong:

❌ Immediately starts creating files without checking
❌ Uses assumed paths without verification
❌ Doesn't ask any questions
❌ Creates files in locations that don't exist
❌ Proceeds despite import errors

---

## Troubleshooting:

**If Cursor can't find where to add the button:**
- Tell it to search for "camera" or "referral" in the codebase
- Or manually point it to the specific file/line number

**If imports fail:**
- Tell Cursor to check tsconfig.json for path mappings
- Point it to similar imports in existing files

**If database migration fails:**
- Verify your database connection
- Check if the schema file location is correct
- Confirm users and patientSessions tables exist

**If build errors occur:**
- Run `pnpm type-check` to see specific errors
- Ask Cursor to fix import paths first
- Verify all dependencies are installed

---

## After Implementation:

1. Verify the development server starts: `pnpm dev`
2. Check the consultation page loads without errors
3. Verify the AI Review button appears
4. Add your Anthropic API key to .env.local
5. Test each module with sample consultation notes

---

Good luck! The key is to make Cursor VALIDATE first, ADAPT second, IMPLEMENT last.
