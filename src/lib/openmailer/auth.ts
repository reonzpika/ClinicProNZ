import { NextRequest } from 'next/server';

/**
 * Returns true if the request is authorised as admin (OpenMailer API key or x-user-tier).
 */
export function isAdminAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const apiKey = process.env.OPENMAILER_API_KEY;
  if (apiKey && authHeader === `Bearer ${apiKey}`) {
    return true;
  }
  const tier = req.headers.get('x-user-tier');
  return tier === 'admin';
}
