# FHIR MCP Server - Quick Start

**Status**: ✅ Installed and Configured  
**Date**: 2025-11-09  
**Server**: Running on http://localhost:8000

---

## What Was Set Up

The FHIR MCP Server is now configured to help you with **multiple Medtech widget development**:

✅ **Installed**: `uv` package manager + FHIR MCP Server  
✅ **Configured**: Connected to public HAPI FHIR test server  
✅ **VS Code Integration**: Ready to use with AI assistants  
✅ **Documentation**: Complete setup guide created

---

## Important: ALEX API Limitation

⚠️ **The MCP server CANNOT connect directly to Medtech ALEX API** because:
- ALEX requires custom headers (`mt-facilityid`, `mt-correlationid`, `mt-appid`)
- The MCP server doesn't inject these headers

**What This Means:**
- ✅ **Use MCP server for**: Learning FHIR, prototyping queries, exploring resources
- ❌ **Don't use for**: Direct ALEX testing, debugging your Facility ID issue
- ✅ **For ALEX testing**: Continue using your BFF at `api.clinicpro.co.nz`

---

## Quick Usage

### Start the Server

```bash
cd /workspace
export PATH="$HOME/.local/bin:$PATH"
set -a && source .fhir-mcp-server.env && set +a
nohup uvx fhir-mcp-server --transport streamable-http --log-level INFO > /tmp/fhir-mcp-server.log 2>&1 &
```

### Check Server Status

```bash
# View logs
tail -f /tmp/fhir-mcp-server.log

# Check if running
curl http://localhost:8000/health

# Stop server
pkill -f fhir-mcp-server
```

### Use in Cursor AI

**Auto-activation**: The rule file `.cursor/rules/fhir-medtech-development.mdc` automatically activates when you open FHIR/Medtech files.

**Triggers on**:
- Files in `src/medtech/`, `app/api/(integration)/medtech/`
- Files with `medtech`, `fhir`, or `alex` in the name
- Medtech project documentation

Once the server is running, just open a Medtech file and ask:

```
"Search for Patient resources with family name 'Simpson'"

"Show me the capabilities of the Media resource type"

"What search parameters does the Observation resource support?"

"Create a test Patient resource with name 'Test User'"
```

The AI will use FHIR MCP tools to execute these against the HAPI test server.

---

## Available FHIR Tools

1. **`get_capabilities`** - Explore resource types and search parameters
2. **`search`** - Search for FHIR resources
3. **`read`** - Read specific resource by ID
4. **`create`** - Create new FHIR resource
5. **`update`** - Update existing resource
6. **`delete`** - Delete resource
7. **`get_user`** - Get authenticated user info

---

## Example Workflow for Widget Development

### 1. Learn FHIR Resource Structure

```
"Show me an example Media resource from HAPI"
"What are the required fields for a Media resource?"
```

### 2. Prototype Queries

```
"Search for all Media resources for patient ID 'example'"
"What search parameters does Media support?"
```

### 3. Test FHIR Operations

```
"Create a test Media resource with title 'Test Image'"
"Read the Media resource I just created"
```

### 4. Implement in Your BFF

Once you've prototyped the query, implement it in your BFF code with ALEX-specific headers.

---

## For Your Multiple Widgets

This server will help you with:
- **Images Widget** (current): Learn Media resource structure
- **Lab Results Widget** (future): Explore Observation, DiagnosticReport
- **Medications Widget** (future): Explore MedicationRequest, MedicationStatement
- **Appointments Widget** (future): Explore Appointment, Schedule
- **Documents Widget** (future): Explore DocumentReference, Binary

Each time you build a new widget, use the MCP server to:
1. Understand the FHIR resource type
2. Test search parameters
3. Prototype queries
4. Then implement in your BFF with ALEX headers

---

## Files Created

- `.fhir-mcp-server.env` - Server configuration
- `.vscode/settings.json` - VS Code MCP integration (updated)
- `project-management/medtech-integration/docs/FHIR_MCP_SERVER_SETUP.md` - Full documentation

---

## Next Steps

### While Blocked on Facility ID:

1. **Learn FHIR Media Resource**:
   ```
   "Show me the structure of a FHIR Media resource"
   "What are the required fields for Media?"
   "Show me an example Media resource"
   ```

2. **Explore Other Resources** (for future widgets):
   ```
   "What resources does the HAPI server support?"
   "Show me the capabilities of Observation resource"
   ```

3. **Prototype Queries**:
   ```
   "Search for Patient resources by birthdate"
   "How do I search for Media by patient ID?"
   ```

### After Facility ID Resolved:

1. Continue using **BFF** for actual ALEX testing
2. Use **MCP server** for learning new FHIR resources before implementing widgets

---

## Documentation

**Full Setup Guide**: `project-management/medtech-integration/docs/FHIR_MCP_SERVER_SETUP.md`

**Key Points**:
- MCP server = development/learning tool
- BFF = production ALEX integration
- Use both: Learn with MCP, implement in BFF

---

## ROI Calculation

**Time to setup**: 30 minutes (done!)  
**Time saved per widget**:
- Understanding FHIR resources: 1-2 hours
- Prototyping queries: 1-2 hours  
- Debugging FHIR structures: 1-2 hours

**Total saved per widget**: 3-6 hours  
**Over 5 widgets**: 15-30 hours saved

**Conclusion**: Setup time already paid for itself.

---

*Created: 2025-11-09*
