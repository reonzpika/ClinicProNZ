# Test FHIR MCP Rule Activation

**Purpose**: Test that the context-aware rule activates properly

**Rule File**: `.cursor/rules/fhir-medtech-development.mdc`

---

## How to Test

### Step 1: Open a Medtech File

Open any of these files:
- `src/medtech/images-widget/components/CapturePanel.tsx`
- `app/api/(integration)/medtech/test/route.ts`
- `src/lib/services/medtech/alex-api-client.ts`

The rule should automatically activate (look for rule indicator in Cursor).

### Step 2: Ask FHIR Questions

With a Medtech file open, ask:

```
"What fields are required for a FHIR Media resource?"
```

**Expected behavior**: AI uses `get_capabilities('Media')` tool to fetch answer from MCP server.

### Step 3: Ask for FHIR Examples

```
"Show me an example Patient resource"
```

**Expected behavior**: AI uses `search(type='Patient')` tool to fetch examples from HAPI server.

### Step 4: Ask About FHIR Search Parameters

```
"What search parameters does Observation support?"
```

**Expected behavior**: AI uses `get_capabilities('Observation')` tool.

---

## What Should Happen

When the rule is active (Medtech file open):

✅ AI should **automatically use MCP tools** for FHIR questions  
✅ AI should **reference existing services** (OAuth, ALEX client)  
✅ AI should **include ALEX headers** in code examples  
✅ AI should **remind about ALEX limitation** if trying to connect MCP directly  
✅ AI should **follow architecture standards** from the rule

---

## Sample Questions to Test

Copy/paste these into Cursor chat:

1. **FHIR Resource Structure**:
   ```
   What fields are required for a FHIR Media resource?
   ```

2. **FHIR Search Parameters**:
   ```
   What search parameters does the Patient resource support?
   ```

3. **Example Resources**:
   ```
   Show me an example Observation resource
   ```

4. **Prototyping Queries**:
   ```
   How do I search for all Media resources for a specific patient?
   ```

5. **Implementation Guidance**:
   ```
   How do I make a FHIR API call to ALEX to create a Media resource?
   ```

Expected: AI should use MCP tools for #1-4, and provide ALEX-specific implementation (with headers) for #5.

---

## Debugging

If the rule doesn't activate:

1. **Check file path matches glob patterns**:
   - Files must be in `medtech/`, contain `medtech`, `fhir`, or `alex` in name
   - Or be in `project-management/medtech-integration/`

2. **Reload Cursor**: Close and reopen Cursor

3. **Check rule file syntax**: Ensure `.cursor/rules/fhir-medtech-development.mdc` has valid YAML frontmatter

4. **Check MCP server is running**:
   ```bash
   curl http://localhost:8000/health
   ```

---

## Success Criteria

Rule is working correctly if:
- ✅ Opens Medtech file → rule activates
- ✅ Asks FHIR question → AI uses MCP tools
- ✅ AI references existing services
- ✅ AI includes ALEX headers in code examples
- ✅ AI doesn't try to connect MCP to ALEX directly

---

*Test file created: 2025-11-09*
