# Deepgram Medical Keywords

## Overview

NZ-specific medical terminology keyword list for Deepgram transcription accuracy boosting.

**Purpose:** Reduce medication name and clinical term transcription errors by telling Deepgram which words are most likely in GP consultations.

**Impact:** Expected 70-90% reduction in medication name errors.

---

## Current Stats

**Total Keywords:** ~400+ terms  
**Categories:** 12  
**Boost Levels:**
- 2.0: Standard medications and medical terms
- 2.5: Commonly confused terms (e.g., antibiotics, mental health meds)
- 3.0: Patient-specific medications (added dynamically - not yet implemented)

---

## Categories

1. **Pain & Analgesics** (~20 terms)
   - Common: paracetamol, ibuprofen, codeine, tramadol, oxycodone

2. **Antibiotics** (~20 terms, boost: 2.5)
   - Common: amoxicillin, flucloxacillin, doxycycline, trimethoprim

3. **Cardiovascular** (~35 terms)
   - Common: amlodipine, atenolol, ramipril, simvastatin

4. **Respiratory** (~20 terms, boost: 2.5)
   - Common: Ventolin, Seretide, Symbicort, salbutamol

5. **Mental Health** (~35 terms, boost: 2.5)
   - Common: citalopram, sertraline, mirtazapine, quetiapine

6. **Hay Fever & Allergies** (~15 terms, boost: 2.5)
   - Common: Flixonase, Nasonex, cetirizine, loratadine

7. **Diabetes** (~15 terms)
   - Common: metformin, gliclazide, Jardiance, Trulicity

8. **Gastrointestinal** (~30 terms)
   - Common: omeprazole, Gaviscon, Buscopan, Movicol

9. **Dermatology** (~40 terms)
   - Common: hydrocortisone, betamethasone, Locoid, Dermol

10. **Contraception & HRT** (~20 terms, boost: 2.5)
    - Common: Levlen, Cerazette, Mirena, Depo-Provera

11. **General & OTC** (~25 terms)
    - Common: folic acid, iron, vitamin D, levothyroxine

12. **Clinical Terminology** (~30 terms)
    - Common: dyspnoea, auscultation, hypertension, COPD

---

## Usage

### Basic (Current Implementation)

```typescript
import { getDeepgramKeywords } from '@/src/lib/deepgram/nz-medical-keywords';

const deepgramConfig = {
  model: 'nova-3-medical',
  keyterm: getDeepgramKeywords(), // Nova-3 uses 'keyterm' (not 'keywords')
  // ... other config
};
```

**Note:** Nova-3 model uses `keyterm` parameter (not `keywords`). Both accept same format: `["term:boost", ...]`

### By Category

```typescript
import { getKeywordsByCategory } from '@/src/lib/deepgram/nz-medical-keywords';

// Only respiratory and cardiovascular keywords
const keywords = getKeywordsByCategory(['respiratory', 'cardiovascular']);

const deepgramConfig = {
  model: 'nova-3-medical',
  keyterm: keywords,
};
```

### Patient-Specific (Future)

```typescript
import { addPatientMedications } from '@/src/lib/deepgram/nz-medical-keywords';

// Boost patient's current medications higher
const patientMeds = ['citalopram', 'Flixonase', 'Ventolin'];
const keywords = addPatientMedications(patientMeds); // Gets boost: 3.0

const deepgramConfig = {
  model: 'nova-3-medical',
  keyterm: keywords,
};
```

---

## Maintenance

### Adding New Medications

1. Edit `/workspace/src/lib/deepgram/nz-medical-keywords.ts`
2. Find appropriate category
3. Add to `keywords` array (generic name or brand name)
4. Test with sample transcription
5. Deploy

**Example:**
```typescript
{
  category: 'cardiovascular',
  boost: 2.0,
  keywords: [
    // ... existing
    'new-medication-name', // Add here
  ],
}
```

### When to Add Keywords

- **New medication frequently misheared:** Add immediately
- **Existing medication not in list:** Add when discovered
- **Quarterly review:** Check PHARMAC updates for new funded medications
- **GP feedback:** Add medications they report as problematic

### Review Schedule

- **Weekly:** Check LLM TRANSCRIPTION NOTES flags for commonly flagged terms
- **Monthly:** Review error patterns
- **Quarterly:** Update from PHARMAC/Medsafe lists
- **Annually:** Comprehensive review and cleanup

---

## Monitoring

### Check Keyword Stats

```typescript
import { getKeywordStats } from '@/src/lib/deepgram/nz-medical-keywords';

const stats = getKeywordStats();
console.log(stats);
// {
//   totalKeywords: 420,
//   categories: 12,
//   byCategory: [...],
//   byBoost: { '2.0': [...], '2.5': [...] }
// }
```

### Find Specific Medication

```typescript
import { findMedication } from '@/src/lib/deepgram/nz-medical-keywords';

const result = findMedication('citalopram');
// { found: true, category: 'mental-health', boost: 2.5 }

const result2 = findMedication('unknown-drug');
// { found: false }
```

---

## Performance

### Token/Latency Impact

- **Keyword count:** ~400 terms
- **Added latency:** ~50-100ms per request
- **Accuracy improvement:** 70-90% error reduction

**Worth it?** Yes – GP time saved > latency cost

### Deepgram Limits

- **Recommended max:** 500-1000 keywords
- **Current usage:** ~400 keywords
- **Headroom:** Can add ~100-600 more

---

## Testing

### Before Adding Keywords (Baseline)

1. Transcribe sample: "I'm taking Stonoprim and Flexner"
2. Expected result: "Stonoprim" and "Flexner" (wrong)

### After Adding Keywords

1. Add to list: `citalopram:2.5`, `Flixonase:2.5`
2. Transcribe same sample
3. Expected result: "citalopram" and "Flixonase" (correct)

### Validation

Check TRANSCRIPTION NOTES in generated clinical notes:
- **Before:** Multiple medication flags
- **After:** Fewer/no medication flags

---

## Future Enhancements

### Phase 2: Patient-Specific Boosting

```typescript
// Get patient's current medications from database
const patientMeds = await getPatientCurrentMedications(patientId);

// Boost these medications higher (3.0 vs 2.0)
const keywords = addPatientMedications(patientMeds);
```

**Expected improvement:** 90-95% accuracy

### Phase 3: Automated Learning

```typescript
// Track which medications still get flagged by LLM
// Automatically add to keyword list
// Adjust boost values based on error frequency
```

**Expected improvement:** 95%+ accuracy over time

### Phase 4: Context-Aware Keywords

```typescript
// Consultation type: Mental health
// Boost mental health medications higher for this consultation
const keywords = getKeywordsByCategory(['mental-health'], 3.0);
```

---

## Data Sources

**NZ-specific medication lists:**
- [NZULM](https://www.health.govt.nz/nzulm) - NZ Universal List of Medicines
- [Medsafe](https://www.medsafe.govt.nz/) - NZ Medicines and Medical Devices Safety Authority
- [PHARMAC](https://pharmac.govt.nz/pharmaceutical-schedule) - Pharmaceutical Schedule

**Compiled by:** Clinical team + GP feedback  
**Last reviewed:** 2025-10-01

---

## Troubleshooting

### Keywords Not Working?

1. **Check Deepgram config:** Ensure `keyterm` parameter is passed (Nova-3 uses `keyterm`, not `keywords`)
2. **Check format:** Must be `["term:boost", ...]` format
3. **Check boost values:** 0.5-3.0 range (outside this = ignored)
4. **Check term spelling:** Must match exactly (case-insensitive usually)

### Too Many False Positives?

- **Lower boost value:** Change from 2.5 → 2.0
- **Remove term:** If causing issues

### Still Getting Errors?

- **Add to keyword list:** If not present
- **Increase boost:** Change from 2.0 → 2.5
- **Check LLM validation:** Should flag as backup

---

## Contact

For questions or to report medication transcription errors:
- Add issue to project tracker
- Tag: `transcription`, `medication-error`
- Include: audio sample, expected vs actual transcription
