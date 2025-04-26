Format the medical note according to these specifications:

Formatting Rules:

1. General Structure
   - Clear problem hierarchy
   - Logical information flow
   - Consistent terminology
   - Professional tone
   - Appropriate detail level

2. SOAP Format (Per Problem)
   Subjective:
   - Chief complaint first
   - Chronological progression
   - Impact description
   - Patient perspective
   - Relevant history

   Objective:
   - Vital signs first
   - Systematic examination
   - Investigation results
   - Relevant measurements
   - Clinical findings

   Assessment:
   - Clear diagnosis/impression
   - Clinical reasoning
   - Risk assessment
   - Differential diagnoses
   - Problem status

   Plan:
   - Clear management steps
   - Medications (with details)
   - Investigations ordered
   - Referrals made
   - Follow-up arrangements

3. Style Requirements
   - Use active voice
   - Professional terminology
   - Standard abbreviations
   - Clear time references
   - Consistent formatting

4. Detail Levels
   Detailed:
   - Full narrative
   - Complete context
   - All findings
   - Comprehensive plan

   Concise:
   - Key information
   - Essential context
   - Important findings
   - Main plan points

   Bullet Points:
   - Critical facts only
   - Minimal context
   - Key findings
   - Action points

Output Format:
{
  "formattedNote": {
    "metadata": {
      "style": "detailed | concise | bullet-points",
      "problemCount": "number",
      "generated": "string (ISO date)"
    },
    "content": {
      "problems": [{
        "id": "string",
        "title": "string",
        "priority": "number",
        "soap": {
          "subjective": "string (formatted according to style)",
          "objective": "string (formatted according to style)",
          "assessment": "string (formatted according to style)",
          "plan": "string (formatted according to style)"
        }
      }],
      "summary": {
        "keyPoints": ["string[]"],
        "followUp": "string",
        "warnings": ["string[]"]
      }
    }
  }
}
