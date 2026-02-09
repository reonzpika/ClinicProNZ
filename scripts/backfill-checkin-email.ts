/**
 * One-time backfill script: Send Email 2 (check-in) to existing users
 * 
 * Run this once after deploying the Email 2 feature to catch users who
 * signed up before the feature was implemented.
 * 
 * Usage:
 *   pnpm tsx scripts/backfill-checkin-email.ts
 *   
 * Or with dry-run (doesn't send emails, just shows who would receive):
 *   DRY_RUN=true pnpm tsx scripts/backfill-checkin-email.ts
 */

import { eq, sql } from 'drizzle-orm';
import { users } from '@/db/schema';
import { sendCheckInEmail } from '@/src/lib/services/referral-images/email-service';
import { getDb } from 'database/client';

const DRY_RUN = process.env.DRY_RUN === 'true';

async function backfillCheckInEmails() {
  console.log('='.repeat(60));
  console.log('Referral Images: Email 2 (Check-in) Backfill');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no emails sent)' : 'LIVE (emails will be sent)'}`);
  console.log('');

  const db = getDb();

  // Find all users who:
  // - Haven't received the check-in email yet
  // - Have an email address
  // - Signed up more than 3 days ago
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  console.log(`Finding users who signed up before: ${threeDaysAgo.toISOString()}`);
  console.log('');

  const eligibleUsers = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      sql`${users.checkInEmailSentAt} IS NULL 
          AND ${users.email} IS NOT NULL 
          AND ${users.createdAt} < ${threeDaysAgo}`,
    );

  console.log(`Found ${eligibleUsers.length} eligible user(s)\n`);

  if (eligibleUsers.length === 0) {
    console.log('✅ No users to process. Exiting.');
    return;
  }

  if (DRY_RUN) {
    console.log('DRY RUN - Would send emails to:');
    console.log('-'.repeat(60));
    for (const user of eligibleUsers) {
      console.log(`- ${user.email} (signed up: ${user.createdAt})`);
    }
    console.log('-'.repeat(60));
    console.log(`\nTotal: ${eligibleUsers.length} email(s) would be sent`);
    console.log('\nTo actually send emails, run: pnpm tsx scripts/backfill-checkin-email.ts');
    return;
  }

  // LIVE MODE - Send emails
  let successCount = 0;
  let failCount = 0;

  console.log('Sending emails...\n');

  for (const user of eligibleUsers) {
    const email = user.email!;
    const name = user.name ?? email.split('@')[0];

    try {
      console.log(`Sending to: ${email}...`);
      
      await sendCheckInEmail({
        email,
        name,
        userId: user.userId,
      });

      await db
        .update(users)
        .set({
          checkInEmailSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.userId));

      successCount++;
      console.log(`  ✅ Sent successfully`);
    }
    catch (error) {
      failCount++;
      console.error(`  ❌ Failed:`, error instanceof Error ? error.message : error);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Backfill Complete');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${eligibleUsers.length}`);
  console.log('');
}

// Run the script
backfillCheckInEmails()
  .then(() => {
    console.log('Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
