#!/bin/bash

# Test FHIR API Call to ALEX UAT
# Usage: ./test-fhir-call.sh [ACCESS_TOKEN]

if [ ! -z "$1" ]; then
  TOKEN="$1"
elif [ -f /tmp/alex_access_token.txt ]; then
  TOKEN=$(cat /tmp/alex_access_token.txt)
  echo "📖 Using token from /tmp/alex_access_token.txt"
else
  echo "❌ Error: ACCESS_TOKEN required"
  echo ""
  echo "Usage: ./test-fhir-call.sh <ACCESS_TOKEN>"
  echo "   OR: Run ./test-oauth.sh first to acquire token"
  exit 1
fi

echo ""
echo "🏥 Testing FHIR API Call to ALEX UAT..."
echo ""
echo "Endpoint: https://alexapiuat.medtechglobal.com/FHIR/Patient"
echo "Query: identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016"
echo "Facility: F2N060-E (UAT)"
echo ""

# Per Medtech support: only mt-facilityid header is needed (along with Authorization and Content-Type)
RESPONSE=$(curl -sS -w "\nHTTP_STATUS:%{http_code}" -X GET \
  "https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/fhir+json' \
  -H 'mt-facilityid: F2N060-E')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ SUCCESS: Patient data retrieved"
  echo ""
  echo "Response (formatted):"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
elif [ "$HTTP_STATUS" = "401" ]; then
  echo "❌ FAILED: Unauthorized (401)"
  echo ""
  echo "Possible causes:"
  echo "  - Token expired (tokens last ~1 hour)"
  echo "  - Invalid token"
  echo "  - Incorrect client credentials"
  echo ""
  echo "Run ./test-oauth.sh again to acquire fresh token"
elif [ "$HTTP_STATUS" = "403" ]; then
  echo "❌ FAILED: Forbidden (403)"
  echo ""
  echo "Possible causes:"
  echo "  - Incorrect facility ID (mt-facilityid header)"
  echo "  - IP not allow-listed"
  echo "  - Insufficient permissions"
else
  echo "❌ FAILED: Unexpected status code"
  echo ""
  echo "Response:"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
fi
