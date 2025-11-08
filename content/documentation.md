---
title: "SWIP Dashboard Developer Guide"
description: "How to integrate with the SWIP Dashboard APIs, verify ingestion access, and interpret Synheart wellness metrics."
date: "2025-11-08"
---

# SWIP Dashboard Developer Guide

The SWIP Dashboard is the public transparency layer for Synheart’s Wellness Impact Protocol. Use this guide to understand how to claim your applications, work with the REST APIs, and (if eligible) ingest biosignals using the SWIP SDK.

---

## 1. Platform Overview

- **Transparency** – Publish anonymized SWIP scores, rankings, and population insights.
- **Developer tools** – Register or claim apps, generate analytics API keys, and export reports.
- **Controlled ingestion** – Only verified partners can stream biosignals into the platform; everyone else has read-only access.

Supporting projects:

- [SWIP SDK](https://github.com/synheart-ai/swip) – Protocol specification, ingestion helpers, certification flow.
- [Synheart Wear](https://github.com/synheart-ai/synheart-wear) – Wearable adapters for Apple Watch, Fitbit, Garmin, and more.

---

## 2. Domains & Base URLs

| Purpose | URL |
|---------|-----|
| Dashboard UI | `https://swip.synheart.io` |
| REST API base | `https://swip.synheart.io/api` |
| Local dev | `http://localhost:3000` (after `npm run dev`) |

Unless noted otherwise, examples in this guide target the production environment.

---

## 3. Quick Start for Developers

1. **Sign in** – Visit `/auth` and authenticate via Google or GitHub.
2. **Register or claim** your application in `/developer`.
   - *Register* when your app is new to SWIP.
   - *Claim* when a SWIP integration already created an entry and you need ownership.
3. **Generate an analytics API key** – Keys are shown once; copy them into your secret manager. Every API request must include `x-api-key: YOUR_KEY`.
4. **Use the analytics API** – Read session, biosignal, and emotion data for the apps you own.
5. **(Optional) Request ingestion access** – If you need to push biosignals, complete the ingestion request form. Approved partners receive a dedicated ingestion key bound to their external app ID.
6. **Integrate the SWIP SDK** – Verified partners use the [SWIP SDK](https://github.com/synheart-ai/swip) together with [Synheart Wear](https://github.com/synheart-ai/synheart-wear) adapters to stream biosignals.

> The first-party Synheart mobile app already ships with ingestion access; third parties must pass the verification process above.

---

## 4. Analytics API (Read-Only)

Base URL: `https://swip.synheart.io/api/v1`

| Endpoint | Description | Key query params |
|----------|-------------|------------------|
| `GET /apps` | List your claimed apps with summary metrics. | `limit` (1-100), `category` |
| `GET /app_sessions` | Paginated SWIP sessions for owned apps. | `app_id`, `limit` |
| `GET /app_biosignals` | Biosignals for a session. | `app_session_id` **(required)** |
| `GET /emotions` | Emotion events for a session/biosignal. | `app_session_id` or `app_biosignal_id` |
| `GET /public/stats` | Global anonymized statistics. | *(none)* |

All requests require:

```http
x-api-key: YOUR_ANALYTICS_KEY
```

### Sample: list sessions

```bash
curl -X GET "https://swip.synheart.io/api/v1/app_sessions?app_id=com.synheart.focus&limit=25" \
  -H "x-api-key: ${SWIP_ANALYTICS_KEY}"
```

### Emotion labels (production model)

| Label | Meaning |
|-------|---------|
| `calm` | Relaxed state with low physiological stress. |
| `stressed` | Elevated stress markers (HR, HRV). |
| `focused` | Sustained attention / flow response. |

Legacy exports may contain older labels (`happy`, `neutral`, etc.), but the live classifier emits the three states above.

---

## 5. Ingestion API (Verified Partners Only)

Base URL: `https://swip.synheart.io/api/v1`

| Endpoint | Payload summary | Notes |
|----------|-----------------|-------|
| `POST /apps` | `{ app_id, app_name, ... }` | Upserts app metadata. |
| `POST /app_sessions` | `{ app_session_id, started_at, ended_at, ... }` | Duration is auto-computed. |
| `POST /app_biosignals` | `[ { app_biosignal_id, timestamp, metrics... }, ... ]` | Up to 100 signals per request. |
| `POST /emotions` | `[ { app_biosignal_id, swip_score, dominant_emotion, ... }, ... ]` | Must reference existing biosignals. |

Requests must include the ingestion key assigned to the app:

```http
x-api-key: YOUR_INGESTION_KEY
```

If the payload references a different app ID, the API returns `403 Forbidden`.

### Ingestion workflow

1. Collect biometrics using Synheart Wear adapters.
2. Feed raw samples into the SWIP SDK for pre-processing, scoring, and batching.
3. The SDK validates payloads and sends them to the ingestion endpoints above.
4. Successful ingestion updates the leaderboard, analytics, and developer dashboards.

---

## 6. Data Model at a Glance

| Entity | Highlights |
|--------|------------|
| `App` | External identifier (`app_id`), ownership, metadata. |
| `AppSession` | Tracks a single usage event; holds start/end timestamps, device ID, opt-in flags. |
| `AppBiosignal` | Timestamped biosignal payload (HR, HRV, SpO₂, temperature, accelerometer, etc.). |
| `Emotion` | SWIP score + subscores derived from biosignals. |
| `ApiKey` | Stores hashed API keys for analytics or ingestion. |

**SWIP Score** = `phys_subscore (0-60)` + `emo_subscore (0-40)` → range `0-100`.

---

## 7. Rate Limits & Error Handling

| Endpoint group | Limit | Window |
|----------------|-------|--------|
| `/apps`, `/app_sessions` | 120 | 60 seconds |
| `/app_biosignals`, `/emotions` | 60 | 60 seconds |

**Headers**
```
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
```

**Error response**
```json
{
  "success": false,
  "error": "Unauthorized: Invalid or missing authentication",
  "message": "This endpoint requires x-api-key header"
}
```

Implement exponential backoff for `429` responses and rotate keys when you receive `401/403`.

---

## 8. Best Practices

- Generate separate API keys per environment (dev/staging/prod).
- Cache analytics responses whenever possible (apps list, leaderboard snapshots).
- Validate ingestion payloads locally using SWIP SDK helpers before streaming.
- Revoke unused keys in the developer portal to reduce attack surface.
- Log `request_id` values returned by the API for faster support.

---

## 9. Code Examples

### Node.js
```javascript
const fetch = require('node-fetch');

const API_KEY = process.env.SWIP_API_KEY;
const BASE_URL = 'https://swip.synheart.io/api/v1';

async function listApps(limit = 10) {
  const res = await fetch(`${BASE_URL}/apps?limit=${limit}`, {
    headers: { 'x-api-key': API_KEY },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.apps;
}
```

### Python
```python
import os
import requests

API_KEY = os.getenv("SWIP_API_KEY")
BASE_URL = "https://swip.synheart.io/api/v1"

def list_sessions(app_id):
    response = requests.get(
        f"{BASE_URL}/app_sessions",
        params={"app_id": app_id, "limit": 20},
        headers={"x-api-key": API_KEY},
    )
    data = response.json()
    if not data.get("success"):
        raise RuntimeError(data.get("error"))
    return data["sessions"]
```

### cURL
```bash
# List claimed apps
curl -X GET 'https://swip.synheart.io/api/v1/apps?limit=10' \
  -H 'x-api-key: swip_key_your_key_here'

# Fetch biosignals for a session
curl -X GET 'https://swip.synheart.io/api/v1/app_biosignals?app_session_id=SESSION_UUID' \
  -H 'x-api-key: swip_key_your_key_here'
```

---

## 10. Support & Resources

- Dashboard: https://swip.synheart.io  
- Developer Portal: https://swip.synheart.io/developer  
- API Health Check: `GET /api/health`  
- Email: support@swip.synheart.ai  
- Issues: https://github.com/synheart-ai/swip-dashboard/issues  
- Terms: [/terms](/terms) • Privacy: [/privacy](/privacy)

---

**Built with ❤️ for wellness transparency — last updated November 8, 2025.**
