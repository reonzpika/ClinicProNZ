Process the consultation transcript according to these rules:

Information Extraction:
1. Problem Identification
   - Identify chief complaints
   - Note secondary issues
   - Flag preventive opportunities
   - Detect urgent indicators
   - Note chronic conditions

2. Clinical Information
   - Patient-reported symptoms
   - Symptom progression
   - Impact on daily life
   - Previous treatments
   - Treatment responses

3. Examination Data
   - Vital signs
   - Physical findings
   - System examinations
   - Test results
   - Clinical measurements

4. Context Information
   - Relevant history
   - Risk factors
   - Social context
   - Support systems
   - Barriers to care

Processing Rules:
- Maintain chronological order
- Group by problem/system
- Note relationships between problems
- Preserve clinical context
- Flag inconsistencies

Clinical Priorities:
1. Emergency conditions
2. Acute symptoms
3. Chronic management
4. Preventive care
5. Administrative tasks

Quality Requirements:
- Complete information capture
- Accurate terminology
- Consistent structure
- Clear relationships
- Proper categorization

Output Structure:
{
  "extractedData": {
    "problems": [{
      "description": "string",
      "type": "primary | secondary | preventive",
      "urgency": "emergency | urgent | routine",
      "details": {
        "symptoms": ["string[]"],
        "timeline": "string",
        "context": "string",
        "findings": ["string[]"]
      }
    }],
    "clinicalContext": {
      "relevantHistory": ["string[]"],
      "riskFactors": ["string[]"],
      "barriers": ["string[]"]
    }
  },
  "qualityMarkers": {
    "completeness": "number (0-1)",
    "consistency": "number (0-1)",
    "flags": ["string[]"]
  }
}
