import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { and, count, eq, gte, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { mailQueue, surveyResponses } from '@/db/schema';

type Q4Type = 'ai_scribe' | 'dictation' | 'none';

type SurveyRequest = {
  email?: string | null;
  q1: string[];
  q2?: string | null;
  q3: Array<{ topic: 'notes' | 'guidance' | 'acc' | 'referrals' | 'images'; selected: string[]; free_text?: string }>;
  q4: { type: Q4Type; issue?: string; vendor?: string; no_try_reason?: string[] };
  q5: number; // 1-5
  q5_price_band?: string | null;
  opted_in?: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
]);

function isDisposable(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return DISPOSABLE_DOMAINS.has(domain);
}

function computePriorityWeight(): number {
  // Per spec: set to 3
  return 3;
}

function computeUrgencyScore(q5: number, priorityWeight: number): number {
  return Math.round(q5 * priorityWeight);
}

function computeGoldLead(input: SurveyRequest): boolean {
  if (input.q5 === 5) return true;

  const q2IsNotes = input.q2 === 'Writing / finishing consultation notes';
  const unhappyIssues = new Set([
    'Misses clinical details / accuracy issues',
    'Too wordy / poor structure',
    'Workflow friction',
    'Cost / pricing too high',
    'Too wordy / poor structure — needs heavy editing',
    'Workflow friction (integration / copying into PMS)',
  ]);
  const q3NotesSelected = input.q3.find((q) => q.topic === 'notes')?.selected || [];

  if (
    q2IsNotes
    && (
      q3NotesSelected.includes('Trouble remembering everything we discussed in the consult')
      || q3NotesSelected.includes('Must re-enter/copy info into PMS (workflow friction)')
    )
    && input.q4.type === 'ai_scribe'
    && input.q4.issue
    && unhappyIssues.has(input.q4.issue)
  ) {
    return true;
  }

  return false;
}

function computeTags(q1: string[], q4: SurveyRequest['q4']): string[] {
  const tags = new Set<string>();
  q1.forEach((pick) => {
    const normalized = pick.toLowerCase();
    if (normalized.includes('notes')) tags.add('notes');
    if (
      normalized.includes('guidance')
      || normalized.includes('clinical info')
      || normalized.includes('healthpathways')
      || normalized.includes('nzformulary')
      || normalized.includes('dermnet')
      || normalized.includes('medication')
    ) tags.add('guidelines');
    if (normalized.includes('acc')) tags.add('acc');
    if (normalized.includes('referral')) tags.add('referrals');
    if (normalized.includes('image')) tags.add('images');
  });
  if (q4.type === 'ai_scribe' && q4.issue) {
    const issueLower = q4.issue.toLowerCase();
    if (
      issueLower.includes('accuracy')
      || issueLower.includes('structure')
      || issueLower.includes('workflow')
      || issueLower.includes('cost')
    ) {
      tags.add('ai_scribe_unhappy');
    }
  }
  return Array.from(tags);
}

async function isRateLimited(ipAddress: string | null): Promise<boolean> {
  if (!ipAddress) return false;
  const oneHourAgo = sql`now() - interval '1 hour'`;
  const result = await db
    .select({ c: count() })
    .from(surveyResponses)
    .where(and(eq(surveyResponses.ipAddress, ipAddress), gte(surveyResponses.createdAt, oneHourAgo)));
  const attempts = result[0]?.c ?? 0;
  return attempts >= 10;
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');
    const ip = (forwardedFor?.split(',')[0]?.trim() || realIp || cfIp || null);
    if (await isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const body = (await request.json()) as SurveyRequest;

    // Basic validation
    if (body.email) {
      const em = body.email.toLowerCase().trim();
      if (!EMAIL_REGEX.test(em) || isDisposable(em)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
      }
    }
    if (!Array.isArray(body.q1) || body.q1.length === 0) {
      return NextResponse.json({ error: 'Q1 is required' }, { status: 400 });
    }
    // Q2 removed from flow
    if (!Array.isArray(body.q3) || body.q3.length === 0 || body.q3.some((q) => !q.topic || !Array.isArray(q.selected) || q.selected.length === 0)) {
      return NextResponse.json({ error: 'Q3 is required' }, { status: 400 });
    }
    if (!body.q4 || !body.q4.type) {
      return NextResponse.json({ error: 'Q4 is required' }, { status: 400 });
    }
    if (body.q4.type === 'none') {
      // Accept optional no_try_reason array
      if (body.q4.no_try_reason && !Array.isArray(body.q4.no_try_reason)) {
        return NextResponse.json({ error: 'Q4 reasons invalid' }, { status: 400 });
      }
    }
    if (!Number.isInteger(body.q5) || body.q5 < 1 || body.q5 > 5) {
      return NextResponse.json({ error: 'Q5 must be 1-5' }, { status: 400 });
    }
    // opted_in optional when no email capture

    const priorityWeight = computePriorityWeight();
    const urgencyScore = computeUrgencyScore(body.q5, priorityWeight);
    const goldLead = computeGoldLead(body);
    const tags = computeTags(body.q1, body.q4);

    const id = nanoid();

    // Always create a new row; duplicates allowed. Behaviour documented here for simplicity.
    await db.insert(surveyResponses).values({
      id,
      email: body.email ? body.email.toLowerCase().trim() : null,
      q1: body.q1,
      q2: body.q2,
      q3: body.q3,
      q4: body.q4,
      q5: body.q5,
      q5PriceBand: body.q5_price_band ?? null,
      optedIn: !!body.opted_in,
      callOptIn: body.q5 === 5,
      goldLead,
      priorityWeight,
      urgencyScore,
      rawPayload: body as unknown as Record<string, unknown>,
      ipAddress: ip,
      tags,
    });

    // Queue welcome email (HTML + plain). If SES/SMTP not configured, leave TODO and store in queue.
    if (body.email) {
      const subject = 'Welcome — early access to ClinicPro';
      const textBody = 'Thanks — ClinicPro’s AI scribe is free to use now, and we’re rolling out more features shortly. Sign up keeps you updated.';
      const htmlBody = '<p>Thanks — ClinicPro’s AI scribe is <strong>free to use now</strong>, and we’re rolling out more features shortly. Sign up keeps you updated.</p>';
      await db.insert(mailQueue).values({
        id: nanoid(),
        toEmail: body.email.toLowerCase().trim(),
        subject,
        htmlBody,
        textBody,
        status: 'queued',
      });
    }

    // Server-side analytics as fallback
    try {
      console.log('analytics:survey_submitted', { id, email_opted_in: body.opted_in, gold_lead: goldLead });
    } catch {}

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error('Survey submit error:', error);
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 });
  }
}

