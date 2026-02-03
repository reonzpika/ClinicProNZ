# AI Clinical Review Feature - Integration Guide

## Overview
This feature adds AI-powered clinical decision support using Claude 3.5 Sonnet, with 4 review modules:
- 🚩 Red Flags Scanner
- 🔬 Differential Diagnosis  
- 🧪 Investigation Advisor
- 💊 Management Review

## Prerequisites
- [ ] Anthropic API key
- [ ] PostgreSQL database
- [ ] Existing consultation interface with SOAP note fields

---

## Step 1: Environment Setup

Add to your `.env.local` file:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your API key from: https://console.anthropic.com/

---

## Step 2: Install Dependencies

```bash
npm install @anthropic-ai/sdk
# or
pnpm add @anthropic-ai/sdk
```

---

## Step 3: Database Migration

### 3.1 Add schema to `database/migrations/schema.ts`:

```typescript
export const aiSuggestions = pgTable('ai_suggestions', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: text('user_id').notNull(),
  sessionId: uuid('session_id'),
  reviewType: text('review_type').notNull(),
  noteContent: text('note_content').notNull(),
  aiResponse: text('ai_response').notNull(),
  userFeedback: text('user_feedback'),
  responseTimeMs: integer('response_time_ms').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, table => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'ai_suggestions_user_id_users_id_fk',
  }),
  foreignKey({
    columns: [table.sessionId],
    foreignColumns: [patientSessions.id],
    name: 'ai_suggestions_session_id_patient_sessions_id_fk',
  }),
]);
```

### 3.2 Run migration:

```bash
pnpm db:generate
pnpm db:push
```

---

## Step 4: Create API Routes

### 4.1 Create `/app/api/(clinical)/consultation/ai-review/route.ts`

Copy the content from `ai-review-route.ts`

### 4.2 Create `/app/api/(clinical)/consultation/ai-review/feedback/route.ts`

Copy the content from `feedback-route.ts`

---

## Step 5: Create React Components

### 5.1 Create feature directory:

```bash
mkdir -p src/features/clinical/ai-review/components
```

### 5.2 Create `AIReviewButton.tsx`

Copy the content from `AIReviewButton.tsx` to:
`src/features/clinical/ai-review/components/AIReviewButton.tsx`

### 5.3 Create `AIReviewModal.tsx`

Copy the content from `AIReviewModal.tsx` to:
`src/features/clinical/ai-review/components/AIReviewModal.tsx`

---

## Step 6: Integrate into Consultation Interface

### 6.1 Find your consultation page component

Based on your codebase, this is likely:
`app/(clinical)/ai-scribe/consultation/page.tsx`

### 6.2 Add the AI Review button

In the left sidebar where you have camera and referral icons, add:

```typescript
import { AIReviewButton } from '@/src/features/clinical/ai-review/components/AIReviewButton';

// In your JSX, next to camera and referral icons:
<div className="flex gap-2">
  {/* Existing camera icon */}
  <button>📷</button>
  
  {/* Existing referral icon */}
  <button>📄</button>
  
  {/* NEW: AI Review button */}
  <AIReviewButton />
</div>
```

---

## Step 7: Testing

### 7.1 Test each module:

1. **Red Flags Module**
   - Create a note with red flag symptoms (e.g., back pain with bilateral leg weakness)
   - Click AI Review → Red Flags Scanner
   - Should flag cauda equina syndrome

2. **DDx Module**
   - Create a note with common presentation (e.g., chest pain)
   - Click AI Review → Differential Diagnosis
   - Should suggest alternative diagnoses

3. **Investigations Module**
   - Create a note missing obvious investigations
   - Click AI Review → Investigation Advisor
   - Should suggest appropriate tests

4. **Management Module**
   - Create a note with a diagnosis but incomplete plan
   - Click AI Review → Management Review
   - Should suggest treatment and safety netting

### 7.2 Test feedback mechanism:

- Click 👍 or 👎 after review
- Check database to confirm feedback saved
- Verify feedback buttons disabled after clicking

### 7.3 Test error handling:

- Try with empty notes (should show validation error)
- Simulate API error (temporarily break API key)
- Check error UI displays correctly

---

## Step 8: Monitor and Iterate

### 8.1 Analytics Query

Check usage and feedback:

```sql
SELECT 
  review_type,
  COUNT(*) as total_reviews,
  COUNT(user_feedback) as feedback_count,
  SUM(CASE WHEN user_feedback = 'helpful' THEN 1 ELSE 0 END) as helpful_count,
  SUM(CASE WHEN user_feedback = 'not_helpful' THEN 1 ELSE 0 END) as not_helpful_count,
  AVG(response_time_ms) as avg_response_time,
  AVG(input_tokens) as avg_input_tokens,
  AVG(output_tokens) as avg_output_tokens
FROM ai_suggestions
GROUP BY review_type;
```

### 8.2 Export data for analysis:

```sql
SELECT 
  created_at,
  review_type,
  user_feedback,
  response_time_ms,
  input_tokens,
  output_tokens
FROM ai_suggestions
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

Export as CSV and share with Claude for analysis.

---

## Cost Estimation

**Claude 3.5 Sonnet Pricing:**
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

**Typical Usage per Review:**
- Input: ~500-1000 tokens (consultation note + prompt)
- Output: ~200-400 tokens (AI response)

**Cost per Review:** ~$0.01 - $0.02

**Monthly Cost (100 reviews):** ~$1-2

---

## Troubleshooting

### "API key not found"
- Check `.env.local` has `ANTHROPIC_API_KEY`
- Restart development server after adding env var

### "No consultation content provided"
- Ensure SOAP fields have content before clicking AI Review
- Check Zustand store has problemsText, objectiveText, etc.

### "Access denied"
- Check RBAC permissions in `extractRBACContext`
- Ensure user is authenticated

### Modal doesn't open
- Check console for React errors
- Verify Dialog component is imported from correct path
- Check z-index conflicts with other modals

### Feedback not saving
- Check network tab for failed POST request
- Verify `aiSuggestions` table exists
- Check foreign key constraints

---

## Next Steps (Optional Enhancements)

1. **Add analytics dashboard**
   - Create page to view usage stats
   - Chart feedback over time
   - Track most-used modules

2. **Add export functionality**
   - Allow GPs to download all suggestions
   - Export as CSV for analysis

3. **Add prompt customization**
   - Let GPs adjust conservativeness threshold
   - Allow custom prompt additions

4. **Add batch review**
   - Run all 4 modules at once
   - Show consolidated results

5. **Add cost tracking**
   - Show token usage to user
   - Alert when approaching limits

---

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify all environment variables are set
3. Ensure database migrations ran successfully
4. Test API routes directly with curl/Postman

For prompt improvements, collect examples of:
- False positives (unnecessary flags)
- False negatives (missed red flags)
- Unhelpful suggestions
- Great suggestions

Share these with Claude for prompt refinement.
