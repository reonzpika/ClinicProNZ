/**
 * OpenMailer email helpers: tracking pixel injection, link replacement, Resend send.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const TRACKING_BASE
  = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';

export type LinkMapEntry = {
  url: string;
  shortCode: string;
};

/**
 * Injects a 1x1 tracking pixel into HTML before </body> (or appends if no body).
 */
export function injectTrackingPixel(
  html: string,
  campaignId: string,
  subscriberId: string,
): string {
  const trackingUrl = `${TRACKING_BASE}/api/openmailer/track/open?c=${encodeURIComponent(campaignId)}&s=${encodeURIComponent(subscriberId)}`;
  const pixel = `<img src="${trackingUrl}" width="1" height="1" alt="" style="display:none;" />`;
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }
  return html + pixel;
}

/**
 * Replaces href="url" with tracking redirect URL for each link in the map.
 * Handles both single and double quotes.
 */
export function replaceLinksWithTracking(
  html: string,
  linkMap: LinkMapEntry[],
  subscriberId: string,
): string {
  let out = html;
  for (const { url, shortCode } of linkMap) {
    const trackingUrl = `${TRACKING_BASE}/api/openmailer/track/click/${shortCode}?s=${encodeURIComponent(subscriberId)}`;
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re1 = new RegExp(`href=["']${escaped}["']`, 'gi');
    out = out.replace(re1, `href="${trackingUrl}"`);
  }
  return out;
}

/**
 * Extracts unique URLs from HTML href attributes (supports " and ').
 */
export function extractUrlsFromHtml(html: string): string[] {
  const seen = new Set<string>();
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const url = m[1]?.trim();
    if (url && !url.startsWith('mailto:') && !url.startsWith('#')) {
      seen.add(url);
    }
  }
  return Array.from(seen);
}

export type SendOpenmailerEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from: string;
  replyTo?: string;
};

/**
 * Sends a single email via Resend. Caller is responsible for injecting pixel and replacing links.
 */
export async function sendOpenmailerEmail(
  params: SendOpenmailerEmailParams,
): Promise<{ success: true; messageId: string } | { success: false; error: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id ?? '' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
