# FHIR MCP Server Setup Guide

**Date**: 2025-11-09  
**Status**: Configured for HAPI FHIR test server  
**Purpose**: FHIR development tool for learning, exploration, and prototyping

---

## Overview

The FHIR MCP Server is a Model Context Protocol (MCP) server that provides AI-assisted FHIR API interaction through tools like VS Code and Claude Desktop. It allows you to explore FHIR resources, test queries, and prototype implementations.

**Repository**: https://github.com/wso2/fhir-mcp-server

---

## Important Limitation: Medtech ALEX API

⚠️ **The FHIR MCP Server CANNOT connect directly to Medtech ALEX API** because:

1. ALEX requires custom HTTP headers that the MCP server doesn't inject:
   - `mt-facilityid`: Practice facility identifier
   - `mt-correlationid`: Request correlation UUID
   - `mt-appid`: Application identifier (e.g., "ClinicPro")

2. ALEX uses Azure AD OAuth2 with specific scopes that may not align with standard FHIR auth flows

### What This Means

**✅ Use FHIR MCP Server for:**
- Learning FHIR R4 operations (search, read, create, update, delete)
- Understanding FHIR resource structures (Patient, Media, Observation, etc.)
- Testing queries on public FHIR servers (HAPI)
- Prototyping queries before implementing in your BFF
- Exploring FHIR capabilities and search parameters

**❌ Do NOT use FHIR MCP Server for:**
- Direct Medtech ALEX API testing (use your BFF at api.clinicpro.co.nz)
- Production ALEX queries
- Debugging ALEX-specific issues (facility IDs, custom headers, etc.)

---

## Installation

### Prerequisites

- Python 3.8+
- `uv` package manager (installed via `curl -LsSf https://astral.sh/uv/install.sh | sh`)

### Install FHIR MCP Server

```bash
# uv/uvx is already installed in this workspace
export PATH="$HOME/.local/bin:$PATH"

# Test installation (downloads and runs server)
uvx fhir-mcp-server --help
```

---

## Configuration

### Environment File

Configuration is stored in `.fhir-mcp-server.env` at workspace root:

```bash
# Default: Public HAPI FHIR Test Server (no auth required)
FHIR_SERVER_BASE_URL=https://hapi.fhir.org/baseR4
FHIR_SERVER_DISABLE_AUTHORIZATION=True

# MCP Server Settings
FHIR_MCP_HOST=localhost
FHIR_MCP_PORT=8000
FHIR_MCP_REQUEST_TIMEOUT=30
```

### VS Code Integration

The MCP server is configured in `.vscode/settings.json`:

```json
{
  "mcp": {
    "servers": {
      "fhir": {
        "type": "http",
        "url": "http://localhost:8000/mcp"
      }
    }
  }
}
```

---

## Running the Server

### Start Server

```bash
cd /workspace
export PATH="$HOME/.local/bin:$PATH"

# Load environment variables
set -a
source .fhir-mcp-server.env
set +a

# Start server (background process)
nohup uvx fhir-mcp-server --transport streamable-http --log-level INFO > /tmp/fhir-mcp-server.log 2>&1 &
```

### Check Server Status

```bash
# View logs
tail -f /tmp/fhir-mcp-server.log

# Test connectivity
curl http://localhost:8000/health

# Stop server (if needed)
pkill -f fhir-mcp-server
```

---

## Available Tools

The FHIR MCP Server exposes these tools for AI assistants:

1. **`get_capabilities`**: Retrieve FHIR server capabilities and resource metadata
   - Parameters: `type` (resource type, e.g., "Patient", "Observation")

2. **`search`**: Search for FHIR resources
   - Parameters: `type` (resource type), `searchParam` (search parameters object)
   - Example: Search for patients by name, birthdate, etc.

3. **`read`**: Read a specific FHIR resource by ID
   - Parameters: `type`, `id`, optional `searchParam`, optional `operation`

4. **`create`**: Create a new FHIR resource
   - Parameters: `type`, `payload` (FHIR resource JSON)

5. **`update`**: Update an existing FHIR resource
   - Parameters: `type`, `id`, `payload`

6. **`delete`**: Delete a FHIR resource
   - Parameters: `type`, `id`

7. **`get_user`**: Get authenticated user's FHIR resource (Patient, Practitioner, etc.)

---

## Example Usage in VS Code

Once configured, you can ask VS Code Copilot (or Claude) to interact with FHIR:

```
"Search for all Patient resources with family name 'Simpson'"

"Show me the capabilities of the Observation resource type"

"Create a new Patient resource with name 'John Doe', birthdate '1990-01-01'"

"Read Patient resource with ID 'example'"
```

The AI will use the FHIR MCP tools to execute these requests against the configured FHIR server (HAPI by default).

---

## Switching FHIR Servers

### Connect to Different HAPI Server

Edit `.fhir-mcp-server.env`:

```bash
# HAPI R4 server
FHIR_SERVER_BASE_URL=https://hapi.fhir.org/baseR4

# HAPI R5 server (newer FHIR version)
FHIR_SERVER_BASE_URL=https://hapi.fhir.org/baseR5
```

### Connect to Your Own FHIR Server

If you have a FHIR server that doesn't require custom headers:

```bash
FHIR_SERVER_BASE_URL=https://your-fhir-server.com/fhir
FHIR_SERVER_DISABLE_AUTHORIZATION=True

# Or with OAuth2
FHIR_SERVER_DISABLE_AUTHORIZATION=False
FHIR_SERVER_CLIENT_ID=your-client-id
FHIR_SERVER_CLIENT_SECRET=your-secret
FHIR_SERVER_SCOPES=openid fhirUser patient/*.read
```

After changing configuration:
1. Restart the MCP server
2. Reload VS Code

---

## Troubleshooting

### Server Won't Start

```bash
# Check if port 8000 is already in use
lsof -i :8000

# Kill existing process
pkill -f fhir-mcp-server

# Check logs
tail -f /tmp/fhir-mcp-server.log
```

### VS Code Doesn't See MCP Server

1. Ensure VS Code version is 1.101+ (MCP support)
2. Restart VS Code after editing `settings.json`
3. Check that server is running: `curl http://localhost:8000/mcp`
4. Check VS Code Developer Tools console for errors

### Connection Timeout

Increase timeout in `.fhir-mcp-server.env`:

```bash
FHIR_MCP_REQUEST_TIMEOUT=60  # 60 seconds
```

---

## Future: Connecting to ALEX API

If you want to connect the MCP server to ALEX in the future, you would need to:

1. **Fork the MCP server repository**
2. **Modify the FHIR client** to inject custom headers:
   ```python
   headers = {
       "Authorization": f"Bearer {token}",
       "mt-facilityid": os.getenv("MEDTECH_FACILITY_ID"),
       "mt-correlationid": str(uuid.uuid4()),
       "mt-appid": "ClinicPro"
   }
   ```
3. **Add environment variables** for Medtech-specific config
4. **Test with ALEX UAT**

This is NOT currently implemented. For now, use your BFF for ALEX testing.

---

## Alternative: Use BFF as FHIR Proxy (Future Enhancement)

Another option would be to create a FHIR-compatible proxy endpoint in your BFF that:
1. Accepts standard FHIR requests
2. Injects Medtech custom headers
3. Forwards to ALEX API
4. Returns FHIR responses

This would allow the MCP server to connect to your BFF proxy instead of directly to ALEX.

**Implementation**: Not done yet, but could be added to `lightsail-bff` if needed.

---

## Resources

- **FHIR MCP Server Repo**: https://github.com/wso2/fhir-mcp-server
- **FHIR R4 Specification**: https://hl7.org/fhir/R4/
- **HAPI FHIR Test Server**: https://hapi.fhir.org/
- **Model Context Protocol**: https://modelcontextprotocol.io/
- **VS Code MCP Support**: https://code.visualstudio.com/docs/mcp

---

## Next Steps for Medtech Integration

Since the MCP server doesn't work with ALEX directly, continue using your existing workflow:

1. **For ALEX API testing**: Use BFF test endpoints
   - `GET /api/medtech/test?nhi=ZZZ0016`
   - `GET /api/medtech/token-info`

2. **For FHIR learning**: Use this MCP server with HAPI

3. **For prototyping**: Test queries on HAPI, then implement in BFF

4. **For production**: Deploy BFF features, not MCP server

---

*Document Created: 2025-11-09*  
*Last Updated: 2025-11-09*
