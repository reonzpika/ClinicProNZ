/**
 * Email Service for GP Referral Images
 *
 * Uses Resend to send email sequences
 */

import { Resend } from 'resend';

// Check if API key exists and log for debugging
const apiKey = process.env.RESEND_API_KEY;
console.log('[email-service] RESEND_API_KEY exists:', !!apiKey);
console.log('[email-service] RESEND_API_KEY length:', apiKey?.length ?? 0);
console.log('[email-service] RESEND_API_KEY prefix:', apiKey?.substring(0, 7) ?? 'none');

const resend = new Resend(apiKey);

const FROM_EMAIL = 'ClinicPro <ryo@clinicpro.co.nz>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';

console.log('[email-service] Configuration:', {
  FROM_EMAIL,
  APP_URL,
  hasApiKey: !!apiKey,
});

export interface EmailData {
  email: string;
  name?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Email 1: Welcome (Day 0, immediate after signup)
 */
export async function sendWelcomeEmail(data: EmailData) {
  const { email, name, userId } = data;

  console.log('[sendWelcomeEmail] Starting email send:', {
    to: email,
    name,
    userId,
    timestamp: new Date().toISOString(),
  });

  const desktopLink = `${APP_URL}/referral-images/desktop?u=${userId}`;
  const mobileLink = `${APP_URL}/referral-images/capture?u=${userId}`;

  console.log('[sendWelcomeEmail] Generated links:', {
    desktopLink,
    mobileLink,
  });

  try {
    console.log('[sendWelcomeEmail] Calling Resend API...');
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Referral Images links - ready to use',
      html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You're all set. Here are your permanent links:</p>
        
        <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        
        <h3>Desktop link (bookmark this):</h3>
        <p><a href="${desktopLink}" style="color: #0070e0;">${desktopLink}</a></p>
        
        <h3>Mobile link (save to home screen):</h3>
        <p><a href="${mobileLink}" style="color: #0070e0;">${mobileLink}</a></p>
        
        <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        
        <h3>How to use it:</h3>
        <ol>
          <li>Bookmark the desktop link on your computer</li>
          <li>Save the mobile link to your phone's home screen</li>
          <li>Take photo on mobile during consult</li>
          <li>Photo appears on desktop instantly - download JPEG and attach to referral</li>
        </ol>
        
        <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        
        <p>These links are permanent. Bookmark them and you're done.</p>
        
        <p>No credit card required. Free to use.</p>
        
        <p>Cheers,<br>Dr. Ryo</p>
        
        <p style="color: #666; font-size: 14px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        <p style="font-size: 12px; color: #888;">Questions? Just reply to this email. - Ryo</p>
      </div>
    `,
    });

    console.log('[sendWelcomeEmail] Resend API response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('[sendWelcomeEmail] Resend returned error:', result.error);
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }

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
 * Email 2: Usage Tip (Day 3, if 1+ image captured)
 */
export async function sendUsageTipEmail(data: EmailData) {
  const { email, name } = data;

  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'What other GPs use Referral Images for',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've captured your first image. Here's what other GPs use it for:</p>
        
        <h4>Specialist referrals (dermatology, plastics, etc.)</h4>
        <p>Always JPEG, auto-sized, under 500KB. Dermatologists won't reject them.</p>
        
        <h4>Wound progress tracking</h4>
        <p>Before/after photos for clinical notes</p>
        
        <h4>Insurance/ACC documentation</h4>
        <p>Pre-procedure records, claims</p>
        
        <p>That's it. Keep using it - saves you &gt;10 minutes every time.</p>
      </div>
    `,
  });
}

/**
 * Email 3: Value Reinforcement (Day 7, if 3+ images)
 */
export async function sendValueReinforcementEmail(data: EmailData & { imageCount: number }) {
  const { email, name, imageCount } = data;
  const timeSaved = imageCount * 10;

  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `You've saved ${timeSaved} minutes this week`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've captured ${imageCount} referral images so far.</p>
        
        <h3>Time you've saved:</h3>
        <ul>
          <li>Images captured: ${imageCount}</li>
          <li>Average time saved per referral: 10 minutes</li>
          <li>Total time saved: ${timeSaved} minutes</li>
        </ul>
        
        <p>That's time you're not staying late or doing during breaks.</p>
        
        <h3>Know a colleague still emailing photos to themselves?</h3>
        <p>Send them this: <a href="${APP_URL}/referral-images" style="color: #0070e0;">${APP_URL}/referral-images</a></p>
      </div>
    `,
  });
}

/**
 * Email 4: Limit Hit (Month 2+, when 10 images reached)
 */
export async function sendLimitHitEmail(data: EmailData) {
  const { email, name } = data;

  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "You've hit your 10 free images this month",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've captured 10 images this month. The tool's clearly helping you.</p>
        
        <p><strong>A bit of context:</strong><br>
        I'm a fellow GP who built this to fix our shared workflow pain. No VC funding, no corporate backing.</p>
        
        <h3>$50 one-time gets you:</h3>
        <ul>
          <li>Unlimited images forever</li>
          <li>All future features</li>
          <li>Early access to Inbox Intelligence</li>
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
 * Email 5: Follow-up (24h after limit, if no upgrade)
 */
export async function sendFollowUpEmail(data: EmailData & { daysUntilReset: number }) {
  const { email, name, daysUntilReset } = data;

  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Still need more images this month?',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've used your 10 free images. Two options:</p>
        
        <ol>
          <li>Wait ${daysUntilReset} days for 10 more free images</li>
          <li>Upgrade to unlimited ($50 one-time, not a subscription)</li>
        </ol>
        
        <p><a href="${APP_URL}/referral-images/upgrade" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px;">Support This Project - $50</a></p>
        
        <p>No pressure. Free tier resets next month.</p>
      </div>
    `,
  });
}

/**
 * Email 6: Month Reset (if didn't upgrade, at month boundary)
 */
export async function sendMonthResetEmail(data: EmailData) {
  const { email, name } = data;

  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your 10 free images have reset',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>Your monthly limit has reset.</p>
        
        <p>You have 10 more free images.</p>
        
        <p>Or upgrade to unlimited and stop thinking about limits:</p>
        <ul>
          <li>$50 one-time (not a subscription)</li>
          <li>All future features</li>
        </ul>
        
        <p><a href="${APP_URL}/referral-images/upgrade" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px;">Support This Project - $50</a></p>
      </div>
    `,
  });
}

/**
 * Email 7: Premium Confirmation (after $50 payment)
 */
export async function sendPremiumConfirmationEmail(data: EmailData) {
  const { email, name } = data;

  return await resend.emails.send({
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
          <li>All future features</li>
          <li>Early access to Inbox Intelligence</li>
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

  console.log('[sendMobileLinkEmail] Starting email send:', {
    to: email,
    mobileLink,
    desktopLink,
    timestamp: new Date().toISOString(),
  });

  try {
    console.log('[sendMobileLinkEmail] Calling Resend API...');
    const result = await resend.emails.send({
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

    console.log('[sendMobileLinkEmail] Resend API response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('[sendMobileLinkEmail] Resend returned error:', result.error);
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }

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
