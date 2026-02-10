/**
 * Email Service for GP Referral Images
 *
 * Uses Resend to send email sequences
 */

import { Resend } from 'resend';

let resend: Resend | null = null;
function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

const FROM_EMAIL = 'ClinicPro <ryo@clinicpro.co.nz>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';

export type EmailData = {
  email: string;
  name?: string;
  userId?: string;
  [key: string]: any;
};

/**
 * Email 1: Welcome (Day 0, immediate after signup)
 */
export async function sendWelcomeEmail(data: EmailData) {
  const { email, name, userId } = data;

  // eslint-disable-next-line no-console
  console.log('[sendWelcomeEmail] Starting email send:', {
    to: email,
    name,
    userId,
    timestamp: new Date().toISOString(),
  });

  const desktopLink = `${APP_URL}/referral-images/desktop?u=${userId}`;
  const mobileLink = `${APP_URL}/referral-images/capture?u=${userId}`;

  // eslint-disable-next-line no-console
  console.log('[sendWelcomeEmail] Generated links:', {
    desktopLink,
    mobileLink,
  });

  try {
    // eslint-disable-next-line no-console
    console.log('[sendWelcomeEmail] Calling Resend API...');
    const client = getResendClient();
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Referral Images links - 3 steps to get started',
      html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p><strong>3 steps to get started:</strong></p>
        <ol style="line-height: 1.8;">
          <li><strong>Open the desktop link</strong> on your computer and bookmark it</li>
          <li><strong>Save the mobile link</strong> to your phone's home screen</li>
          <li><strong>Take a photo</strong> during your next consult and watch it appear on your desktop instantly</li>
        </ol>
        
        <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        
        <h3>Desktop link:</h3>
        <p><a href="${desktopLink}" style="color: #0070e0;">${desktopLink}</a></p>
        
        <h3>Mobile link:</h3>
        <p><a href="${mobileLink}" style="color: #0070e0;">${mobileLink}</a></p>
        
        <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        
        <p>Don't share your personal links. To share the tool with colleagues, use: <a href="${APP_URL}/referral-images" style="color: #0070e0;">${APP_URL}/referral-images</a></p>
        
        <p>Free to use. No credit card required.</p>
        
        <p>Cheers,<br>Dr. Ryo</p>
        
        <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        <p style="font-size: 12px; color: #888;">Questions? Just reply to this email. - Ryo</p>
      </div>
    `,
    });

    // eslint-disable-next-line no-console
    console.log('[sendWelcomeEmail] Resend API response:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('[sendWelcomeEmail] Resend returned error:', result.error);
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }

    // eslint-disable-next-line no-console
    console.log('[sendWelcomeEmail] Email sent successfully:', result.data?.id);
    return result;
  } catch (error: any) {
    console.error('[sendWelcomeEmail] Failed to send email:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      fullError: JSON.stringify(error, null, 2),
    });
    throw error;
  }
}

/**
 * Email 2: Check-in (Day 3 after signup, all users)
 */
export async function sendCheckInEmail(data: EmailData) {
  const { email, name } = data;
  const client = getResendClient();

  return await client.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'How\'s Referral Images working for you?',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've been using Referral Images for a few days now.</p>
        
        <p>Quick check-in: How's it working for you?</p>
        
        <ul style="line-height: 1.8;">
          <li>Is the tool saving you time?</li>
          <li>Any issues or frustrations?</li>
          <li>Missing a feature you need?</li>
        </ul>
        
        <p>Just hit reply and let me know. I'm a GP too, so I get it.</p>
        
        <p>Cheers,<br>Dr. Ryo</p>
        
        <p style="font-size: 14px; color: #666;">P.S. If it's working well, keep using it. If not, I want to fix it.</p>
      </div>
    `,
  });
}

/**
 * Email 4: Limit Hit (Month 2+, when 10 images reached)
 */
export async function sendLimitHitEmail(data: EmailData) {
  const { email, name } = data;
  const client = getResendClient();

  return await client.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'You\'ve hit your 10 free images this month',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've captured 10 images this month. The tool's clearly helping you.</p>
        
        <p><strong>A bit of context:</strong><br>
        I'm a fellow GP who built this after hours because I was tired of emailing photos to myself. No investors, no big company. Just me. Your support keeps me going.</p>
        
        <h3>$50 one-time gets you:</h3>
        <ul>
          <li>Unlimited images forever</li>
          <li>Early access to Inbox Intelligence and AI Scribe</li>
        </ul>
        
        <p><a href="${APP_URL}/referral-images/upgrade" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px;">Support This Project - $50</a></p>
        
        <p>No pressure. Thanks for trying it.</p>
        
        <p>Dr. Ryo, GP</p>
        
        <p style="font-size: 14px; color: #666;">P.S. If now's not the right time, I've given you 10 more free images to keep using the tool.</p>
      </div>
    `,
  });
}

/**
 * Email 5: Share Encourage (5 days after limit hit, if user has NOT upgraded)
 */
export async function sendShareEncourageEmail(data: EmailData) {
  const { email, name } = data;
  const shareUrl = 'https://clinicpro.co.nz/referral-images';
  const client = getResendClient();

  return await client.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Know someone who\'d find this useful?',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>Quick note - you've been using Referral Images for a bit now.</p>
        
        <p>If it's saving you time, chances are it'll help your colleagues too.</p>
        
        <p>Share this link with GPs in your practice who still email photos to themselves:<br>
        <a href="${shareUrl}" style="color: #0070e0;">${shareUrl}</a></p>
        
        <p>That's all. Thanks for using it.</p>
        
        <p>Cheers,<br>Dr. Ryo</p>
      </div>
    `,
  });
}

/**
 * Email 6: Month Reset (if didn't upgrade, at month boundary)
 */
export async function sendMonthResetEmail(data: EmailData) {
  const { email, name } = data;
  const client = getResendClient();

  return await client.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your 10 free images have reset',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>Your monthly limit has reset. You have 10 more free images.</p>
        
        <p>Or upgrade to unlimited and stop thinking about limits:</p>
        <ul>
          <li>$50 one-time (not a subscription)</li>
          <li>Never hit this wall again</li>
        </ul>
        
        <p><a href="${APP_URL}/referral-images/upgrade" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px;">Support This Project - $50</a></p>
        
        <p>Cheers,<br>Dr. Ryo</p>
      </div>
    `,
  });
}

/**
 * Email 7: Premium Confirmation (after $50 payment)
 */
export async function sendPremiumConfirmationEmail(data: EmailData) {
  const { email, name } = data;
  const client = getResendClient();

  return await client.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Thank you for supporting this project',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>Thank you. Your support means everything.</p>
        
        <h3>You now have:</h3>
        <ul>
          <li>Unlimited images forever</li>
          <li>Early access to Inbox Intelligence and AI Scribe</li>
        </ul>
        
        <p>No more limits. Just use it.</p>
        
        <p>Thanks for supporting GP-built tools.</p>
        
        <p>Cheers,<br>Dr. Ryo</p>
        
        <p style="font-size: 14px; color: #666;">P.S. I'll email you when Inbox Intelligence launches. You'll get early access.</p>
      </div>
    `,
  });
}

/**
 * Email: Send Mobile and Desktop Links to Self
 */
export async function sendMobileLinkEmail(data: EmailData & { mobileLink: string; desktopLink: string }) {
  const { email, mobileLink, desktopLink } = data;

  // eslint-disable-next-line no-console
  console.log('[sendMobileLinkEmail] Starting email send:', {
    to: email,
    mobileLink,
    desktopLink,
    timestamp: new Date().toISOString(),
  });

  try {
    // eslint-disable-next-line no-console
    console.log('[sendMobileLinkEmail] Calling Resend API...');
    const client = getResendClient();
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Referral Images links',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Referral Images Links</h2>
          
          <p>Here are your permanent links:</p>
          
          <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
          
          <h3 style="margin-top: 24px; margin-bottom: 12px;">📱 Mobile Link</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 12px;">Use on your phone to capture images</p>
          
          <p style="margin: 16px 0;">
            <a href="${mobileLink}" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Mobile Page</a>
          </p>
          
          <p style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; word-break: break-all; color: #333;">
            ${mobileLink}
          </p>
          
          <h3 style="margin-top: 32px; margin-bottom: 12px;">🖥️ Desktop Link</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 12px;">Use on your computer to view and download images</p>
          
          <p style="margin: 16px 0;">
            <a href="${desktopLink}" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Desktop Page</a>
          </p>
          
          <p style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; word-break: break-all; color: #333;">
            ${desktopLink}
          </p>
          
          <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
          
          <h3>💡 Save to Home Screen</h3>
          <p>For quick access during consults:</p>
          
          <p><strong>iPhone:</strong></p>
          <ol style="color: #666;">
            <li>Open the link in Safari</li>
            <li>Tap the Share button (□↑)</li>
            <li>Scroll and tap "Add to Home Screen"</li>
            <li>Tap "Add"</li>
          </ol>
          
          <p><strong>Android:</strong></p>
          <ol style="color: #666;">
            <li>Open the link in Chrome</li>
            <li>Tap the menu (⋮) in top-right</li>
            <li>Tap "Add to Home screen"</li>
            <li>Tap "Add"</li>
          </ol>
          
          <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
          
          <p>Cheers,<br>Dr. Ryo</p>
        </div>
      `,
    });

    // eslint-disable-next-line no-console
    console.log('[sendMobileLinkEmail] Resend API response:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('[sendMobileLinkEmail] Resend returned error:', result.error);
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }

    // eslint-disable-next-line no-console
    console.log('[sendMobileLinkEmail] Email sent successfully:', result.data?.id);
    return result;
  } catch (error: any) {
    console.error('[sendMobileLinkEmail] Failed to send email:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      fullError: JSON.stringify(error, null, 2),
    });
    throw error;
  }
}
