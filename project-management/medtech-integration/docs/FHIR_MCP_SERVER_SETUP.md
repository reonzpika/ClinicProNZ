# FHIR MCP Server Setup Guide

## Overview

This document details the setup and configuration of the FHIR MCP (Model Context Protocol) server for medtech widget development. The MCP server provides AI-assisted access to FHIR resources, enabling efficient exploration, prototyping, and development of FHIR-based integrations.

## Purpose

The FHIR MCP server setup serves as an **infrastructure investment** for multi-widget development:

- **Accelerates FHIR Learning**: Interactive exploration of FHIR resources and specifications
- **Simplifies Prototyping**: Quick testing of FHIR queries and response structures
- **Reduces Development Time**: AI-assisted FHIR resource handling and validation
- **Improves Code Quality**: Schema validation and type-safe FHIR operations

## Architecture

```
┌─────────────────┐
│   Cursor AI     │
│   (with MCP)    │
└────────┬────────┘
         │
         ├─ MCP FHIR Server
         │  (npx @modelcontextprotocol/server-fhir)
         │
         └─ HAPI FHIR Test Server
            (http://hapi.fhir.org/baseR4)

Production Flow (Separate):
┌─────────────────┐
│  Widget         │
│  Components     │
└────────┬────────┘
         │
         ├─ Custom Gateway
         │  (with auth headers)
         │
         └─ ALEX API
            (Production FHIR server)
```

## Installation & Configuration

### 1. Environment Configuration

Created `.fhir-mcp-server.env` in the project root:

```env
# FHIR MCP Server Configuration
# This configuration connects to the HAPI FHIR test server for learning and prototyping

# FHIR Server Base URL - HAPI FHIR Test Server
FHIR_BASE_URL=http://hapi.fhir.org/baseR4

# Local MCP Server Configuration
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8000

# FHIR Version
FHIR_VERSION=R4

# Authentication (not required for HAPI test server)
# FHIR_AUTH_TYPE=none

# Note: This setup uses the public HAPI FHIR test server
# For production use with ALEX API, custom authentication headers would be required
# which are not supported by the standard FHIR MCP server
```

### 2. VS Code Integration

Updated `.vscode/settings.json` to enable MCP server:

```json
{
  "mcp.servers": {
    "fhir": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fhir"],
      "env": {
        "FHIR_BASE_URL": "http://hapi.fhir.org/baseR4"
      }
    }
  }
}
```

**How it works:**
- MCP server runs on-demand via `npx`
- Uses the HAPI FHIR test server as the backend
- Automatically available in Cursor AI chat when needed

### 3. Context-Aware Rule

Created `.cursor/rules/fhir-medtech-development.mdc` for automatic activation:

```yaml
---
description: FHIR and Medtech Development Guidelines with MCP Tools
globs:
  - "app/(medtech)/**"
  - "src/components/medtech/**"
  - "src/lib/fhir/**"
  - "src/hooks/fhir/**"
  - "**/*fhir*.{ts,tsx}"
  - "**/*medtech*.{ts,tsx}"
  - "project-management/medtech-integration/**"
---
```

**Auto-activation triggers:**
- Working in medtech app routes
- Editing FHIR-related components
- Modifying FHIR libraries or hooks
- Working with files containing "fhir" or "medtech" in the name
- Editing medtech integration documentation

**What it provides:**
- Automatic guidance on using MCP FHIR tools
- ALEX API standards and best practices
- FHIR R4 compliance reminders
- Widget development patterns

### 4. Documentation

Created comprehensive documentation:

- **FHIR_MCP_QUICKSTART.md**: Quick reference for developers
- **This file**: Detailed setup and architecture documentation

## Using the MCP Server

### In Development

When working with FHIR-related files:

1. **Open a file** that matches the glob patterns (e.g., `app/(medtech)/patient-widget.tsx`)
2. **Start a Cursor chat** - the FHIR context is automatically active
3. **Ask FHIR-related questions**:
   - "Show me the structure of a FHIR Patient resource"
   - "Query for observations with category 'vital-signs'"
   - "How do I handle FHIR Bundle pagination?"
   - "Validate this FHIR Observation object"

### Available MCP Tools

The AI has access to tools for:

- **Resource Queries**: Search and retrieve FHIR resources
- **Schema Validation**: Validate resources against FHIR R4 schemas
- **Capability Discovery**: Explore what the FHIR server supports
- **Resource Creation**: Test creating new FHIR resources (on test server)
- **Bundle Handling**: Parse and navigate FHIR Bundle responses

### Example Workflows

#### Workflow 1: Exploring Patient Data

```typescript
// 1. Ask AI: "Show me example Patient resources from HAPI"
// AI uses MCP to query: GET /Patient?_count=5

// 2. AI explains the structure and shows actual data
// You see: resourceType, identifier, name, telecom, etc.

// 3. Ask: "Create TypeScript interface for Patient"
// AI generates typed interface based on real data

interface Patient {
  resourceType: 'Patient';
  id: string;
  identifier?: Identifier[];
  name?: HumanName[];
  telecom?: ContactPoint[];
  // ... rest of Patient fields
}
```

#### Workflow 2: Building an Observation Widget

```typescript
// 1. Ask: "What observations are available for patient X?"
// AI queries: GET /Observation?patient=X

// 2. Ask: "Show me vital signs observations"
// AI queries: GET /Observation?category=vital-signs

// 3. Ask: "Help me build a component to display these"
// AI generates component with proper TypeScript types
// based on actual FHIR response structure
```

#### Workflow 3: Validating FHIR Resources

```typescript
// 1. You write a FHIR resource object
const observation = {
  resourceType: 'Observation',
  status: 'final',
  code: { /* ... */ },
  // ... incomplete or incorrect structure
};

// 2. Ask: "Is this a valid FHIR Observation?"
// AI uses MCP to validate against FHIR R4 schema
// Points out missing required fields or incorrect structure
```

## Important Limitations

### Cannot Connect to ALEX API

**The MCP server cannot connect directly to the ALEX API** because:

1. **Custom Authentication Headers**: ALEX API requires proprietary authentication headers
2. **Standard MCP Limitation**: The FHIR MCP server only supports standard OAuth/Bearer token auth
3. **Security Requirements**: Custom headers can't be configured in the MCP server

### Workaround: Dual Approach

| Phase | Server | Purpose | Authentication |
|-------|--------|---------|----------------|
| **Development** | HAPI Test Server | Learning, exploration, prototyping | None (public) |
| **Production** | ALEX API | Real patient data, production widgets | Custom headers via gateway |

### Development Flow

```typescript
// During Development (with MCP + HAPI):
// - Use AI to explore FHIR structure
// - Prototype data transformations
// - Validate resource schemas
// - Build UI components

// For Production (with ALEX API):
// - Implement custom authentication gateway
// - Use same FHIR resource structures
// - Apply learned patterns from HAPI exploration
// - Deploy with proper error handling
```

## Production Gateway Implementation

For production use with ALEX API, you need a custom gateway:

```typescript
// src/lib/fhir/alex-gateway.ts

export async function fetchFromAlex(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const baseUrl = process.env.ALEX_API_BASE_URL;
  
  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      // Custom ALEX authentication headers
      'X-Alex-Auth': process.env.ALEX_AUTH_TOKEN,
      'X-Facility-Id': process.env.ALEX_FACILITY_ID,
      ...options?.headers,
    },
  });
}

// Usage in widget:
const response = await fetchFromAlex('/Patient/123');
const patient: Patient = await response.json();
```

## Benefits for Multi-Widget Development

This infrastructure investment provides:

### 1. Faster Onboarding
- New developers can explore FHIR interactively
- AI explains complex FHIR concepts with real examples
- Reduces learning curve for FHIR R4 specification

### 2. Consistent Development Patterns
- All widgets use the same FHIR resource types
- Validated against real FHIR schemas
- Type-safe TypeScript interfaces

### 3. Reduced Development Time
- Quick prototyping of FHIR queries
- Instant validation of resource structures
- AI-assisted data transformation logic

### 4. Better Code Quality
- Resources validated against FHIR R4 specification
- Proper error handling patterns
- Type-safe FHIR operations

### 5. Simplified Testing
- Test queries against HAPI server
- Mock responses based on real data
- Validate transformations before production

## Widget Development Checklist

When creating a new medtech widget:

- [ ] Explore relevant FHIR resources using MCP server
- [ ] Create TypeScript interfaces for FHIR resources
- [ ] Build data fetching hooks with proper types
- [ ] Implement UI components with loading/error states
- [ ] Test with HAPI test server
- [ ] Implement production gateway for ALEX API
- [ ] Add error handling for FHIR operations
- [ ] Document any custom FHIR extensions
- [ ] Add tests with mocked FHIR responses

## Troubleshooting

### MCP Server Not Available

**Symptom**: AI doesn't have access to FHIR tools

**Solutions**:
1. Check VS Code settings are loaded: Reload window
2. Verify `.vscode/settings.json` has MCP configuration
3. Ensure you're in a file that matches the glob patterns
4. Check Cursor MCP extension is enabled

### HAPI Server Unreachable

**Symptom**: FHIR queries fail with network errors

**Solutions**:
1. Check internet connectivity
2. Verify HAPI server is accessible: `curl http://hapi.fhir.org/baseR4/metadata`
3. Try alternative FHIR test server if HAPI is down

### Context Not Auto-Activating

**Symptom**: FHIR rules don't apply automatically

**Solutions**:
1. Check file path matches glob patterns in `.cursor/rules/fhir-medtech-development.mdc`
2. Reload Cursor window
3. Manually mention "using FHIR MCP tools" in chat

## Maintenance

### Updating FHIR Server

To change the FHIR server (e.g., to a different test server):

1. Update `.fhir-mcp-server.env`:
   ```env
   FHIR_BASE_URL=https://other-fhir-server.com/fhir
   ```

2. Update `.vscode/settings.json`:
   ```json
   "mcp.servers": {
     "fhir": {
       "env": {
         "FHIR_BASE_URL": "https://other-fhir-server.com/fhir"
       }
     }
   }
   ```

3. Reload VS Code window

### Adding Authentication (for other FHIR servers)

If using a FHIR server that requires standard OAuth:

```json
"mcp.servers": {
  "fhir": {
    "env": {
      "FHIR_BASE_URL": "https://secure-fhir-server.com/fhir",
      "FHIR_AUTH_TYPE": "bearer",
      "FHIR_AUTH_TOKEN": "${FHIR_TOKEN}"
    }
  }
}
```

**Note**: This still won't work with ALEX API's custom headers.

## Related Documentation

- FHIR MCP Quickstart - Quick reference guide
- ALEX API Review - ALEX API specifics
- Medtech Integration Summary - Overall project status
- Gateway Implementation - Production gateway guide

## Resources

- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [HAPI FHIR Documentation](https://hapifhir.io/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP FHIR Server](https://github.com/modelcontextprotocol/servers/tree/main/src/fhir)

## Summary

The FHIR MCP server setup provides a powerful development environment for medtech widgets:

✅ **Fast FHIR exploration** with AI assistance  
✅ **Type-safe development** with validated FHIR resources  
✅ **Quick prototyping** on HAPI test server  
✅ **Multi-widget infrastructure** for scalable development  

⚠️ **Limitation**: Cannot connect to ALEX API directly  
✅ **Solution**: Use for learning/prototyping, implement custom gateway for production  

This infrastructure investment reduces development time across multiple widgets while maintaining high code quality and FHIR compliance.
