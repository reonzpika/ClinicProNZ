/**
 * Email Service for GP Referral Images
 *
 * Uses Resend to send email sequences
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'ClinicPro <notifications@clinicpro.co.nz>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';

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

  const desktopLink = `${APP_URL}/referral-images/desktop?u=${userId}`;
  const mobileLink = `${APP_URL}/referral-images/capture?u=${userId}`;

  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your GP Referral Images links are ready 📸',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>Your referral photo tool is set up and ready.</p>
        
        <h3>🖥️ Desktop Link (bookmark this):</h3>
        <p><a href="${desktopLink}" style="color: #0070e0;">${desktopLink}</a></p>
        
        <h3>📱 Mobile Capture Link (save to phone's home screen):</h3>
        <p><a href="${mobileLink}" style="color: #0070e0;">${mobileLink}</a></p>
        
        <h3>💡 Quick Start:</h3>
        <ol>
          <li>Open desktop link on computer (bookmark it)</li>
          <li>Send mobile link to your phone</li>
          <li>Save mobile link to home screen</li>
          <li>Open when you need referral photos</li>
        </ol>
        
        <p>These are YOUR permanent links. Same links work every time.</p>
        
        <p>Cheers,<br>ClinicPro Team</p>
      </div>
    `,
  });
}

/**
 * Email 2: Usage Tip (Day 3, if 1+ image captured)
 */
export async function sendUsageTipEmail(data: EmailData) {
  const { email, name } = data;

  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Quick tip: Use GP Referral Images for these 3 things',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've started using GP Referral Images - nice!</p>
        
        <h3>Here's what other GPs use it for:</h3>
        
        <h4>1. 📋 Specialist Referral Photos</h4>
        <p>→ Saves 10+ min per referral<br>
        → Auto-sized for email (&lt;500KB, no rejections)</p>
        
        <h4>2. 📸 Wound Progress Documentation</h4>
        <p>→ Before/after tracking for clinical notes</p>
        
        <h4>3. 🏥 Pre-Procedure Records</h4>
        <p>→ Insurance claims documentation</p>
        
        <p>Keep capturing. It gets easier every time.</p>
      </div>
    `,
  });
}

/**
 * Email 3: Value Reinforcement (Day 7, if 3+ images)
 */
export async function sendValueReinforcementEmail(data: EmailData & { imageCount: number }) {
  const { email, name, imageCount } = data;
  const timeSaved = imageCount * 5;
  const hoursSaved = Math.floor(timeSaved / 60);
  const minutesSaved = timeSaved % 60;

  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `You've saved ${timeSaved} minutes with GP Referral Images`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've captured ${imageCount} images with GP Referral Images.</p>
        
        <h3>📊 Your Time Savings:</h3>
        <ul>
          <li>Images captured: ${imageCount}</li>
          <li>Average time saved per image: 5 minutes</li>
          <li>Total time saved: ${timeSaved} minutes</li>
        </ul>
        
        <p>That's ${hoursSaved > 0 ? `${hoursSaved} hours and ${minutesSaved} minutes` : `${minutesSaved} minutes`} back in your day. 💪</p>
        
        <h3>Share the love:</h3>
        <p>Know a colleague who emails referral photos to themselves?<br>
        Send them this: <a href="${APP_URL}/referral-images" style="color: #0070e0;">${APP_URL}/referral-images</a></p>
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
    subject: 'Help keep GP Referral Images running?',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>You've used GP Referral Images 10 times this month - great!</p>
        
        <p><strong>Quick context:</strong><br>
        I built this as a GP frustrated with existing tools. No venture capital, no corporate owners.</p>
        
        <h3>Your support keeps this project alive:</h3>
        <ul>
          <li>✓ $50 one-time (not a subscription)</li>
          <li>✓ Unlimited images forever</li>
          <li>✓ All future updates included</li>
          <li>✓ Early access to our upcoming Inbox AI tool</li>
        </ul>
        
        <p><a href="${APP_URL}/referral-images/upgrade" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px;">Support GP Referral Images - $50</a></p>
        
        <p>Thanks for trying what I built.</p>
        
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
        
        <p>Quick reminder: You've used your 10 free images this month.</p>
        
        <h3>Options:</h3>
        <ol>
          <li>Wait ${daysUntilReset} days for 10 more free images</li>
          <li>Upgrade to unlimited now ($50 one-time) → Never hit limits again</li>
        </ol>
        
        <p><a href="${APP_URL}/referral-images/upgrade" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px;">Upgrade Now - $50</a></p>
        
        <p>No pressure - free tier resets next month.</p>
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
    subject: 'Your 10 free images are back 🎉',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>Good news - your monthly limit has reset.</p>
        
        <p>You have 10 more free images this month.</p>
        
        <p>Or upgrade to unlimited and never think about limits again:</p>
        <ul>
          <li>✓ $50 one-time</li>
          <li>✓ All future features included</li>
        </ul>
        
        <p><a href="${APP_URL}/referral-images/upgrade" style="display: inline-block; padding: 12px 24px; background: #0070e0; color: white; text-decoration: none; border-radius: 6px;">Upgrade to Unlimited - $50</a></p>
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
    subject: 'Thank you for supporting GP Referral Images! 🎉',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name || 'there'},</h2>
        
        <p>Your support means everything.</p>
        
        <h3>You now have:</h3>
        <ul>
          <li>✅ Unlimited referral images forever</li>
          <li>✅ All future features automatically</li>
          <li>✅ Priority early access to our upcoming Inbox AI tool</li>
          <li>✅ Our deepest gratitude</li>
        </ul>
        
        <p>No more limits. No more prompts. Just capture as many images as you need.</p>
        
        <p>Thank you for supporting GP-built tools.</p>
        
        <p>Dr. Ryo, GP</p>
        
        <p style="font-size: 14px; color: #666;">P.S. Keep an eye out for Inbox AI launch emails. You'll be among the first to get early access.</p>
      </div>
    `,
  });
}
