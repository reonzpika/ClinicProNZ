# FHIR MCP Server Quickstart Guide

This guide will help you get started with the FHIR MCP (Model Context Protocol) server for FHIR resource exploration and development.

## Overview

The FHIR MCP server provides AI-assisted access to FHIR (Fast Healthcare Interoperability Resources) APIs, enabling you to:

- Query and explore FHIR resources
- Validate FHIR resource structures
- Prototype FHIR integrations
- Learn FHIR specifications interactively

## Configuration

The project is configured to use the public HAPI FHIR test server for development and learning.

### Environment Configuration

See `.fhir-mcp-server.env` for server configuration:

```env
FHIR_BASE_URL=http://hapi.fhir.org/baseR4
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8000
FHIR_VERSION=R4
```

### VS Code Integration

The MCP server is automatically configured in `.vscode/settings.json`:

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

## Using the FHIR MCP Server

### In Cursor AI Chat

When working with FHIR-related files, the AI will automatically have access to MCP tools for:

1. **Exploring FHIR Resources**
   - Query Patient resources
   - Search Observations
   - Retrieve other FHIR resource types

2. **Understanding FHIR Schemas**
   - Validate resource structure
   - Check required fields
   - Understand FHIR data types

3. **Prototyping Integrations**
   - Test FHIR queries
   - Explore response formats
   - Develop data transformations

### Auto-Activation

The FHIR context automatically activates when you work with:
- Files in `app/(medtech)/`
- Files in `src/components/medtech/`
- Files in `src/lib/fhir/`
- Any files matching `*fhir*.{ts,tsx}` or `*medtech*.{ts,tsx}`

See `.cursor/rules/fhir-medtech-development.mdc` for full details.

## Example Queries

### Query Patients

```typescript
// The AI can help you construct queries like:
GET http://hapi.fhir.org/baseR4/Patient?_count=10

// Response will be a FHIR Bundle with Patient resources
```

### Search Observations

```typescript
// Query observations for a specific patient
GET http://hapi.fhir.org/baseR4/Observation?patient=<patient-id>&_count=20

// Filter by category
GET http://hapi.fhir.org/baseR4/Observation?category=vital-signs
```

### Get Resource by ID

```typescript
// Retrieve a specific resource
GET http://hapi.fhir.org/baseR4/Patient/<patient-id>
```

## FHIR Resource Types

Common FHIR resources you'll work with:

- **Patient**: Demographics and identity information
- **Observation**: Clinical observations and measurements
- **Condition**: Clinical conditions and diagnoses
- **MedicationRequest**: Medication prescriptions
- **DiagnosticReport**: Diagnostic test results
- **Encounter**: Healthcare encounters/visits

## Development Workflow

1. **Explore with HAPI Test Server**
   - Use MCP tools to understand FHIR resource structures
   - Test queries and responses
   - Validate your data transformations

2. **Develop Widget Components**
   - Create TypeScript interfaces based on FHIR resources
   - Implement data fetching hooks
   - Build UI components with proper loading/error states

3. **Implement Production Gateway**
   - HAPI test server is for learning only
   - ALEX API requires custom authentication headers
   - Implement a custom gateway for production FHIR calls

## Important Limitations

### Cannot Connect to ALEX API Directly

The standard FHIR MCP server **cannot** connect directly to the ALEX API because:

- ALEX API requires custom authentication headers
- Standard FHIR MCP server doesn't support custom headers
- Use HAPI test server for exploration and prototyping
- Implement custom authentication gateway for production

### Development vs Production

| Aspect | Development (HAPI) | Production (ALEX) |
|--------|-------------------|-------------------|
| Authentication | None required | Custom headers required |
| Access | Public test server | Authenticated API |
| Data | Test/synthetic data | Real patient data |
| Use Case | Learning, prototyping | Production widgets |

## Next Steps

1. **Read the Setup Guide**: See `project-management/medtech-integration/docs/FHIR_MCP_SERVER_SETUP.md` for detailed setup information

2. **Explore FHIR Resources**: Start a Cursor chat in a medtech file and ask the AI to explore FHIR resources

3. **Review ALEX API Docs**: Check `project-management/medtech-integration/api/` for ALEX API-specific requirements

4. **Build Widgets**: Follow the patterns in `app/(medtech)/` for creating new FHIR-powered widgets

## Resources

- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [HAPI FHIR Test Server](http://hapi.fhir.org)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [ALEX API Documentation](project-management/medtech-integration/api/alex-api-review-2025-10-30.md)

## Support

For questions or issues:
1. Check existing documentation in `project-management/medtech-integration/`
2. Review the context-aware rule: `.cursor/rules/fhir-medtech-development.mdc`
3. Consult the FHIR R4 specification for resource details
