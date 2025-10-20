# SWIP API Reference

## Quick Start

### 1. Get Your API Key
1. Visit `/developer` in your dashboard
2. Create an app
3. Generate an API key

### 2. Submit Data
```bash
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "X-API-Key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "my_app",
    "session_id": "sess_123",
    "metrics": {
      "hrv": { "rmssd": 40, "sdnn": 50 },
      "emotion": "calm"
    }
  }'
```

### 3. Get Public Data
```bash
curl "http://localhost:3000/api/public/swipsessions"
```

---

## Endpoints

### POST /api/swip/ingest
Submit wellness session data.

**Headers:**
- `X-API-Key`: Your API key (required)
- `Content-Type`: application/json

**Body:**
```json
{
  "app_id": "string",
  "session_id": "string", 
  "metrics": {
    "hr": [70, 72, 68],
    "rr": [16, 15, 17],
    "hrv": {
      "sdnn": 45.2,
      "rmssd": 38.7
    },
    "emotion": "calm"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "swip_score": 75
}
```

**Rate Limit:** 60 req/min per IP

---

### GET /api/public/swipsessions
Get anonymized session data.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "sessionId": "sess_abc123",
      "swipScore": 75.5,
      "emotion": "calm",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "app": { "name": "WellnessApp" }
    }
  ]
}
```

**Rate Limit:** 120 req/min (shared)

---

## SWIP Score Algorithm

**Base Score:** 50 points

**HRV Scoring:**
- RMSSD > 40ms: +0.5 per ms (max +25)
- RMSSD < 20ms: -0.3 per ms (max -15)
- SDNN > 50ms: +0.3 per ms (max +20)
- SDNN < 30ms: -0.2 per ms (max -10)

**Emotion Scoring:**
- `calm/relaxed/peaceful`: +10
- `focused/concentrated`: +5
- `stressed/anxious/tense`: -15
- `excited/energetic`: +3
- `tired/exhausted`: -5

**Variability Bonus:** +5 if HR & RR show good variability

**Final Range:** 0-100 points

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Missing/invalid API key |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## SDK Examples

### JavaScript
```javascript
const API_KEY = 'sk_live_your_key';

// Submit session
const response = await fetch('/api/swip/ingest', {
  method: 'POST',
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    app_id: 'my_app',
    session_id: 'sess_' + Date.now(),
    metrics: {
      hrv: { rmssd: 40, sdnn: 50 },
      emotion: 'calm'
    }
  })
});

const result = await response.json();
console.log('SWIP Score:', result.swip_score);
```

### Python
```python
import requests

API_KEY = 'sk_live_your_key'

# Submit session
response = requests.post(
    'http://localhost:3000/api/swip/ingest',
    headers={'X-API-Key': API_KEY},
    json={
        'app_id': 'my_app',
        'session_id': f'sess_{int(time.time())}',
        'metrics': {
            'hrv': {'rmssd': 40, 'sdnn': 50},
            'emotion': 'calm'
        }
    }
)

result = response.json()
print(f'SWIP Score: {result["swip_score"]}')
```

### cURL
```bash
# Submit session
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "X-API-Key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "my_app",
    "session_id": "sess_123",
    "metrics": {
      "hrv": {"rmssd": 40, "sdnn": 50},
      "emotion": "calm"
    }
  }'

# Get public data
curl "http://localhost:3000/api/public/swipsessions"
```

---

## Rate Limiting

**Headers included in all responses:**
- `X-RateLimit-Limit`: Max requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp

**Limits:**
- Ingest API: 60 requests/minute per IP
- Public API: 120 requests/minute (shared)

---

## Data Types

### Heart Rate Variability (HRV)
- **SDNN**: Standard deviation of NN intervals (ms)
- **RMSSD**: Root mean square of successive differences (ms)

### Emotions
Supported emotional states with their score impact:
- `calm`, `relaxed`, `peaceful` (+10)
- `focused`, `concentrated` (+5)
- `stressed`, `anxious`, `tense` (-15)
- `excited`, `energetic` (+3)
- `tired`, `exhausted` (-5)

### Heart Rate (HR)
- Array of heart rate measurements in BPM
- Used for variability calculations

### Respiratory Rate (RR)
- Array of respiratory rate measurements in breaths/min
- Used for variability calculations

---

## Testing

### Test with Sample Data
```bash
# Test with minimal data
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "X-API-Key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test_app",
    "session_id": "test_sess_001",
    "metrics": {
      "hrv": {"rmssd": 45, "sdnn": 55},
      "emotion": "calm"
    }
  }'
```

### Expected Response
```json
{
  "ok": true,
  "swip_score": 78
}
```

---

*For detailed documentation, see API_DOCUMENTATION.md*
