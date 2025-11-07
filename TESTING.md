# End-to-End Testing Guide

Complete testing guide for the SWIP Dashboard.

---

## Prerequisites

- Development server running (`npm run dev`)
- PostgreSQL database running
- Redis running (optional, for caching tests)

---

## 🧪 Test Scenarios

### 1. SWIP App Integration Flow

Complete workflow from SWIP App sending data to Dashboard displaying it.

#### Test 1.1: Create App via SWIP App API

```bash
curl -X POST http://localhost:3000/api/v1/apps \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "com.calm.app",
    "app_name": "Calm - Meditation & Sleep",
    "app_version": "6.25.0",
    "category": "Health",
    "developer": "Calm.com, Inc.",
    "app_avg_swip_score": 85.2
  }'
```

**Expected**: 
```json
{
  "success": true,
  "app": {
    "id": "clxxx...",
    "app_id": "com.calm.app",
    "name": "Calm - Meditation & Sleep",
    "category": "Health",
    "avg_swip_score": 85.2
  }
}
```

#### Test 1.2: Create Session

```bash
curl -X POST http://localhost:3000/api/v1/app_sessions \
  -H "Content-Type: application/json" \
  -d '{
    "app_session_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "anonymous_user_001",
    "device_id": "apple_watch_series_9",
    "started_at": "2025-11-04T14:00:00Z",
    "ended_at": "2025-11-04T14:15:00Z",
    "app_id": "com.calm.app",
    "data_on_cloud": 0
  }'
```

**Expected**: Duration auto-calculated (900s), session created

#### Test 1.3: Upload Biosignals (Bulk)

```bash
curl -X POST http://localhost:3000/api/v1/app_biosignals \
  -H "Content-Type: application/json" \
  -d '[
    {
      "app_biosignal_id": "bio-001",
      "app_session_id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-11-04T14:00:10Z",
      "heart_rate": 68,
      "hrv_sdnn": 72.5,
      "respiratory_rate": 12.0,
      "blood_oxygen_saturation": 99.0,
      "temperature": 36.7
    },
    {
      "app_biosignal_id": "bio-002",
      "app_session_id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-11-04T14:00:15Z",
      "heart_rate": 66,
      "hrv_sdnn": 74.2
    }
  ]'
```

**Expected**: `{"success": true, "created": 2}`

#### Test 1.4: Upload Emotions (Bulk)

```bash
curl -X POST http://localhost:3000/api/v1/emotions \
  -H "Content-Type: application/json" \
  -d '[
    {
      "id": 1,
      "app_biosignal_id": "bio-001",
      "swip_score": 88.5,
      "phys_subscore": 52.3,
      "emo_subscore": 36.2,
      "confidence": 0.92,
      "dominant_emotion": "calm",
      "model_id": "wesad_emotion_v1_0"
    },
    {
      "id": 2,
      "app_biosignal_id": "bio-002",
      "swip_score": 90.2,
      "phys_subscore": 54.1,
      "emo_subscore": 36.1,
      "confidence": 0.94,
      "dominant_emotion": "calm",
      "model_id": "wesad_emotion_v1_0"
    }
  ]'
```

**Expected**: Session avgSwipScore updated to 89.35

#### Test 1.5: Verify Auto-Calculation

```bash
curl 'http://localhost:3000/api/v1/app_sessions?app_id=com.calm.app'
```

**Expected**: Session shows `avg_swip_score: 89.35`

```bash
curl 'http://localhost:3000/api/v1/apps?limit=5'
```

**Expected**: App shows updated `app_avg_swip_score`

---

### 2. Developer Portal Flow

Complete workflow for developer registration and app management.

#### Test 2.1: User Registration

1. Navigate to `/auth`
2. Click "Continue with Google" or "Continue with GitHub"
3. Complete OAuth flow
4. Redirected to `/leaderboard`

**Expected**: User logged in, session cookie set

#### Test 2.2: Register App via Portal

1. Navigate to `/developer`
2. Click "Apps" tab
3. Click "Register New App"
4. Fill form:
   - OS: Android
   - App ID: `com.headspace.android`
   - Click "Auto-fill" (fetches from Play Store)
   - App Name: Auto-filled
   - Category: Auto-filled
5. Submit

**Expected**: App created with `createdVia: "portal"`, has `ownerId`

#### Test 2.3: Generate API Key

1. In Developer Portal, find your app
2. Click "Generate API Key" in Actions column
3. Modal opens (pre-selected app shown)
4. Click "Generate Key"
5. Copy the key (shown once)

**Expected**: API key generated, displayed, copyable

#### Test 2.4: Revoke/Reactivate Key

1. Navigate to "API Keys" tab
2. Find a key
3. Click "Revoke"
4. Confirm
5. Click "Reactivate"

**Expected**: Key revoked/reactivated, status updates

---

### 3. Public Pages Flow

#### Test 3.1: Landing Page

1. Navigate to `/` (logged out)
2. Verify:
   - Real session count shown (e.g., "1.5K+ Sessions Tracked")
   - Real developer count shown (e.g., "2+ Developers")
   - Platform analytics show calculated %

**Expected**: All numbers from database, not hard-coded

#### Test 3.2: Documentation

1. Navigate to `/documentation`
2. Verify:
   - Tables render correctly (Supported Emotions, Rate Limits)
   - Code blocks have syntax highlighting
   - Copy buttons work on code blocks
   - Table of contents auto-scrolls

**Expected**: Professional docs with working features

#### Test 3.3: API Documentation

1. Navigate to `/documentation`
2. Expand "SWIP App Integration"
3. Try "POST /api/v1/apps"
4. Click "Try it out"
5. Fill sample data
6. Execute

**Expected**: Interactive Swagger UI, successful API call

---

### 4. Leaderboard & Analytics

#### Test 4.1: Leaderboard

1. Navigate to `/leaderboard` (logged in)
2. Verify:
   - 4 stat cards show (no % indicators)
   - Top Applications tab shows ranked apps
   - Top Developers tab shows ranked developers with #1, #2, #3
   - Category Leaders tab shows ranked categories

**Expected**: All data from database, medals on top 3

#### Test 4.2: Sessions Explorer

1. Navigate to `/sessions`
2. Use filters:
   - Select "This Week"
   - Select emotion filter
3. Click on a session row

**Expected**: Session detail panel opens, shows biosignal data

#### Test 4.3: Analytics Dashboard

1. Navigate to `/analytics`
2. Verify:
   - Total Sessions card
   - Avg SWIP Score
   - Stress Rate %
   - Charts render

**Expected**: Real data, charts load

---

## 🔐 Security Testing

### Test Auth Middleware

```bash
# Should redirect to /auth
curl -I 'http://localhost:3000/sessions'

# Should allow (public)
curl -I 'http://localhost:3000/documentation'
curl -I 'http://localhost:3000/api/v1/apps'
```

**Expected**: Protected routes redirect, public routes work

### Test Rate Limiting

```bash
# Send 70 requests in 1 minute
for i in {1..70}; do
  curl -s 'http://localhost:3000/api/v1/apps?limit=1' > /dev/null
  echo "Request $i"
done
```

**Expected**: First 60 succeed, rest return 429

---

## 📊 Data Verification

### Verify Automatic Calculations

```bash
# Check session avg is calculated from emotions
curl 'http://localhost:3000/api/v1/app_sessions?app_id=com.calm.app' | jq '.sessions[0].avg_swip_score'

# Check app avg is calculated from sessions
curl 'http://localhost:3000/api/v1/apps' | jq '.apps[] | select(.app_id == "com.calm.app") | .app_avg_swip_score'
```

**Expected**: Numbers match, properly aggregated

### Verify Leaderboard Rankings

```bash
# Check leaderboard cache
curl 'http://localhost:3000/api/leaderboard/recalculate' -X POST
```

**Expected**: Rankings updated, cached for 24h

---

## 🐛 Common Issues

### Issue: "Unknown argument" Prisma error

**Solution**: 
```bash
npx prisma generate
npm run dev
```

### Issue: Logo not loading in Vercel

**Solution**: Ensure `public/logos/` committed to git

### Issue: Flash of protected content

**Solution**: Middleware already handles this

---

##  Checklist

Before deploying:

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Redis configured (optional)
- [ ] OAuth providers configured
- [ ] `npm run build` succeeds
- [ ] All API endpoints tested
- [ ] Authentication flow tested
- [ ] Public pages accessible
- [ ] Protected pages require auth
- [ ] Leaderboard shows real data
- [ ] SWIP App APIs tested end-to-end

---

## 📞 Support

If tests fail, check:
1. Database connection
2. Environment variables
3. Server logs: `tail -f logs/combined.log`
4. Browser console for frontend errors

---

*Last updated: November 4, 2025*

