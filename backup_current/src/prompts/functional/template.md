Template Management and Application Rules:

1. Template Structure
   - Modular components
   - Customizable sections
   - Variable placeholders
   - Conditional blocks
   - Extension points

2. Template Types
   Standard Consultation:
   - Basic SOAP structure
   - Common clinical scenarios
   - Standard assessments
   - Routine management plans

   Complex Care:
   - Multiple problem management
   - Care coordination
   - Risk stratification
   - Long-term planning

   Follow-up:
   - Progress tracking
   - Plan adjustments
   - Outcome measures
   - Compliance checks

   Specific Conditions:
   - Condition-specific data
   - Standard protocols
   - Clinical pathways
   - Monitoring requirements

3. Template Variables
   Required:
   - Patient demographics
   - Clinical context
   - Provider details
   - Encounter type
   - Template version

   Optional:
   - Previous notes
   - Care plans
   - Clinical alerts
   - Funding status

4. Template Processing
   Merge Rules:
   - Override priorities
   - Default values
   - Required fields
   - Validation rules

   Context Rules:
   - Clinical relevance
   - Time sensitivity
   - Provider scope
   - Patient context

Output Format:
{
  "template": {
    "metadata": {
      "id": "string",
      "version": "string",
      "type": "standard | complex | followup | condition-specific",
      "lastUpdated": "string (ISO date)"
    },
    "structure": {
      "sections": [{
        "id": "string",
        "type": "string",
        "required": "boolean",
        "content": {
          "template": "string",
          "variables": ["string[]"],
          "conditionals": [{
            "condition": "string",
            "content": "string"
          }]
        }
      }],
      "extensions": [{
        "point": "string",
        "content": "string",
        "priority": "number"
      }]
    },
    "validation": {
      "required": ["string[]"],
      "constraints": [{
        "field": "string",
        "rule": "string",
        "message": "string"
      }]
    }
  }
}
