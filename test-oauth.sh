#!/bin/bash

# Test OAuth Token Acquisition for ALEX API
# Usage: ./test-oauth.sh <CLIENT_SECRET>

if [ -z "$1" ]; then
  echo "❌ Error: CLIENT_SECRET required"
  echo ""
  echo "Usage: ./test-oauth.sh <CLIENT_SECRET>"
  echo ""
  echo "You should have received the CLIENT_SECRET from Medtech via OTP retrieval."
  echo "See docs/medtech/medtech-alex-uat-quickstart.md for details."
  exit 1
fi

CLIENT_SECRET="$1"

echo "🔐 Testing OAuth Token Acquisition..."
echo ""
echo "Endpoint: Azure AD OAuth 2.0"
echo "Tenant: 8a024e99-aba3-4b25-b875-28b0c0ca6096"
echo "Client ID: 7685ade3-f1ae-4e86-a398-fe7809c0fed1"
echo "Scope: api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default"
echo ""

RESPONSE=$(curl -sS -X POST \
  'https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=7685ade3-f1ae-4e86-a398-fe7809c0fed1' \
  --data-urlencode "client_secret=${CLIENT_SECRET}" \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode 'scope=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default')

# Check if response contains access_token
if echo "$RESPONSE" | grep -q "access_token"; then
  echo "✅ SUCCESS: Access token acquired"
  echo ""
  
  # Extract token details
  ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  EXPIRES_IN=$(echo "$RESPONSE" | grep -o '"expires_in":[0-9]*' | cut -d':' -f2)
  TOKEN_TYPE=$(echo "$RESPONSE" | grep -o '"token_type":"[^"]*"' | cut -d'"' -f4)
  
  echo "Token Type: $TOKEN_TYPE"
  echo "Expires In: ${EXPIRES_IN}s (~$(($EXPIRES_IN / 60)) minutes)"
  echo ""
  echo "Access Token (first 50 chars): ${ACCESS_TOKEN:0:50}..."
  echo ""
  echo "💾 Token saved to: /tmp/alex_access_token.txt"
  echo "$ACCESS_TOKEN" > /tmp/alex_access_token.txt
  echo ""
  echo "🎯 Next Step: Test a simple FHIR API call"
  echo "   Run: ./test-fhir-call.sh"
  
else
  echo "❌ FAILED: Could not acquire access token"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
  exit 1
fi
