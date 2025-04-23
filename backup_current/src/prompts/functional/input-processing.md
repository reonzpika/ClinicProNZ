# Input Processing Rules

## Transcription Processing

1. **Problem Identification**
   - Identify distinct medical problems discussed
   - Separate acute and chronic issues
   - Note any preventive care topics
   - Flag any urgent or emergency issues

2. **Information Extraction**
   - Extract relevant history for each problem
   - Identify examination findings
   - Capture investigation results
   - Note management decisions

3. **Temporal Context**
   - Identify symptom onset and duration
   - Note timing of previous treatments
   - Capture follow-up timeframes
   - Record review periods for chronic conditions

4. **Clinical Relationships**
   - Link related symptoms to problems
   - Connect findings to diagnoses
   - Associate treatments with conditions
   - Map follow-up plans to problems

## Analysis Levels

### Level 1: Basic Structuring
- Split content into SOAP sections
- Basic problem identification
- Direct information mapping
- Simple temporal ordering

### Level 2: Clinical Context
- Multiple problem organization
- Clinical relationship mapping
- Relevant history integration
- Management plan structuring

### Level 3: Advanced Analysis
- Complex relationship identification
- Risk factor analysis
- Treatment rationale extraction
- Comprehensive care planning

## Output Requirements

1. **Structure**
   - Maintain SOAP format
   - Organize by problem
   - Include metadata
   - Preserve clinical context

2. **Content**
   - Use standard medical terminology
   - Include relevant codes
   - Maintain factual accuracy
   - Preserve clinical reasoning

3. **Relationships**
   - Link related problems
   - Connect findings to diagnoses
   - Map treatments to conditions
   - Associate follow-up plans

4. **Validation**
   - Check for completeness
   - Verify clinical logic
   - Ensure code accuracy
   - Validate relationships

## Processing Steps

1. **Initial Parse**
   ```json
   {
     "rawTranscript": "string",
     "timestamp": "string",
     "metadata": {
       "consultationType": "string",
       "provider": "string"
     }
   }
   ```

2. **Problem Extraction**
   ```json
   {
     "problems": [
       {
         "title": "string",
         "type": "acute|chronic|preventive",
         "priority": "routine|urgent|emergency"
       }
     ]
   }
   ```

3. **Information Mapping**
   ```json
   {
     "problemId": "string",
     "clinicalData": {
       "history": ["string"],
       "examination": ["string"],
       "results": ["string"],
       "decisions": ["string"]
     }
   }
   ```

4. **Final Structure**
   ```json
   {
     "consultation": {
       "problems": [
         {
           "problemTitle": "string",
           "readCode": "string",
           "priority": "string",
           "soap": {
             "subjective": "string",
             "objective": "string",
             "assessment": "string",
             "plan": "string"
           },
           "relationships": {
             "relatedProblems": ["string"],
             "dependencies": ["string"]
           }
         }
       ],
       "metadata": {
         "consultationType": "string",
         "dateTime": "string",
         "provider": "string",
         "analysisLevel": "number"
       }
     }
   }
   ```
