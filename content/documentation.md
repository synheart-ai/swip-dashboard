---
title: "SWIP Dashboard - Developer Guide"
description: "Complete guide for developers using the SWIP Dashboard"
date: "2025-11-04"
---

# SWIP Dashboard - Developer Guide

Welcome to the **SWIP Dashboard** - an open-source wellness transparency platform that visualizes wellness impact data from tracked applications.

---

## 📖 Overview

### What is SWIP Dashboard?

SWIP Dashboard is a **public transparency platform** that displays wellness metrics from applications tracked by the SWIP App (a user wellness tracker). The dashboard provides:

- 📊 **Global Leaderboard** - Rankings of apps by wellness impact (SWIP scores)
- 🔬 **Session Analytics** - Detailed biosignal and emotion data  
- 📈 **Wellness Metrics** - Aggregated statistics and trends
- 🔓 **Public APIs** - Read-only access to anonymized wellness data
- 🎯 **App Claiming** - Developers can claim their tracked apps

### Architecture

```
SWIP App (User Wellness Tracker)
  ↓
  Tracks apps on user's device
  ↓
  Sends data to SWIP Dashboard (via internal API)
  ↓
SWIP Dashboard
  ↓
  Aggregates & displays data publicly
  ↓
Developers can claim apps & read their data
```

### Domains & Environments

- **Production dashboard**: `https://swip.synheart.ai`
- **Production API base**: `https://swip.synheart.ai/api`
- **Sandbox**: run locally with `npm run dev` → `http://localhost:3000`

> Unless noted otherwise, all examples in this guide target the production domain.

---

## 🚀 Getting Started

### For Developers

#### Step 1: Register Your Account

1. Visit the [SWIP Dashboard](/auth)
2. Sign in with Google or GitHub
3. Complete your profile

#### Step 2: Register or Claim Your App

**Option A: Register Your App**
1. Go to the [Developer Portal](/developer)
2. Click **"Register New App"**
3. Select OS (Android/iOS)
4. Enter App ID (package name or bundle ID)
5. Auto-fill will fetch metadata from app stores
6. Submit to create your app

**Option B: Claim an Existing App** (if SWIP users are already tracking it)
1. Go to the [Developer Portal](/developer)
2. Browse **"Claimable Apps"** section
3. Find your app
4. Click **"Claim This App"**
5. Verify ownership (enter package name)
6. App is now yours!

#### Step 3: Generate API Key

1. In Developer Portal, find your app
2. Click **"Generate API Key"**
3. Copy your API key (shown only once!)
4. Store it securely in your environment variables
5. Use it in every request as the `x-api-key` header (see examples below)

#### Step 4: Access Your Data

Use your API key to read wellness data for your claimed apps via the Developer Read APIs (see below).

---

## 🔐 API Architecture

### Two API Systems

| API Type | Purpose | Authentication | Who Uses It |
|----------|---------|----------------|-------------|
| **Ingestion API** | Data ingestion (write) | Developer API key (Swip app-only key bound to `ai.synheart.swip`) | SWIP App |
| **Developer Read API** | Data reading (read-only) | Developer API key | Developers |

### Security Model

- ✅ **SWIP App** sends all wellness data using its dedicated API key (hard-coded Swip app ID bypasses verification list)
- ✅ **Developers** can only READ data for their claimed apps
- ✅ **No public data ingestion** - prevents spam and ensures data quality
- ✅ **Complete data isolation** - developers only see their apps' data

---

### Becoming a Verified Data Ingester

At this time, the ingestion surface is restricted to the Swip mobile application. To request ingestion access for a first-party integration:

1. **Contact Synheart Security** at `ingest-access@swip.synheart.ai` with your company details and intended app ID.
2. **Undergo review** – we validate data provenance, privacy controls, and rate plans.
3. **Provisioning** – approved partners receive a dedicated API key mapped to their app ID. Keys are limited to the whitelisted external ID.
4. **Compliance** – partners must meet ongoing latency, privacy, and deletion SLAs. Non-compliant keys are revoked.

If you only need read access, follow the Developer Portal steps above—no manual review required.

---

## 📚 Developer Read API

### Authentication

All read API requests require your API key in the header:

```http
x-api-key: YOUR_API_KEY_HERE
```

⚠️ **Security Best Practices:**
- Never expose API keys in client-side code
- Store keys in environment variables
- Rotate keys regularly  
- Use separate keys per environment (dev/prod)

### Base URL

```
https://swip.synheart.ai/api/v1
```

---

## 📋 API Endpoints

### 1. List Your Apps

Get all apps you've claimed.

```http
GET /api/v1/apps
```

**Headers:**
```http
x-api-key: YOUR_API_KEY
```

**Query Parameters:**
- `limit` (optional): Max apps to return (1-100, default: 50)
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "apps": [
    {
      "app_id": "com.yourcompany.app",
      "app_name": "Your Wellness App",
      "category": "Health",
      "developer": "Your Company",
      "app_version": "1.0.0",
      "app_avg_swip_score": 85.5,
      "total_sessions": 1234,
      "icon_url": "https://...",
      "created_at": "2025-11-04T10:00:00Z"
    }
  ],
  "total": 1
}
```

**Example:**
```bash
curl -X GET 'https://swip.synheart.ai/api/v1/apps?limit=10' \
  -H 'x-api-key: swip_key_your_key_here'
```

---

### 2. List Sessions

Get wellness sessions for your claimed apps.

```http
GET /api/v1/app_sessions
```

**Headers:**
```http
x-api-key: YOUR_API_KEY
```

**Query Parameters:**
- `limit` (optional): Max sessions to return (1-100, default: 50)
- `app_id` (optional): Filter by specific app

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "clxxx...",
      "app_session_id": "uuid-here",
      "user_id": "anonymous_user_123",
      "device_id": "device_456",
      "started_at": "2025-11-04T14:00:00Z",
      "ended_at": "2025-11-04T14:15:00Z",
      "duration": 900,
      "avg_swip_score": 88.5,
      "data_on_cloud": 0
    }
  ],
  "total": 1
}
```

**Example:**
```bash
curl -X GET 'https://swip.synheart.ai/api/v1/app_sessions?app_id=com.yourcompany.app&limit=20' \
  -H 'x-api-key: swip_key_your_key_here'
```

---

### 3. Get Biosignals

Get detailed biosignal data for a session.

```http
GET /api/v1/app_biosignals?app_session_id={session_id}
```

**Headers:**
```http
x-api-key: YOUR_API_KEY
```

**Query Parameters:**
- `app_session_id` (required): Session ID to get biosignals for

**Response:**
```json
{
  "success": true,
  "biosignals": [
    {
      "app_biosignal_id": "uuid-1",
      "timestamp": "2025-11-04T14:00:05Z",
      "heart_rate": 72,
      "hrv_sdnn": 65.4,
      "hrv_rmssd": 58.2,
      "respiratory_rate": 14.0,
      "temperature": 36.8,
      "blood_oxygen_saturation": 98,
      "accelerometer": [0.1, 0.2, 9.8],
      "gyro": [0.0, 0.1, 0.0]
    }
  ],
  "total": 1
}
```

**Biosignal Fields:**
- `heart_rate`: Beats per minute (BPM)
- `hrv_sdnn`: HRV SDNN metric in milliseconds
- `hrv_rmssd`: HRV RMSSD metric in milliseconds  
- `respiratory_rate`: Breaths per minute
- `temperature`: Body temperature in Celsius
- `blood_oxygen_saturation`: SpO2 percentage
- `ecg`, `emg`, `eda`, `ppg`, `ibi`: Other biometric readings

**Example:**
```bash
curl -X GET 'https://swip.synheart.ai/api/v1/app_biosignals?app_session_id=550e8400-e29b-41d4-a716-446655440000' \
  -H 'x-api-key: swip_key_your_key_here'
```

---

### 4. Get Emotions

Get AI-detected emotions for biosignals.

```http
GET /api/v1/emotions?app_biosignal_id={biosignal_id}
```

**Headers:**
```http
x-api-key: YOUR_API_KEY
```

**Query Parameters:**
- `app_biosignal_id` (optional): Filter by biosignal
- `app_session_id` (optional): Filter by session

**Response:**
```json
{
  "success": true,
  "emotions": [
    {
      "id": 1,
      "app_biosignal_id": "uuid-1",
      "swip_score": 88.5,
      "phys_subscore": 52.3,
      "emo_subscore": 36.2,
      "confidence": 0.92,
      "dominant_emotion": "calm",
      "model_id": "wesad_emotion_v1_0",
      "timestamp": "2025-11-04T14:00:05Z"
    }
  ],
  "total": 1
}
```

**Supported Emotions (current production model):**
- `calm` – Relaxed, low-stress baseline
- `stressed` – Elevated physiological stress response
- `focused` – Sustained attention / flow state

> Legacy emotion labels (happy, neutral, etc.) are deprecated and no longer emitted. If you ingest historical datasets you may still encounter them, but new analyses always use the three-state model above.

**SWIP Score Breakdown:**
- **SWIP Score** (0-100): Overall wellness score
  - `phys_subscore`: Physiological component (0-60)
  - `emo_subscore`: Emotional component (0-40)

**Example:**
```bash
curl -X GET 'https://swip.synheart.ai/api/v1/emotions?app_session_id=550e8400-e29b-41d4-a716-446655440000' \
  -H 'x-api-key: swip_key_your_key_here'
```

---

## 🎯 App Claiming Process

### When Apps Become Claimable

Apps become claimable when:
1. A SWIP App user allows tracking of your app
2. SWIP App creates the app record automatically
3. The app appears in "Claimable Apps" section

### How to Claim

1. **Find Your App**
   - Go to Developer Portal → "Claimable Apps" tab
   - Search for your app by name or package ID

2. **Click "Claim This App"**
   - A modal will open

3. **Verify Ownership**
   - Enter your app's package name (Android) or bundle ID (iOS)
   - This confirms you own the app

4. **Success!**
   - App is now in your "My Apps" section
   - You can generate API keys
   - You can access all wellness data

### Verification Methods

Currently supported:
- **Package Name** - Enter exact package/bundle ID

Future enhancements:
- Screenshot of app console
- App store verification code
- DNS verification

---

## 📊 SWIP Score Calculation

### How SWIP Scores Are Computed

```
SWIP Score (0-100) = Physiological (60%) + Emotional (40%)

Physiological Component (0-60):
  - Heart Rate Variability (HRV)
  - Respiratory Rate
  - Heart Rate stability
  - Other biosignals

Emotional Component (0-40):
  - AI-detected emotion
  - Confidence level
  - Emotion duration
```

### Score Interpretation

| Score Range | Category | Meaning |
|-------------|----------|---------|
| 85-100 | Excellent | Very positive wellness impact |
| 70-84 | Good | Positive wellness impact |
| 55-69 | Fair | Neutral wellness impact |
| 40-54 | Poor | Negative wellness impact |
| 0-39 | Critical | Very negative wellness impact |

### Aggregation

- **Session Average**: Average of all emotion SWIP scores in that session
- **App Average**: Average of all session averages for that app
- **Leaderboard Ranking**: Apps ranked by average SWIP score

---

## 🔒 Rate Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/api/v1/apps` | 120 requests | 1 minute |
| `/api/v1/app_sessions` | 120 requests | 1 minute |
| `/api/v1/app_biosignals` | 60 requests | 1 minute |
| `/api/v1/emotions` | 60 requests | 1 minute |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1699123456
```

**429 Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

---

## ❌ Error Responses

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `400` | Bad Request | Check request format |
| `401` | Unauthorized | Check API key |
| `403` | Forbidden | Key revoked or no access |
| `404` | Not Found | Resource doesn't exist |
| `429` | Too Many Requests | Wait before retrying |
| `500` | Server Error | Contact support |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "message": "Additional details"
}
```

---

## 🛠️ Code Examples

### Node.js / JavaScript

```javascript
const fetch = require('node-fetch');

const API_KEY = process.env.SWIP_API_KEY;
const BASE_URL = 'https://swip.synheart.ai/api/v1';

async function getMyApps() {
  const response = await fetch(`${BASE_URL}/apps`, {
    headers: {
      'x-api-key': API_KEY
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('My Apps:', data.apps);
  } else {
    console.error('Error:', data.error);
  }
}

async function getSessions(appId) {
  const response = await fetch(
    `${BASE_URL}/app_sessions?app_id=${appId}&limit=50`,
    {
      headers: {
        'x-api-key': API_KEY
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Sessions:', data.sessions);
  }
}

getMyApps();
```

### Python

```python
import os
import requests

API_KEY = os.getenv('SWIP_API_KEY')
BASE_URL = 'https://swip.synheart.ai/api/v1'

def get_my_apps():
    response = requests.get(
        f'{BASE_URL}/apps',
        headers={'x-api-key': API_KEY}
    )
    
    data = response.json()
    
    if data['success']:
        print('My Apps:', data['apps'])
    else:
        print('Error:', data['error'])

def get_sessions(app_id):
    response = requests.get(
        f'{BASE_URL}/app_sessions',
        params={'app_id': app_id, 'limit': 50},
        headers={'x-api-key': API_KEY}
    )
    
    data = response.json()
    
    if data['success']:
        print('Sessions:', data['sessions'])

get_my_apps()
```

### cURL

```bash
# Get your apps
curl -X GET 'https://swip.synheart.ai/api/v1/apps' \
  -H 'x-api-key: swip_key_your_key_here'

# Get sessions for an app
curl -X GET 'https://swip.synheart.ai/api/v1/app_sessions?app_id=com.yourcompany.app&limit=20' \
  -H 'x-api-key: swip_key_your_key_here'

# Get biosignals for a session
curl -X GET 'https://swip.synheart.ai/api/v1/app_biosignals?app_session_id=550e8400-e29b-41d4-a716-446655440000' \
  -H 'x-api-key: swip_key_your_key_here'

# Get emotions
curl -X GET 'https://swip.synheart.ai/api/v1/emotions?app_session_id=550e8400-e29b-41d4-a716-446655440000' \
  -H 'x-api-key: swip_key_your_key_here'
```

---

## 📈 Best Practices

### Data Access Patterns

1. **Paginate Large Datasets**
   - Use `limit` parameter
   - Start with smaller limits (10-50)
   - Increase as needed

2. **Cache Responses**
   - Cache app list (changes rarely)
   - Cache session data (doesn't change)
   - Respect cache headers

3. **Filter Efficiently**
   - Use `app_id` to filter sessions
   - Use `app_session_id` for biosignals/emotions
   - Avoid fetching all data

4. **Handle Rate Limits**
   - Implement exponential backoff
   - Respect `Retry-After` header
   - Batch requests when possible

### Error Handling

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        await sleep(retryAfter * 1000);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(2 ** i * 1000); // Exponential backoff
    }
  }
}
```

---

## 🔓 Public vs Private Data

### What's Public (No Auth Required)

- Global leaderboard rankings
- Aggregated platform statistics
- App names and categories
- Average SWIP scores

### What's Private (Auth Required)

- Detailed session data
- Biosignal readings
- Individual user data (anonymized)
- Raw emotion data
- Your specific app data

---

## 🤝 Support

### Resources

- **Dashboard**: [https://swip.synheart.ai](https://swip.synheart.ai)
- **Developer Portal**: [https://swip.synheart.ai/developer](https://swip.synheart.ai/developer)
- **Documentation**: [https://swip.synheart.ai/documentation](https://swip.synheart.ai/documentation)
- **GitHub**: [github.com/synheart-ai/swip-dashboard](https://github.com/synheart-ai/swip-dashboard)

### Contact

- **Email**: support@swip.synheart.ai
- **Issues**: Create a GitHub issue
- **Community**: Join our Discord

### Status Page

Check API status and uptime:
- **Health Check**: `/api/health`

---

## 📜 Terms & Privacy

- [Terms of Service](/terms)
- [Privacy Policy](/privacy)

---

## 🚀 What's Next?

### Upcoming Features

- GraphQL API
- Webhooks for real-time updates
- Advanced filtering and search
- Data export tools
- Custom analytics dashboards

### Stay Updated

- Star our GitHub repo
- Follow changelog
- Join developer newsletter

---

**Built with ❤️ for wellness transparency**

*Last updated: November 8, 2025*
