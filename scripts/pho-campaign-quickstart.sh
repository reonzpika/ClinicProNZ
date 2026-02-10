#!/bin/bash
# PHO Email Campaign Quickstart
# Run this locally where you have DATABASE_URL configured

set -e

echo "╔════════════════════════════════════════════╗"
echo "║  PHO Email Campaign Quickstart             ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if app is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  App not running on localhost:3000"
    echo ""
    echo "Please start the app first:"
    echo "  pnpm dev"
    echo ""
    exit 1
fi

echo "✓ App is running on localhost:3000"
echo ""

# Step 1: Import new PHO contacts
echo "━━━ STEP 1: Import New PHO Contacts ━━━"
echo ""

IMPORT_RESULT=$(curl -s -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat ~/.clinicpro-session-cookie 2>/dev/null || echo '')" \
  -d '{"action": "import"}')

echo "$IMPORT_RESULT" | jq '.'

IMPORT_SUCCESS=$(echo "$IMPORT_RESULT" | jq -r '.success // 0')
echo ""
echo "✓ Imported $IMPORT_SUCCESS new PHO contacts"
echo ""

# Step 2: Create test campaign
echo "━━━ STEP 2: Create Test Campaign ━━━"
echo ""

TEST_RESULT=$(curl -s -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat ~/.clinicpro-session-cookie 2>/dev/null || echo '')" \
  -d '{"action": "create-test"}')

echo "$TEST_RESULT" | jq '.'

TEST_CAMPAIGN_ID=$(echo "$TEST_RESULT" | jq -r '.campaignId')
TEST_CAMPAIGN_URL=$(echo "$TEST_RESULT" | jq -r '.url')

echo ""
echo "✓ Test campaign created"
echo "  Campaign ID: $TEST_CAMPAIGN_ID"
echo "  URL: http://localhost:3000$TEST_CAMPAIGN_URL"
echo ""

# Prompt for test send
echo "━━━ STEP 3: Send Test Email ━━━"
echo ""
echo "Next steps:"
echo "  1. Open: http://localhost:3000$TEST_CAMPAIGN_URL"
echo "  2. Click 'Send campaign'"
echo "  3. Check ryo@clinicpro.co.nz inbox"
echo "  4. Verify email looks good"
echo ""

read -p "Press Enter after you've sent and verified the test email..."
echo ""

# Step 4: Create production campaign
echo "━━━ STEP 4: Create Production Campaign ━━━"
echo ""

PROD_RESULT=$(curl -s -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat ~/.clinicpro-session-cookie 2>/dev/null || echo '')" \
  -d '{"action": "create-production"}')

echo "$PROD_RESULT" | jq '.'

PROD_CAMPAIGN_ID=$(echo "$PROD_RESULT" | jq -r '.campaignId')
PROD_CAMPAIGN_URL=$(echo "$PROD_RESULT" | jq -r '.url')
TOTAL_RECIPIENTS=$(echo "$PROD_RESULT" | jq -r '.totalRecipients')

echo ""
echo "✓ Production campaign created"
echo "  Campaign ID: $PROD_CAMPAIGN_ID"
echo "  Total recipients: $TOTAL_RECIPIENTS PHO contacts"
echo "  URL: http://localhost:3000$PROD_CAMPAIGN_URL"
echo ""

# Step 5: Send to all PHOs
echo "━━━ STEP 5: Send to All PHOs ━━━"
echo ""
echo "⚠️  IMPORTANT: This will send emails to $TOTAL_RECIPIENTS PHO contacts"
echo ""
echo "Next steps:"
echo "  1. Open: http://localhost:3000$PROD_CAMPAIGN_URL"
echo "  2. Review recipients list"
echo "  3. Click 'Send campaign' when ready"
echo ""
echo "After sending, monitor results at:"
echo "  http://localhost:3000/openmailer/campaigns/$PROD_CAMPAIGN_ID"
echo ""

echo "╔════════════════════════════════════════════╗"
echo "║  Setup Complete!                           ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Campaign URLs:"
echo "  Test: http://localhost:3000$TEST_CAMPAIGN_URL"
echo "  Production: http://localhost:3000$PROD_CAMPAIGN_URL"
echo ""
