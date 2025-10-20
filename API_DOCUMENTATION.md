# SWIP Dashboard API Documentation

## Overview

The SWIP (Wellness Impact Protocol) Dashboard provides two main API endpoints:

1. **Public Sessions API** - Retrieve anonymized session data for transparency
2. **SWIP Ingest API** - Submit wellness session data for analysis

Both APIs include rate limiting, structured logging, and comprehensive error handling.

---

## Public Sessions API

### Endpoint
```
GET /api/public/swipsessions
```

### Description
Retrieves anonymized SWIP session data for public transparency. This endpoint provides insights into wellness metrics without exposing sensitive user information.

### Authentication
No authentication required - this is a public endpoint.

### Rate Limiting
- **Limit**: 120 requests per minute (shared bucket)
- **Headers**: Rate limit information included in response headers

### Request

#### Headers
```
Content-Type: application/json
```

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/public/swipsessions" \
  -H "Content-Type: application/json"
```

### Response

#### Success Response (200 OK)
```json
{
  "ok": true,
  "data": [
    {
      "sessionId": "sess_abc123def456",
      "swipScore": 75.5,
      "emotion": "calm",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "app": {
        "name": "WellnessApp"
      }
    },
    {
      "sessionId": "sess_xyz789uvw012",
      "swipScore": 62.3,
      "emotion": "focused",
      "createdAt": "2024-01-15T09:15:00.000Z",
      "app": {
        "name": "MeditationApp"
      }
    }
  ]
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | Success indicator |
| `data` | array | Array of session objects |
| `sessionId` | string | Unique session identifier (anonymized) |
| `swipScore` | number | Computed wellness score (0-100) |
| `emotion` | string | Detected emotional state |
| `createdAt` | string | ISO timestamp of session creation |
| `app.name` | string | Name of the application that created the session |

#### Rate Limit Exceeded (429 Too Many Requests)
```json
{
  "ok": false,
  "error": "Rate limit exceeded"
}
```

#### Server Error (200 OK with error)
```json
{
  "ok": false,
  "error": "DB not configured"
}
```

### Response Headers
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when rate limit resets

---

## SWIP Ingest API

### Endpoint
```
POST /api/swip/ingest
```

### Description
Submits wellness session data for SWIP score computation and analysis. This endpoint processes biometric and emotional data to generate wellness insights.

### Authentication
API key required via `X-API-Key` header.

### Rate Limiting
- **Limit**: 60 requests per minute per IP address
- **Headers**: Rate limit information included in response headers

### Request

#### Headers
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

#### Request Body Schema
```json
{
  "app_id": "string",
  "session_id": "string",
  "metrics": {
    "hr": [70, 72, 68, 75, 71],
    "rr": [16, 15, 17, 16, 15],
    "hrv": {
      "sdnn": 45.2,
      "rmssd": 38.7
    },
    "emotion": "calm",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `app_id` | string | Yes | Application identifier |
| `session_id` | string | Yes | Unique session identifier |
| `metrics.hr` | number[] | No | Heart rate measurements (BPM) |
| `metrics.rr` | number[] | No | Respiratory rate measurements (breaths/min) |
| `metrics.hrv.sdnn` | number | No | Standard deviation of NN intervals (ms) |
| `metrics.hrv.rmssd` | number | No | Root mean square of successive differences (ms) |
| `metrics.emotion` | string | No | Detected emotional state |
| `metrics.timestamp` | string | No | ISO timestamp of measurement |

#### Supported Emotions
- `calm`, `relaxed`, `peaceful` (+10 points)
- `focused`, `concentrated` (+5 points)
- `stressed`, `anxious`, `tense` (-15 points)
- `excited`, `energetic` (+3 points)
- `tired`, `exhausted` (-5 points)

#### Example Request
```bash
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_live_abc123def456" \
  -d '{
    "app_id": "wellness_app_001",
    "session_id": "sess_abc123def456",
    "metrics": {
      "hr": [70, 72, 68, 75, 71],
      "rr": [16, 15, 17, 16, 15],
      "hrv": {
        "sdnn": 45.2,
        "rmssd": 38.7
      },
      "emotion": "calm",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }'
```

### Response

#### Success Response (200 OK)
```json
{
  "ok": true,
  "swip_score": 75
}
```

#### Error Responses

##### Missing API Key (401 Unauthorized)
```json
{
  "ok": false,
  "error": "Missing x-api-key"
}
```

##### Invalid API Key (401 Unauthorized)
```json
{
  "ok": false,
  "error": "Invalid API key"
}
```

##### Invalid Request Data (400 Bad Request)
```json
{
  "ok": false,
  "error": {
    "fieldErrors": {
      "session_id": ["Required"],
      "metrics.hrv.sdnn": ["Expected number, received string"]
    },
    "formErrors": []
  }
}
```

##### Rate Limit Exceeded (429 Too Many Requests)
```json
{
  "ok": false,
  "error": "Rate limit exceeded"
}
```

##### Server Error (500 Internal Server Error)
```json
{
  "ok": false,
  "error": "Failed to save session"
}
```

### SWIP Score Algorithm

The SWIP score is computed using a sophisticated algorithm that considers multiple wellness indicators:

#### Base Score
- **Starting Point**: 50 points (neutral wellness)

#### HRV Metrics (Heart Rate Variability)
- **RMSSD Scoring**: 
  - Values > 40ms: +0.5 points per ms above 40 (max +25)
  - Values < 20ms: -0.3 points per ms below 20 (max -15)
- **SDNN Scoring**:
  - Values > 50ms: +0.3 points per ms above 50 (max +20)
  - Values < 30ms: -0.2 points per ms below 30 (max -10)

#### Emotional State
- **Positive emotions** (calm, relaxed, peaceful): +10 points
- **Focused states** (focused, concentrated): +5 points
- **Negative emotions** (stressed, anxious, tense): -15 points
- **High energy** (excited, energetic): +3 points
- **Low energy** (tired, exhausted): -5 points

#### Variability Bonus
- **Heart Rate & Respiratory Rate**: +5 points if both show good variability (>0.1 coefficient of variation)

#### Final Score
- **Range**: 0-100 points
- **Rounding**: Rounded to nearest integer

### Response Headers
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when rate limit resets

---

## Error Handling

### Common Error Codes
| Code | Description | Possible Causes |
|------|-------------|-----------------|
| 400 | Bad Request | Invalid JSON, missing required fields, validation errors |
| 401 | Unauthorized | Missing or invalid API key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Database issues, server errors |

### Error Response Format
All error responses follow this structure:
```json
{
  "ok": false,
  "error": "Error message or validation details"
}
```

---

## Rate Limiting

### Implementation
- **Redis-based**: Distributed rate limiting using Redis
- **Sliding window**: 60-second windows
- **Headers**: Rate limit information included in all responses

### Limits
- **Public API**: 120 requests/minute (shared bucket)
- **Ingest API**: 60 requests/minute per IP address

### Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642248600
```

---

## Logging

### Structured Logging
All API requests are logged with structured data including:
- Request endpoint and method
- IP address
- API key (masked)
- Response status and duration
- Error details (if applicable)

### Log Levels
- **Info**: Successful requests, rate limit hits
- **Error**: Server errors, validation failures

---

## Security

### API Key Management
- API keys are stored securely in the database
- Keys can be revoked without affecting existing sessions
- Rate limiting prevents abuse

### Data Privacy
- Public API only returns anonymized data
- Session IDs are truncated for privacy
- No personal information is exposed

### Input Validation
- All input data is validated using Zod schemas
- Malformed requests are rejected with detailed error messages
- SQL injection protection via Prisma ORM

---

## Examples

### Complete Integration Example

#### 1. Create an App and API Key
```bash
# First, create an app through the developer dashboard
# Then generate an API key
```

#### 2. Submit Session Data
```bash
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_live_your_api_key" \
  -d '{
    "app_id": "my_wellness_app",
    "session_id": "sess_'$(date +%s)'",
    "metrics": {
      "hr": [70, 72, 68, 75, 71, 69, 73],
      "rr": [16, 15, 17, 16, 15, 16, 15],
      "hrv": {
        "sdnn": 45.2,
        "rmssd": 38.7
      },
      "emotion": "calm"
    }
  }'
```

#### 3. Retrieve Public Data
```bash
curl -X GET "http://localhost:3000/api/public/swipsessions"
```

### JavaScript/Node.js Example
```javascript
const API_BASE = 'http://localhost:3000';
const API_KEY = 'sk_live_your_api_key';

// Submit session data
async function submitSession(sessionData) {
  const response = await fetch(`${API_BASE}/api/swip/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify(sessionData)
  });
  
  const result = await response.json();
  
  if (result.ok) {
    console.log('SWIP Score:', result.swip_score);
  } else {
    console.error('Error:', result.error);
  }
}

// Get public sessions
async function getPublicSessions() {
  const response = await fetch(`${API_BASE}/api/public/swipsessions`);
  const result = await response.json();
  
  if (result.ok) {
    console.log('Sessions:', result.data);
  }
}
```

---

## Support

For API support and questions:
- **Documentation**: This file
- **Rate Limits**: Check response headers for current limits
- **Errors**: All errors include descriptive messages
- **Logs**: Server logs include detailed request information

---

*Last updated: January 2024*
*API Version: 1.0*
