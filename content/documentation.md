---
title: "SWIP API Documentation"
description: "Complete developer guide for integrating with the SWIP Dashboard"
date: "2025-11-03"
---

# SWIP API Documentation

Welcome to the **SWIP (Smart Wellness Intelligence Protocol)** API documentation. This guide will help you integrate wellness tracking into your applications.

## What is SWIP?

SWIP is a wellness intelligence protocol that calculates wellness scores based on:
- **Heart Rate Variability (HRV)** metrics
- **Emotional state** tracking
- **Biometric data** from wearables
- **Session duration** and patterns

## Getting Started

### 1. Register Your App

1. Sign in to the [SWIP Dashboard](/auth)
2. Go to the **Developer Portal**
3. Click **"Register New App"**
4. Enter your app name and details

### 2. Generate API Key

1. In the Developer Portal, find your app
2. Click **"Generate API Key"** in the Actions column
3. Copy your API key (shown only once!)
4. Store it securely in your environment variables

### 3. Start Sending Data

Use the SWIP Ingest API to send wellness session data to our platform.

---

## API Authentication

All API requests require authentication using an API key in the request header:

```
x-api-key: YOUR_API_KEY_HERE
```

⚠️ **Security Best Practices:**
- Never expose API keys in client-side code
- Use environment variables to store keys
- Rotate keys regularly
- Use separate keys for different environments

---

## SWIP Ingest API

### Endpoint

```http
POST https://your-domain.com/api/swip/ingest
```

### Headers

```http
Content-Type: application/json
x-api-key: YOUR_API_KEY_HERE
```

### Request Body Schema

```typescript
{
  app_id: string,              // Your app identifier
  session_id: string,          // Unique session identifier
  metrics: {
    hr?: number[],             // Heart rate data array (optional)
    rr?: number[],             // RR interval data array (optional)
    hrv?: {
      sdnn?: number,           // SDNN metric (ms)
      rmssd?: number           // RMSSD metric (ms)
    },
    emotion?: string,          // Emotional state (see below)
    timestamp?: string         // ISO 8601 timestamp
  }
}
```

### Supported Emotions

Valid emotion values (case-insensitive):

| Emotion | Effect on Score | Category |
|---------|----------------|----------|
| `calm` | +10 points | Positive |
| `focused` | +5 points | Positive |
| `excited` | +3 points | Positive |
| `happy` | 0 points | Neutral |
| `neutral` | 0 points | Neutral |
| `sad` | 0 points | Neutral |
| `stressed` | -15 points | Negative |
| `anxious` | -15 points | Negative |

### Example Request

```bash
curl -X POST https://your-domain.com/api/swip/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: swip_1a2b3c4d5e6f7g8h9i0j" \
  -d '{
    "app_id": "my-wellness-app",
    "session_id": "session_123456",
    "metrics": {
      "hr": [72, 75, 73, 74, 76],
      "rr": [830, 800, 820, 815, 790],
      "hrv": {
        "sdnn": 65.4,
        "rmssd": 45.2
      },
      "emotion": "calm",
      "timestamp": "2025-11-03T10:30:00Z"
    }
  }'
```

### Example Response

**Success (200 OK):**
```json
{
  "ok": true,
  "swip_score": 78.5
}
```

**Error Responses:**

```json
// 401 Unauthorized - Missing API Key
{
  "ok": false,
  "error": "Missing x-api-key"
}

// 401 Unauthorized - Invalid API Key
{
  "ok": false,
  "error": "Invalid API key"
}

// 400 Bad Request - Invalid Data
{
  "ok": false,
  "error": {
    "fieldErrors": {
      "session_id": ["Required"],
      "metrics.hrv.sdnn": ["Expected number, received string"]
    }
  }
}

// 429 Too Many Requests - Rate Limit Exceeded
{
  "ok": false,
  "error": "Rate limit exceeded"
}

// 500 Internal Server Error
{
  "ok": false,
  "error": "Failed to save session"
}
```

---

## SWIP Score Calculation

The SWIP score (0-100) is calculated based on multiple factors:

### Base Score: 50

### HRV Metrics (up to +45 points)

**RMSSD (Root Mean Square of Successive Differences):**
- `> 40ms`: **+0.5 points per ms** (max +25 points)
- `< 20ms`: **-0.3 points per ms** (max -15 points)
- Optimal range: 20-60ms

**SDNN (Standard Deviation of NN intervals):**
- `> 50ms`: **+0.3 points per ms** (max +20 points)
- `< 30ms`: **-0.2 points per ms** (max -10 points)
- Optimal range: 30-100ms

### Emotional State (±15 points)

| Emotion | Score Modifier |
|---------|----------------|
| `calm` | +10 points |
| `focused` | +5 points |
| `excited` | +3 points |
| `stressed` | -15 points |
| `anxious` | -15 points |
| `happy` | 0 points |
| `neutral` | 0 points |
| `sad` | 0 points |

### Heart Rate Variability Bonus (+5 points)

If both HR and RR data show good variability (coefficient of variation > 0.1), receive a +5 point bonus.

### Final Score

The final score is clamped between **0 and 100** and rounded to the nearest integer.

---

## Integration Examples

### JavaScript/TypeScript

```typescript
async function sendSwipData(sessionData: {
  sessionId: string;
  hrv: { sdnn: number; rmssd: number };
  emotion: string;
}) {
  try {
    const response = await fetch('https://your-domain.com/api/swip/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SWIP_API_KEY!
      },
      body: JSON.stringify({
        app_id: 'my-wellness-app',
        session_id: sessionData.sessionId,
        metrics: {
          hrv: sessionData.hrv,
          emotion: sessionData.emotion,
          timestamp: new Date().toISOString()
        }
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log(`SWIP Score: ${result.swip_score}`);
      return result.swip_score;
    } else {
      console.error('Error:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to send SWIP data:', error);
    throw error;
  }
}
```

### Python

```python
import requests
import os
from datetime import datetime

def send_swip_data(session_id: str, hrv: dict, emotion: str):
    url = "https://your-domain.com/api/swip/ingest"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": os.getenv("SWIP_API_KEY")
    }
    payload = {
        "app_id": "my-wellness-app",
        "session_id": session_id,
        "metrics": {
            "hrv": hrv,
            "emotion": emotion,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"SWIP Score: {result['swip_score']}")
        return result['swip_score']
    else:
        error = response.json()
        print(f"Error: {error['error']}")
        raise Exception(error['error'])
```

### Swift (iOS)

```swift
struct SwipMetrics: Codable {
    let hr: [Double]?
    let rr: [Double]?
    let hrv: HRVMetrics?
    let emotion: String?
    let timestamp: String?
}

struct HRVMetrics: Codable {
    let sdnn: Double?
    let rmssd: Double?
}

struct SwipRequest: Codable {
    let app_id: String
    let session_id: String
    let metrics: SwipMetrics
}

func sendSwipData(sessionId: String, hrv: HRVMetrics, emotion: String, completion: @escaping (Double?) -> Void) {
    guard let apiKey = ProcessInfo.processInfo.environment["SWIP_API_KEY"] else {
        print("Missing API key")
        completion(nil)
        return
    }
    
    let url = URL(string: "https://your-domain.com/api/swip/ingest")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
    
    let payload = SwipRequest(
        app_id: "my-wellness-app",
        session_id: sessionId,
        metrics: SwipMetrics(
            hr: nil,
            rr: nil,
            hrv: hrv,
            emotion: emotion,
            timestamp: ISO8601DateFormatter().string(from: Date())
        )
    )
    
    do {
        request.httpBody = try JSONEncoder().encode(payload)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data, error == nil else {
                print("Network error: \(error?.localizedDescription ?? "Unknown")")
                completion(nil)
                return
            }
            
            if let result = try? JSONDecoder().decode([String: Double].self, from: data) {
                completion(result["swip_score"])
            } else {
                completion(nil)
            }
        }.resume()
    } catch {
        print("Encoding error: \(error)")
        completion(nil)
    }
}
```

---

## Rate Limits

To ensure fair usage and system stability, the following rate limits apply:

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/api/swip/ingest` | 60 requests | per minute (per IP) |
| `/api/apps` (GET) | 60 requests | per minute |
| `/api/apps` (POST) | 20 requests | per minute |

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response with headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699012800
```

---

## Dashboard Features

### Leaderboard

View your app's ranking compared to other wellness applications:
- **Global Ranking**: See where you stand globally
- **Category Rankings**: Compare within your category
- **Developer Rankings**: Track your performance as a developer

### Analytics

Access detailed analytics:
- **Total Sessions**: Number of wellness sessions tracked
- **Average SWIP Score**: Your app's wellness impact
- **Stress Rate**: Percentage of stressed vs. calm sessions
- **Average Duration**: How long users engage with wellness features
- **Average HRV**: Overall heart rate variability metrics

### Session Explorer

Browse all wellness sessions with filters:
- Filter by date range (Today, This Week, This Month, All Time)
- Filter by emotion (Stressed, Amused, Neutral)
- View detailed session metrics
- Export session data

---

## Best Practices

### 1. Data Quality

- **Send complete data**: Include both HRV metrics and emotional state for accurate scores
- **Validate before sending**: Ensure data matches the schema
- **Use realistic values**: HRV values should be physiologically plausible
- **Timestamp accurately**: Use ISO 8601 format with timezone

### 2. Session Management

- **Unique session IDs**: Use UUIDs or combine timestamp + user ID
- **Don't duplicate**: Each session should be sent only once
- **Handle errors gracefully**: Implement retry logic with exponential backoff

### 3. Privacy & Security

- **Anonymize data**: Never send personally identifiable information
- **Secure storage**: Encrypt sensitive data at rest
- **HTTPS only**: Always use secure connections
- **Key rotation**: Rotate API keys regularly

### 4. Performance

- **Batch when possible**: Consider batching multiple sessions
- **Handle rate limits**: Implement exponential backoff
- **Monitor latency**: Track API response times
- **Cache responses**: Don't recalculate unnecessary scores

---

## Troubleshooting

### Common Issues

**Q: I'm getting "Invalid API key" errors**
A: 
- Verify your API key is correct (no extra spaces)
- Check that the key hasn't been revoked
- Ensure you're using the `x-api-key` header

**Q: My SWIP scores seem incorrect**
A:
- Verify HRV values are in milliseconds (not seconds)
- Check that emotion values match supported emotions
- Ensure data quality (no null/undefined values)

**Q: Rate limit errors are blocking my app**
A:
- Implement exponential backoff
- Consider batching requests
- Check if you're sending duplicate data
- Contact support for higher limits

**Q: Sessions aren't appearing in the dashboard**
A:
- Verify API response was successful (200 OK)
- Check that session_id is unique
- Allow a few seconds for data to process
- Refresh the dashboard page

---

## Support & Resources

- **Dashboard**: [https://your-domain.com](/leaderboard)
- **Developer Portal**: [https://your-domain.com/developer](/developer)
- **Status Page**: Check system status and uptime
- **GitHub**: Report issues and contribute
- **Email Support**: support@swip-dashboard.com

---

## API Versioning

Current API Version: **v1**

We maintain backward compatibility and will announce breaking changes 90 days in advance.

---

## Changelog

### Version 1.0 (November 2025)
- Initial public release
- SWIP Ingest API
- HRV-based scoring
- Emotional state tracking
- Real-time leaderboard updates

---

*Last updated: November 3, 2025*
