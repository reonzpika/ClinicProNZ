/**
 * Test script for Phase 5: Freemium Limits Testing
 *
 * This script helps set up database states for testing:
 * 1. Reset user to free tier
 * 2. Set usage to specific levels (5, 10, 20, 30)
 * 3. Reset grace unlocks
 */

import 'dotenv/config';

import { neon } from '@neondatabase/serverless';

const TEST_USER_ID = 'user_38zrWisMx2mGMw0pxAw9mYqWGgv';
const CURRENT_MONTH = '2026-01';

const sql = neon(process.env.DATABASE_URL);

async function resetToFreeTier() {
  console.log('\n🔄 Resetting user to FREE tier...');

  await sql`
    UPDATE users 
    SET image_tier = 'free'
    WHERE id = ${TEST_USER_ID}
  `;

  console.log('✅ User reset to FREE tier');
}

async function setUsage(imageCount, graceUnlocks = 0) {
  console.log(`\n📊 Setting usage to: ${imageCount} images, ${graceUnlocks} grace unlocks used`);

  // Upsert usage record (delete + insert)
  await sql`
    INSERT INTO image_tool_usage (user_id, month, image_count, grace_unlocks_used, created_at, updated_at)
    VALUES (${TEST_USER_ID}, ${CURRENT_MONTH}, ${imageCount}, ${graceUnlocks}, NOW(), NOW())
    ON CONFLICT (user_id, month) 
    DO UPDATE SET 
      image_count = ${imageCount},
      grace_unlocks_used = ${graceUnlocks},
      updated_at = NOW()
  `;

  console.log(`✅ Usage set to ${imageCount} images, ${graceUnlocks} grace unlocks`);
}

async function backdateUserOneMonth() {
  console.log('\n🔄 Backdating user created_at by 1 month (simulate Month 2)...');
  await sql`
    UPDATE users
    SET created_at = created_at - INTERVAL '1 month'
    WHERE id = ${TEST_USER_ID}
  `;
  console.log('✅ User backdated');
}

async function setPremiumTier() {
  console.log('\n🔄 Setting user to PREMIUM tier (Phase 7)...');
  await sql`
    UPDATE users
    SET image_tier = 'premium', upgraded_at = NOW()
    WHERE id = ${TEST_USER_ID}
  `;
  console.log('✅ User set to PREMIUM tier');
}

async function showCurrentState() {
  console.log('\n📋 Current User State:');

  const user = await sql`
    SELECT image_tier, created_at 
    FROM users 
    WHERE id = ${TEST_USER_ID}
    LIMIT 1
  `;

  if (!user.length) {
    console.log('❌ User not found!');
    return;
  }

  console.log(`   Tier: ${user[0].image_tier || 'free'}`);
  console.log(`   Created: ${user[0].created_at}`);

  const usage = await sql`
    SELECT image_count, grace_unlocks_used
    FROM image_tool_usage
    WHERE user_id = ${TEST_USER_ID} AND month = ${CURRENT_MONTH}
    LIMIT 1
  `;

  if (usage.length) {
    console.log(`   Images: ${usage[0].image_count}`);
    console.log(`   Grace Unlocks Used: ${usage[0].grace_unlocks_used}`);
  } else {
    console.log('   No usage record for current month');
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'reset':
    await resetToFreeTier();
    await setUsage(0, 0);
    await showCurrentState();
    console.log('\n✨ Ready to test from clean state (0/5 images)');
    break;

  case 'limit':
    // Set to limit (5/5 for free tier, first month)
    await resetToFreeTier();
    await setUsage(5, 0);
    await showCurrentState();
    console.log('\n✨ Ready to test limit reached (5/5 images)');
    break;

  case 'grace1':
    // After first grace unlock (5/15)
    await resetToFreeTier();
    await setUsage(5, 1);
    await showCurrentState();
    console.log('\n✨ Ready to test after grace unlock #1 (5/15 images)');
    break;

  case 'grace2':
    // After second grace unlock (5/25)
    await resetToFreeTier();
    await setUsage(5, 2);
    await showCurrentState();
    console.log('\n✨ Ready to test after grace unlock #2 (5/25 images)');
    break;

  case 'maxgrace':
    // Hit limit with max grace (25/25)
    await resetToFreeTier();
    await setUsage(25, 2);
    await showCurrentState();
    console.log('\n✨ Ready to test max grace limit (25/25 images, no more grace available)');
    break;

  case 'phase5-setup':
    // Plan Phase 5: Simulate Month 2 with 10/10 used
    await resetToFreeTier();
    await backdateUserOneMonth();
    await setUsage(10, 0);
    await showCurrentState();
    console.log('\n✨ Phase 5 ready: 10/10 used (Month 2 limit reached)');
    break;

  case 'set-20':
    await setUsage(20, 1);
    await showCurrentState();
    console.log('\n✨ Usage set to 20/20 (after grace unlock #1)');
    break;

  case 'set-30':
    await setUsage(30, 2);
    await showCurrentState();
    console.log('\n✨ Usage set to 30/30 (after grace unlock #2, no more grace)');
    break;

  case 'phase7-setup':
  case 'premium':
    await setPremiumTier();
    await showCurrentState();
    console.log('\n✨ Phase 7 ready: user is PREMIUM (no limits)');
    break;

  case 'status':
    await showCurrentState();
    break;

  default:
    console.log(`
📖 Usage:

  node test-phase5-limits.mjs [command]

Commands:
  reset        - Reset to free tier, 0 images, 0 grace unlocks
  limit        - Set to 5/5 (free tier limit reached)
  grace1       - Set to 5/15 (after first grace unlock)
  grace2       - Set to 5/25 (after second grace unlock)
  maxgrace     - Set to 25/25 (both grace unlocks used, limit reached)
  phase5-setup - Backdate user 1 month, set 10/10 (Phase 5 plan)
  set-20       - Set usage to 20, grace 1 (after first unlock)
  set-30       - Set usage to 30, grace 2 (after second unlock)
  phase7-setup - Set user to premium tier (Phase 7)
  premium      - Alias for phase7-setup
  status       - Show current user state

Phase 5 Plan Flow (10/10, 10/20, 20/30, 30/30):
  1. node test-phase5-limits.mjs phase5-setup
  2. GET status → expect 10/10, limitReached
  3. POST unlock-grace → expect 10/20
  4. node test-phase5-limits.mjs set-20
  5. POST unlock-grace → expect 20/30
  6. node test-phase5-limits.mjs set-30
  7. POST unlock-grace → expect rejected (max 2)
`);
    process.exit(1);
}

process.exit(0);
