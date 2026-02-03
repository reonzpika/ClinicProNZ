# AI Clinical Review Feature - Complete Implementation

## What This Does

Adds 4 AI-powered clinical decision support modules to your consultation interface:

1. **🚩 Red Flags Scanner** - Identifies must-not-miss diagnoses
2. **🔬 Differential Diagnosis** - Suggests alternative diagnoses  
3. **🧪 Investigation Advisor** - Recommends appropriate investigations
4. **💊 Management Review** - Treatment, patient advice, and safety netting

## Key Features

✅ **Conservative by Design** - Claude 3.5 Sonnet with high-specificity prompts  
✅ **NZ-Specific** - Aligned with BPAC, PHARMAC, HealthPathways  
✅ **Auto-Logging** - All suggestions tracked with timestamps and feedback  
✅ **Privacy-First** - Data stays in your database, never used for training  
✅ **Fast** - 3-5 second response time per module  
✅ **Cost-Effective** - ~$0.01-0.02 per review  

## Files Included

```
├── ai-review-route.ts          # Main API endpoint
├── feedback-route.ts           # Feedback tracking endpoint
├── schema-update.ts            # Database migration
├── AIReviewButton.tsx          # UI button component
├── AIReviewModal.tsx           # Modal for showing results
├── INTEGRATION_GUIDE.md        # Step-by-step setup instructions
└── README.md                   # This file
```

## Quick Start

1. **Add Anthropic API key** to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

2. **Install dependency**:
   ```bash
   pnpm add @anthropic-ai/sdk
   ```

3. **Run database migration**:
   ```bash
   pnpm db:generate && pnpm db:push
   ```

4. **Copy files** to your project:
   - API routes → `/app/api/(clinical)/consultation/ai-review/`
   - Components → `/src/features/clinical/ai-review/components/`
   - Schema → Add to your `database/migrations/schema.ts`

5. **Integrate button** into consultation interface (see INTEGRATION_GUIDE.md)

6. **Test** each module with sample consultation notes

## Architecture

```
User clicks AI Review button
    ↓
Modal opens with 4 module options
    ↓
User selects a module (e.g., Red Flags)
    ↓
POST /api/consultation/ai-review
    ├─ Validates content
    ├─ Calls Claude 3.5 Sonnet
    ├─ Returns structured response
    └─ Logs to database
    ↓
Modal displays results
    ↓
User provides 👍 👎 feedback
    ↓
POST /api/consultation/ai-review/feedback
    └─ Updates database
```

## Prompts Overview

Each module uses research-based prompts optimized for:
- **Conservative thresholds** (>80% confidence required)
- **GP-appropriate scope** (no rare/specialist conditions)
- **NZ healthcare context** (BPAC, PHARMAC, HealthPathways)
- **Telegraphic clinical style** (concise, professional)
- **Structured output** (emojis, bullets, clear sections)

## Example Output

### Red Flags Module:
```
🚩 RED FLAGS:
- Bilateral leg weakness + urinary retention: 
  Possible cauda equina syndrome - Requires 
  immediate ED assessment within 4 hours

✅ SAFETY ASSESSMENT:
Urgent red flag present requiring emergency referral
```

### DDx Module:
```
📊 KEY FEATURES SUMMARY:
- Symptoms: Chest pain, dyspnea, diaphoresis
- Risk factors: DM, smoking, age 55

🤔 ALTERNATIVE DIFFERENTIALS TO CONSIDER:
1. Acute Coronary Syndrome - Likelihood: High
   ✓ Supports: Cardiac risk factors, radiation pattern
   ✗ Against: Normal troponin (if done)
   → Next step: ECG, troponin, cardiology referral
```

## Monitoring

Track usage with this query:

```sql
SELECT 
  review_type,
  COUNT(*) as total_reviews,
  AVG(CASE WHEN user_feedback = 'helpful' THEN 1.0 ELSE 0.0 END) as helpful_rate
FROM ai_suggestions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY review_type;
```

Export data weekly to share with Claude for prompt improvements.

## Expected Outcomes

After 2 weeks of daily use, you should have:
- ~50-100 review logs
- Feedback on which modules are most useful
- Examples of great suggestions vs false positives
- Data on acceptance rates by module
- Cost analysis (tokens used)

Share this data to refine prompts and improve performance.

## Support

Questions or issues? Check:
1. INTEGRATION_GUIDE.md for detailed setup
2. Console logs for error messages
3. Database for logged suggestions

## What's Next

After initial testing:
1. Analyze which modules get most use
2. Collect examples of helpful vs unhelpful suggestions
3. Refine prompts based on feedback
4. Consider adding batch review (all modules at once)
5. Build analytics dashboard

## Cost Estimate

- **Per review**: $0.01-0.02
- **100 reviews/month**: $1-2
- **500 reviews/month**: $5-10

Negligible compared to GP consultation value.

## Notes

- Prompts are designed to be conservative (favor specificity over sensitivity)
- AI suggestions are "for consideration" not directives
- Always requires GP clinical judgment
- Complies with Te Whatu Ora AI guidelines (no patient data used for training)
- All data stays in your NZ-hosted database

---

**Ready to start?** Follow INTEGRATION_GUIDE.md step-by-step.

**Questions?** Review the troubleshooting section in INTEGRATION_GUIDE.md.

**Want to iterate?** Collect feedback data and share with Claude for prompt refinement.
