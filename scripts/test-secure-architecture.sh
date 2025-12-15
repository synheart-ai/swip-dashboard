#!/bin/bash

# SWIP Dashboard - Secure Architecture Test Script
# Tests the complete dual-API security model

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
SWIP_APP_KEY="${SWIP_APP_API_KEY:-swip_key_swip_app_test_key_here}"
DEV_KEY="${DEV_API_KEY:-swip_key_test_developer_key_here}"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   SWIP Dashboard - Secure Architecture Test Suite               ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Base URL: $BASE_URL"
echo "Testing: Ingestion + Developer Security Model"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

run_test() {
  local test_name="$1"
  local command="$2"
  local expected_status="$3"
  
  test_count=$((test_count + 1))
  echo -n "Test $test_count: $test_name... "
  
  http_status=$(eval "$command" 2>&1 | grep -oE "HTTP/[0-9.]+ [0-9]+" | grep -oE "[0-9]+" | tail -1)
  
  if [ "$http_status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_status)"
    pass_count=$((pass_count + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_status)"
    fail_count=$((fail_count + 1))
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PHASE 1: Ingestion API Protection (POST Endpoints)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: POST /api/v1/apps without key (should fail)
run_test "POST /api/v1/apps without key → 401" \
  "curl -s -w '\nHTTP/%{http_code}' -X POST $BASE_URL/api/v1/apps -H 'Content-Type: application/json' -d '{\"app_id\":\"test.app\",\"app_name\":\"Test\"}'" \
  "401"

# Test 2: POST /api/v1/apps with wrong key (should fail)
run_test "POST /api/v1/apps with wrong key → 401" \
  "curl -s -w '\nHTTP/%{http_code}' -X POST $BASE_URL/api/v1/apps -H 'Content-Type: application/json' -H 'x-api-key: wrong_key' -d '{\"app_id\":\"test.app\",\"app_name\":\"Test\"}'" \
  "401"

# Test 3: POST /api/v1/apps with valid Swip app key (should succeed)
run_test "POST /api/v1/apps with Swip app key → 200" \
  "curl -s -w '\nHTTP/%{http_code}' -X POST $BASE_URL/api/v1/apps -H 'Content-Type: application/json' -H 'x-api-key: $SWIP_APP_KEY' -d '{\"app_id\":\"com.test.app\",\"app_name\":\"Test App\",\"category\":\"Health\"}'" \
  "200"

# Test 4: POST /api/v1/app_sessions without key (should fail)
run_test "POST /api/v1/app_sessions without key → 401" \
  "curl -s -w '\nHTTP/%{http_code}' -X POST $BASE_URL/api/v1/app_sessions -H 'Content-Type: application/json' -d '{\"app_session_id\":\"550e8400-e29b-41d4-a716-446655440000\",\"app_id\":\"com.test.app\"}'" \
  "401"

# Test 5: POST /api/v1/app_biosignals without key (should fail)
run_test "POST /api/v1/app_biosignals without key → 401" \
  "curl -s -w '\nHTTP/%{http_code}' -X POST $BASE_URL/api/v1/app_biosignals -H 'Content-Type: application/json' -d '[]'" \
  "401"

# Test 6: POST /api/v1/emotions without key (should fail)
run_test "POST /api/v1/emotions without key → 401" \
  "curl -s -w '\nHTTP/%{http_code}' -X POST $BASE_URL/api/v1/emotions -H 'Content-Type: application/json' -d '[]'" \
  "401"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PHASE 2: Developer API Key Protection (GET Endpoints)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 7: GET /api/v1/apps without key (should fail)
run_test "GET /api/v1/apps without key → 401" \
  "curl -s -w '\nHTTP/%{http_code}' -X GET $BASE_URL/api/v1/apps" \
  "401"

# Test 8: GET /api/v1/apps with wrong key (should fail)
run_test "GET /api/v1/apps with wrong key → 401" \
  "curl -s -w '\nHTTP/%{http_code}' -X GET $BASE_URL/api/v1/apps -H 'x-api-key: wrong_key'" \
  "401"

# Test 9: GET /api/v1/app_sessions without key (should fail)
run_test "GET /api/v1/app_sessions without key → 401" \
  "curl -s -w '\nHTTP/%{http_code}' -X GET $BASE_URL/api/v1/app_sessions" \
  "401"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PHASE 3: Public Endpoints (No Auth Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 10: GET /api/public/stats (should succeed)
run_test "GET /api/public/stats → 200" \
  "curl -s -w '\nHTTP/%{http_code}' -X GET $BASE_URL/api/public/stats" \
  "200"

# Test 11: GET /api/public/apps (should succeed)
run_test "GET /api/public/apps → 200" \
  "curl -s -w '\nHTTP/%{http_code}' -X GET $BASE_URL/api/public/apps" \
  "200"

# Test 12: GET /api/health (should succeed)
run_test "GET /api/health → 200" \
  "curl -s -w '\nHTTP/%{http_code}' -X GET $BASE_URL/api/health" \
  "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PHASE 4: Complete SWIP Workflow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Step 1: Creating app with Swip app key..."
APP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/apps" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $SWIP_APP_KEY" \
  -d '{
    "app_id": "com.headspace.android",
    "app_name": "Headspace: Meditation & Sleep",
    "category": "Health",
    "developer": "Headspace Inc"
  }')

if echo "$APP_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓${NC} App created successfully"
  APP_ID=$(echo "$APP_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "  App ID: $APP_ID"
else
  echo -e "${RED}✗${NC} App creation failed"
  echo "$APP_RESPONSE"
fi

echo ""
echo "Step 2: Creating session..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/app_sessions" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $SWIP_APP_KEY" \
  -d '{
    "app_session_id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "test_user_001",
    "device_id": "apple_watch_9",
    "started_at": "2025-11-04T15:00:00Z",
    "ended_at": "2025-11-04T15:15:00Z",
    "app_id": "com.headspace.android",
    "data_on_cloud": 0
  }')

if echo "$SESSION_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓${NC} Session created successfully"
else
  echo -e "${RED}✗${NC} Session creation failed"
  echo "$SESSION_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total Tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  echo ""
  echo "Security Model: ✅ ACTIVE"
  echo "SWIP Protection: ✅ WORKING"
  echo "Developer Protection: ✅ WORKING"
  echo "Public Endpoints: ✅ ACCESSIBLE"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  exit 1
fi

