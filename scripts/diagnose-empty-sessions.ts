// @ts-nocheck
import { sql } from 'drizzle-orm';
import { getDb } from 'database/client';

async function main() {
  const db = getDb();

  const query = sql`WITH base AS (
  SELECT
    id,
    user_id,
    created_at,
    problems_text,
    objective_text,
    assessment_text,
    plan_text,
    typed_input,
    transcriptions,
    -- Flags for each criterion
    (created_at < NOW() - INTERVAL '1 day') AS is_old,
    (COALESCE(
      NULLIF(BTRIM(problems_text), ''),
      NULLIF(BTRIM(objective_text), ''),
      NULLIF(BTRIM(assessment_text), ''),
      NULLIF(BTRIM(plan_text), ''),
      NULLIF(BTRIM(typed_input), '')
    ) IS NULL) AS notes_all_empty,
    (
      transcriptions IS NULL OR (
        CASE WHEN COALESCE(BTRIM(transcriptions), '') = '' THEN '[]'::jsonb ELSE transcriptions::jsonb END
      ) IN ('[]'::jsonb, '{}'::jsonb)
    ) AS trans_empty
  FROM patient_sessions
)
SELECT *, (is_old AND notes_all_empty AND trans_empty) AS qualifies_for_delete
FROM base
ORDER BY created_at ASC
LIMIT 200;`;

  const res: any = await db.execute(query);
  const rows: any[] = (res as any)?.rows ?? [];

  const summary = {
    totalChecked: rows.length,
    qualifies: 0,
    tooRecent: 0,
    notesNotEmpty: 0,
    transNotEmpty: 0,
  } as any;

  const details = rows.map((r) => {
    const reasons: string[] = [];
    if (!r.is_old) reasons.push('too_recent');
    if (!r.notes_all_empty) reasons.push('notes_present');
    if (!r.trans_empty) reasons.push('transcriptions_present_or_malformed');
    if (r.is_old && r.notes_all_empty && r.trans_empty) summary.qualifies += 1; else {
      if (!r.is_old) summary.tooRecent += 1;
      if (!r.notes_all_empty) summary.notesNotEmpty += 1;
      if (!r.trans_empty) summary.transNotEmpty += 1;
    }
    return {
      id: r.id,
      userId: r.user_id,
      createdAt: r.created_at,
      qualifiesForDelete: r.qualifies_for_delete,
      reasonsExcluded: reasons,
      notes: {
        problems: r.problems_text,
        objective: r.objective_text,
        assessment: r.assessment_text,
        plan: r.plan_text,
        typedInput: r.typed_input,
      },
      transcriptionsRaw: r.transcriptions,
    };
  });

  console.log(JSON.stringify({ summary, details }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

