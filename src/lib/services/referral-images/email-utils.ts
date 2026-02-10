/**
 * Email utilities for GP Referral Images
 *
 * HTML sanitisation and template variable replacement for safe email content.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitise HTML for use in email bodies.
 * Strips script tags, event handlers, and other unsafe content.
 */
export function sanitizeEmailHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
'div',
'span',
'br',
'strong',
'b',
'em',
'i',
'u',
'a',
'ul',
'ol',
'li',
      'h1',
'h2',
'h3',
'h4',
'h5',
'h6',
'table',
'thead',
'tbody',
'tr',
'th',
'td',
    ],
    ALLOWED_ATTR: ['href', 'style', 'target', 'rel'],
  });
}

/**
 * Replace {{key}} placeholders in a template with sanitised values.
 * Values are sanitised to prevent XSS when rendered into HTML.
 */
export function renderEmailTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholder, sanitizeEmailHtml(value));
  }
  return result;
}
