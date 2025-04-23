# Multi-Problem SOAP Template

Structure each problem in the consultation note using this SOAP format:

## Problem Structure

Each identified problem should be documented with:
1. Problem Title and Priority
2. SOAP Components
3. Related Issues
4. Follow-up Requirements

## SOAP Components

### Subjective
Required Elements:
- Chief complaint (verbatim)
- Duration and progression
- Severity and impact
- Aggravating/relieving factors
- Associated symptoms
- Previous treatments
- Patient's concerns

Format:
```
[CC]: Patient reports "..." for [duration]
[HPC]: Describes [progression], severity [x/10]
[Impact]: Effects on [activities/function]
[Factors]: Worse with [...], better with [...]
[Associated]: Also notes [related symptoms]
[Treatments]: Has tried [previous interventions]
```

### Objective
Required Elements:
- Vital signs (if taken)
- Focused examination
- Investigation results
- Clinical measurements
- Relevant negative findings

Format:
```
[Vitals]: BP [...], HR [...], Temp [...], etc.
[Exam]: [system] examination shows [findings]
[Tests]: Results show [findings]
[Measurements]: [specific measurements]
[Negatives]: Notable negative findings include [...]
```

### Assessment
Required Elements:
- Working diagnosis
- Clinical reasoning
- Differential diagnoses
- Risk assessment
- Problem status

Format:
```
[Diagnosis]: Most likely [diagnosis]
[Reasoning]: Based on [key findings/patterns]
[Differentials]: Also considering [alternatives]
[Risks]: Risk factors include [...]
[Status]: Problem is [status] (improving/stable/worsening)
```

### Plan
Required Elements:
- Management steps
- Medications
- Investigations
- Referrals
- Patient education
- Follow-up plan
- Safety netting

Format:
```
[Management]: Plan to [specific steps]
[Medications]: Start/continue/adjust [medications]
[Tests]: Arrange [investigations]
[Referrals]: Refer to [specialist/service]
[Education]: Advised regarding [topics]
[Follow-up]: Review in [timeframe]
[Safety]: Return if [warning signs]
```

## Template Variables
- {patientName}: Patient's full name
- {patientAge}: Age in years
- {consultDate}: Consultation date
- {providerName}: Provider's name
- {location}: Practice location
- {fundingStatus}: Funding/subsidy status

## Output Format
{
  "template": {
    "type": "multi-problem-soap",
    "version": "1.0",
    "metadata": {
      "title": "Multi-Problem SOAP Note",
      "context": {
        "setting": "primary-care",
        "country": "nz"
      }
    },
    "structure": {
      "problems": [{
        "id": "string",
        "title": "string",
        "priority": "number (1-5)",
        "type": "primary | secondary | preventive",
        "soap": {
          "subjective": {
            "format": "string (detailed | concise | bullet-points)",
            "required": ["cc", "hpc", "impact"],
            "optional": ["factors", "associated", "treatments"]
          },
          "objective": {
            "format": "string",
            "required": ["exam", "tests"],
            "optional": ["vitals", "measurements"]
          },
          "assessment": {
            "format": "string",
            "required": ["diagnosis", "reasoning", "status"],
            "optional": ["differentials", "risks"]
          },
          "plan": {
            "format": "string",
            "required": ["management", "followup", "safety"],
            "optional": ["medications", "tests", "referrals", "education"]
          }
        }
      }],
      "preventive": {
        "required": false,
        "sections": ["screenings", "immunizations", "lifestyle"]
      }
    }
  }
}
