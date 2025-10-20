# SWIP API Examples

## Basic Usage Examples

### 1. Submit a Wellness Session

```bash
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "X-API-Key: sk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "my_wellness_app",
    "session_id": "sess_001",
    "metrics": {
      "hr": [70, 72, 68, 75, 71],
      "rr": [16, 15, 17, 16, 15],
      "hrv": {
        "sdnn": 45.2,
        "rmssd": 38.7
      },
      "emotion": "calm"
    }
  }'
```

**Response:**
```json
{
  "ok": true,
  "swip_score": 75
}
```

### 2. Get Public Session Data

```bash
curl -X GET "http://localhost:3000/api/public/swipsessions"
```

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "sessionId": "sess_001",
      "swipScore": 75,
      "emotion": "calm",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "app": {
        "name": "my_wellness_app"
      }
    }
  ]
}
```

## JavaScript Examples

### Node.js/React Integration

```javascript
class SwipAPI {
  constructor(apiKey, baseURL = 'http://localhost:3000') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async submitSession(sessionData) {
    try {
      const response = await fetch(`${this.baseURL}/api/swip/ingest`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.swip_score;
    } catch (error) {
      console.error('Failed to submit session:', error);
      throw error;
    }
  }

  async getPublicSessions() {
    try {
      const response = await fetch(`${this.baseURL}/api/public/swipsessions`);
      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw error;
    }
  }
}

// Usage
const swip = new SwipAPI('sk_live_your_api_key_here');

// Submit a session
const score = await swip.submitSession({
  app_id: 'my_wellness_app',
  session_id: 'sess_' + Date.now(),
  metrics: {
    hrv: { rmssd: 40, sdnn: 50 },
    emotion: 'calm'
  }
});

console.log('SWIP Score:', score);

// Get public data
const sessions = await swip.getPublicSessions();
console.log('Public sessions:', sessions);
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useSwipAPI(apiKey) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitSession = async (sessionData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/swip/ingest', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.swip_score;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitSession, loading, error };
}

// Component usage
function WellnessTracker() {
  const { submitSession, loading, error } = useSwipAPI('sk_live_your_api_key');
  const [score, setScore] = useState(null);

  const handleSubmit = async () => {
    try {
      const swipScore = await submitSession({
        app_id: 'wellness_tracker',
        session_id: 'sess_' + Date.now(),
        metrics: {
          hrv: { rmssd: 42, sdnn: 48 },
          emotion: 'focused'
        }
      });
      setScore(swipScore);
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Session'}
      </button>
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {score && <p>SWIP Score: {score}</p>}
    </div>
  );
}
```

## Python Examples

### Basic Python Client

```python
import requests
import time
import json

class SwipClient:
    def __init__(self, api_key, base_url='http://localhost:3000'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })

    def submit_session(self, session_data):
        """Submit a wellness session for SWIP score calculation."""
        try:
            response = self.session.post(
                f'{self.base_url}/api/swip/ingest',
                json=session_data
            )
            response.raise_for_status()
            
            result = response.json()
            if not result.get('ok'):
                raise Exception(result.get('error', 'Unknown error'))
            
            return result['swip_score']
        except requests.exceptions.RequestException as e:
            print(f'Request failed: {e}')
            raise
        except Exception as e:
            print(f'API error: {e}')
            raise

    def get_public_sessions(self):
        """Get anonymized public session data."""
        try:
            response = requests.get(f'{self.base_url}/api/public/swipsessions')
            response.raise_for_status()
            
            result = response.json()
            if not result.get('ok'):
                raise Exception(result.get('error', 'Unknown error'))
            
            return result['data']
        except requests.exceptions.RequestException as e:
            print(f'Request failed: {e}')
            raise
        except Exception as e:
            print(f'API error: {e}')
            raise

# Usage example
if __name__ == '__main__':
    client = SwipClient('sk_live_your_api_key_here')
    
    # Submit a session
    session_data = {
        'app_id': 'python_wellness_app',
        'session_id': f'sess_{int(time.time())}',
        'metrics': {
            'hr': [70, 72, 68, 75, 71],
            'rr': [16, 15, 17, 16, 15],
            'hrv': {
                'sdnn': 45.2,
                'rmssd': 38.7
            },
            'emotion': 'calm'
        }
    }
    
    try:
        score = client.submit_session(session_data)
        print(f'SWIP Score: {score}')
    except Exception as e:
        print(f'Failed to submit session: {e}')
    
    # Get public sessions
    try:
        sessions = client.get_public_sessions()
        print(f'Retrieved {len(sessions)} public sessions')
        for session in sessions[:3]:  # Show first 3
            print(f'- {session["app"]["name"]}: {session["swipScore"]} ({session["emotion"]})')
    except Exception as e:
        print(f'Failed to get sessions: {e}')
```

## Error Handling Examples

### JavaScript Error Handling

```javascript
async function submitWithRetry(sessionData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/swip/ingest', {
        method: 'POST',
        headers: {
          'X-API-Key': 'sk_live_your_api_key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();

      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get('Retry-After') || 60;
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.swip_score;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### Python Error Handling

```python
import time
from requests.exceptions import RequestException

def submit_with_retry(client, session_data, max_retries=3):
    """Submit session with automatic retry on rate limiting."""
    for attempt in range(1, max_retries + 1):
        try:
            return client.submit_session(session_data)
        except RequestException as e:
            if e.response and e.response.status_code == 429:
                # Rate limited
                retry_after = int(e.response.headers.get('Retry-After', 60))
                print(f'Rate limited. Retrying after {retry_after} seconds...')
                time.sleep(retry_after)
                continue
            else:
                print(f'Request error on attempt {attempt}: {e}')
        except Exception as e:
            print(f'API error on attempt {attempt}: {e}')
        
        if attempt == max_retries:
            raise
        
        # Wait before retry
        time.sleep(attempt)
```

## Testing Examples

### Test Different Emotions

```bash
# Test calm emotion
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "X-API-Key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test_app",
    "session_id": "test_calm",
    "metrics": {
      "hrv": {"rmssd": 40, "sdnn": 50},
      "emotion": "calm"
    }
  }'

# Test stressed emotion
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "X-API-Key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test_app",
    "session_id": "test_stressed",
    "metrics": {
      "hrv": {"rmssd": 15, "sdnn": 25},
      "emotion": "stressed"
    }
  }'
```

### Test Different HRV Values

```bash
# High HRV (should give high score)
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "X-API-Key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test_app",
    "session_id": "test_high_hrv",
    "metrics": {
      "hrv": {"rmssd": 60, "sdnn": 80},
      "emotion": "calm"
    }
  }'

# Low HRV (should give lower score)
curl -X POST "http://localhost:3000/api/swip/ingest" \
  -H "X-API-Key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "test_app",
    "session_id": "test_low_hrv",
    "metrics": {
      "hrv": {"rmssd": 10, "sdnn": 20},
      "emotion": "stressed"
    }
  }'
```

---

*For complete API documentation, see API_DOCUMENTATION.md*
