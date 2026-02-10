import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

export const runtime = 'nodejs';

const RESEND_EVENTS = [
  'email.opened',
  'email.clicked',
  'email.bounced',
  'email.complained',
] as const;

type ResendEventType = (typeof RESEND_EVENTS)[number];

type ResendWebhookData = {
  email_id?: string;
  to?: string[];
  from?: string;
  subject?: string;
  [key: string]: unknown;
};

/**
 * POST /api/webhooks/resend
 *
 * Resend webhook handler for email events (open, click, bounce, complaint).
 * Verify using Svix signing secret (RESEND_WEBHOOK_SECRET).
 * Open tracking must be enabled at domain level in Resend dashboard.
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const payload = await req.text();
  const id = req.headers.get('svix-id');
  const signature = req.headers.get('svix-signature');
  const timestamp = req.headers.get('svix-timestamp');

  if (!id || !signature || !timestamp) {
    return NextResponse.json(
      { error: 'Missing signature headers' },
      { status: 400 },
    );
  }

  try {
    const wh = new Webhook(webhookSecret);
    wh.verify(payload, {
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    });
  } catch (err) {
    console.error('[resend/webhook] Verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
  }

  let body: { type?: string; data?: ResendWebhookData };
  try {
    body = JSON.parse(payload) as { type?: string; data?: ResendWebhookData };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = body.type as ResendEventType | undefined;
  const data = body.data;

  if (!eventType || !data) {
    return NextResponse.json({ received: true });
  }

  switch (eventType) {
    case 'email.opened':
      console.log('[resend/webhook] email.opened', data.email_id, data.to);
      break;
    case 'email.clicked':
      console.log('[resend/webhook] email.clicked', data.email_id, data.to);
      break;
    case 'email.bounced':
      console.log('[resend/webhook] email.bounced', data.email_id, data.to);
      break;
    case 'email.complained':
      console.log('[resend/webhook] email.complained', data.email_id, data.to);
      break;
    default:
      console.log('[resend/webhook] Unhandled event:', eventType);
  }

  return NextResponse.json({ received: true });
}
