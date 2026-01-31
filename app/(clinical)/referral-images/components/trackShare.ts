/**
 * Track share click or share completion for referral-images
 */
export async function trackShare(
  userId: string,
  location: string,
  method?: string
): Promise<void> {
  await fetch('/api/referral-images/share/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, location, method }),
  });
}
