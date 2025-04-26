Analysis Level: {level}

# Analysis Instructions

## Level-Specific Processing

### Facts Only
- Extract explicit information only
- No clinical interpretation
- Direct symptom mapping
- Objective findings only
- Maintain chronological order
- Group by problem
- Flag any inconsistencies

### Basic Analysis
- Pattern recognition
- Basic clinical correlations
- Standard care pathways
- Common risk factors
- Basic preventive care opportunities
- Standard treatment protocols
- Common medication considerations

### Clinical Insights
- Evidence-based suggestions
- Risk stratification
- Differential diagnoses
- Management options
- Complex care coordination
- Long-term outcome considerations
- Specialist referral indicators

## Required Output Structure
```json
{
  "problems": [{
    "type": "primary|secondary|preventive",
    "description": "string",
    "details": {
      "symptoms": ["string"],
      "findings": ["string"],
      "analysis": "string",
      "suggestions": ["string"]
    },
    "metadata": {
      "confidence": "number",
      "requiresAttention": "boolean",
      "clinicalCodes": ["string"]
    }
  }],
  "preventiveCare": {
    "screenings": ["string"],
    "immunizations": ["string"],
    "lifestyle": ["string"]
  },
  "riskFactors": ["string"],
  "analysisMetadata": {
    "level": "facts|basic|clinical",
    "completeness": "number",
    "qualityChecks": ["string"]
  }
}
```

## Processing Rules

1. Information Extraction
   - Identify all explicit medical information
   - Maintain original context
   - Preserve temporal relationships
   - Note any ambiguities

2. Problem Organization
   - Separate active vs inactive problems
   - Prioritize based on acuity/severity
   - Link related problems
   - Flag urgent concerns

3. Clinical Standards
   - Follow NZ medical terminology
   - Use standard READ/SNOMED-CT codes
   - Apply NZ clinical guidelines
   - Consider ACC requirements

4. Quality Assurance
   - Verify information completeness
   - Check for contradictions
   - Validate clinical logic
   - Ensure structured format

5. Privacy Compliance
   - Remove identifying details
   - Maintain clinical relevance
   - Follow NZ Privacy Act
   - Secure sensitive information

## Level-Specific Output Requirements

### Facts Only Output
- Pure factual statements
- Direct quotes where relevant
- Objective measurements
- Chronological organization
- No interpretive statements
- Clear data sources
- Explicit uncertainty flags

### Basic Analysis Output
- Pattern identification
- Standard correlations
- Basic risk factors
- Common complications
- Routine care paths
- Standard precautions
- Basic follow-up needs

### Clinical Insights Output
- Evidence-based analysis
- Complex correlations
- Detailed risk assessment
- Treatment rationale
- Specialist considerations
- Long-term planning
- Quality metrics

## Response Validation
- Ensure JSON structure
- Verify required fields
- Validate data types
- Check completeness
- Confirm level-appropriate content
- Verify clinical code accuracy
- Check privacy compliance
