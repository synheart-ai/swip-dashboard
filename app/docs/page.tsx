'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  const navigation = [
    { id: 'introduction', title: 'Introduction', icon: '📖' },
    { id: 'quickstart', title: 'Quick Start', icon: '🚀' },
    { id: 'authentication', title: 'Authentication', icon: '🔐' },
    { id: 'endpoints', title: 'API Endpoints', icon: '⚡' },
    { id: 'swip-score', title: 'SWIP Score', icon: '📊' },
    { id: 'examples', title: 'Code Examples', icon: '💻' },
    { id: 'sdk', title: 'SDKs', icon: '📦' },
    { id: 'errors', title: 'Error Handling', icon: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">SWIP</div>
                <div className="text-xs text-gray-500">Documentation</div>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/docs" className="text-blue-600 font-semibold">
                Docs
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/developer/apps" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-1">
              <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </button>
                ))}
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🔗</span> Quick Links
                </h3>
                <div className="space-y-2 text-sm">
                  <a href="https://github.com" className="block text-blue-600 hover:text-blue-700">
                    GitHub Repository →
                  </a>
                  <a href="/developer/apps" className="block text-blue-600 hover:text-blue-700">
                    Developer Portal →
                  </a>
                  <a href="/developer/api-keys" className="block text-blue-600 hover:text-blue-700">
                    API Keys →
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 lg:p-12">
              {activeSection === 'introduction' && <IntroductionSection />}
              {activeSection === 'quickstart' && <QuickStartSection />}
              {activeSection === 'authentication' && <AuthenticationSection />}
              {activeSection === 'endpoints' && <EndpointsSection />}
              {activeSection === 'swip-score' && <SwipScoreSection />}
              {activeSection === 'examples' && <ExamplesSection />}
              {activeSection === 'sdk' && <SDKSection />}
              {activeSection === 'errors' && <ErrorsSection />}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-8 px-4">
              {navigation.findIndex(n => n.id === activeSection) > 0 && (
                <button
                  onClick={() => setActiveSection(navigation[navigation.findIndex(n => n.id === activeSection) - 1].id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
              )}
              {navigation.findIndex(n => n.id === activeSection) < navigation.length - 1 && (
                <button
                  onClick={() => setActiveSection(navigation[navigation.findIndex(n => n.id === activeSection) + 1].id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 ml-auto"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function IntroductionSection() {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to SWIP API</h1>
      <p className="text-xl text-gray-600 mb-8">
        Build powerful wellness applications with real-time biometric intelligence and behavioral insights.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 not-prose">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="font-bold text-gray-900 mb-2">Fast & Reliable</h3>
          <p className="text-sm text-gray-600">99.9% uptime with global CDN distribution</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-bold text-gray-900 mb-2">Secure</h3>
          <p className="text-sm text-gray-600">Enterprise-grade security with API key authentication</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-bold text-gray-900 mb-2">Intelligent</h3>
          <p className="text-sm text-gray-600">Advanced SWIP scoring algorithm for wellness insights</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What is SWIP?</h2>
      <p className="text-gray-700 leading-relaxed">
        SWIP (Smart Wellness Intelligence Platform) is a comprehensive API that helps you track, analyze, and understand wellness patterns across multiple platforms and devices. It combines biometric data with behavioral insights to provide actionable wellness intelligence.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Key Features</h3>
      <ul className="space-y-2 text-gray-700">
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1">✓</span>
          <span><strong>Biometric Intelligence:</strong> Track HRV, heart rate, and respiratory data</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1">✓</span>
          <span><strong>Behavioral Insights:</strong> Analyze digital behavior patterns</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1">✓</span>
          <span><strong>Real-time Monitoring:</strong> 24/7 wellness tracking and analysis</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1">✓</span>
          <span><strong>Platform Integrations:</strong> Connect multiple wellness platforms</span>
        </li>
      </ul>
    </div>
  );
}

function QuickStartSection() {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Quick Start Guide</h1>
      <p className="text-xl text-gray-600 mb-8">
        Get up and running with the SWIP API in just a few minutes.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8 not-prose">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💡</span>
          <h3 className="font-bold text-gray-900">Before you start</h3>
        </div>
        <p className="text-gray-700">
          You'll need a SWIP account and an API key. If you don't have one yet, sign up at the{' '}
          <a href="/developer/apps" className="text-blue-600 hover:text-blue-700 font-medium">
            Developer Portal
          </a>.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Create an App</h2>
      <p className="text-gray-700 mb-4">
        Navigate to the <a href="/developer/apps" className="text-blue-600 hover:text-blue-700">Apps page</a> and click "Create New App". Give your app a descriptive name.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Step 2: Generate API Key</h2>
      <p className="text-gray-700 mb-4">
        Once your app is created, click the "Generate API Key" button. Copy and securely store your API key – you won't be able to see it again!
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Step 3: Make Your First Request</h2>
      <p className="text-gray-700 mb-4">
        Send wellness data to the SWIP API:
      </p>

      <div className="not-prose">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <code>{`curl -X POST "https://your-domain.com/api/swip/ingest" \\
  -H "X-API-Key: sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_id": "your_app_id",
    "session_id": "session_123",
    "metrics": {
      "hrv": {
        "rmssd": 45.2,
        "sdnn": 52.8
      },
      "hr": [72, 74, 71],
      "emotion": "calm"
    }
  }'`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Step 4: Get the Response</h2>
      <p className="text-gray-700 mb-4">
        The API will return a SWIP score (0-100) representing wellness state:
      </p>

      <div className="not-prose">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <code>{`{
  "ok": true,
  "swip_score": 78.5,
  "session_id": "session_123"
}`}</code>
        </pre>
      </div>
    </div>
  );
}

function AuthenticationSection() {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Authentication</h1>
      <p className="text-xl text-gray-600 mb-8">
        Secure your API requests with API key authentication.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">API Key Authentication</h2>
      <p className="text-gray-700 mb-4">
        All API requests require authentication using an API key. Include your API key in the request header:
      </p>

      <div className="not-prose mb-8">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <code>X-API-Key: sk_live_your_api_key_here</code>
        </pre>
      </div>

      <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg mb-8 not-prose">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-bold text-red-900">Security Warning</h3>
        </div>
        <p className="text-red-800">
          Never expose your API key in client-side code, public repositories, or unsecured locations. Always use environment variables and keep your keys secret.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">API Key Types</h2>
      <div className="not-prose space-y-4">
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">LIVE</span>
            <h3 className="font-bold text-gray-900">Production Keys</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Use for production applications. Prefix: <code className="bg-gray-100 px-2 py-1 rounded text-sm">sk_live_</code>
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">TEST</span>
            <h3 className="font-bold text-gray-900">Development Keys</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Use for testing and development. Prefix: <code className="bg-gray-100 px-2 py-1 rounded text-sm">sk_test_</code>
          </p>
        </div>
      </div>
    </div>
  );
}

function EndpointsSection() {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">API Endpoints</h1>
      <p className="text-xl text-gray-600 mb-8">
        Complete reference for all available API endpoints.
      </p>

      {/* POST /api/swip/ingest */}
      <div className="not-prose mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg font-mono text-sm">POST</span>
            <code className="text-lg font-semibold">/api/swip/ingest</code>
          </div>
          <p className="text-blue-100">Submit wellness session data for analysis</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-b-xl p-6">
          <h4 className="font-bold text-gray-900 mb-3">Request Headers</h4>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 font-mono text-sm">
            <div>X-API-Key: your_api_key</div>
            <div>Content-Type: application/json</div>
          </div>

          <h4 className="font-bold text-gray-900 mb-3">Request Body</h4>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
            <code>{`{
  "app_id": "string",
  "session_id": "string",
  "metrics": {
    "hrv": {
      "rmssd": number,  // Root Mean Square of Successive Differences
      "sdnn": number    // Standard Deviation of NN intervals
    },
    "hr": number[],     // Heart rate array
    "rr": number[],     // Respiratory rate array
    "emotion": "calm" | "stressed" | "focused" | "relaxed"
  }
}`}</code>
          </pre>

          <h4 className="font-bold text-gray-900 mb-3">Response</h4>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`{
  "ok": true,
  "swip_score": 78.5,
  "session_id": "session_123"
}`}</code>
          </pre>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Rate Limit:</strong> 60 requests per minute per IP
            </p>
          </div>
        </div>
      </div>

      {/* GET /api/public/swipsessions */}
      <div className="not-prose mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg font-mono text-sm">GET</span>
            <code className="text-lg font-semibold">/api/public/swipsessions</code>
          </div>
          <p className="text-green-100">Retrieve anonymized public session data</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-b-xl p-6">
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>🌐 Public Endpoint:</strong> No authentication required
            </p>
          </div>

          <h4 className="font-bold text-gray-900 mb-3">Response</h4>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`{
  "ok": true,
  "data": [
    {
      "sessionId": "sess_abc123",
      "swipScore": 75.5,
      "emotion": "calm",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "app": {
        "name": "WellnessApp"
      }
    }
  ]
}`}</code>
          </pre>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Rate Limit:</strong> 120 requests per minute (shared)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SwipScoreSection() {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">SWIP Score Algorithm</h1>
      <p className="text-xl text-gray-600 mb-8">
        Understanding how the wellness intelligence score is calculated.
      </p>

      <div className="not-prose mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">0 - 100</h2>
          <p className="text-purple-100">The SWIP score ranges from 0 (poor wellness) to 100 (optimal wellness)</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Scoring Components</h2>
      
      <div className="not-prose space-y-4 mb-8">
        <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-xl">
          <h3 className="font-bold text-gray-900 mb-2">Base Score: 50 points</h3>
          <p className="text-gray-700 text-sm">Every session starts with a neutral baseline score</p>
        </div>

        <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-xl">
          <h3 className="font-bold text-gray-900 mb-2">HRV Scoring (up to +45 points)</h3>
          <ul className="text-gray-700 text-sm space-y-1 mt-2">
            <li>• RMSSD &gt; 40ms: +0.5 per ms (max +25)</li>
            <li>• RMSSD &lt; 20ms: -0.3 per ms (max -15)</li>
            <li>• SDNN &gt; 50ms: +0.3 per ms (max +20)</li>
            <li>• SDNN &lt; 30ms: -0.2 per ms (max -10)</li>
          </ul>
        </div>

        <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded-r-xl">
          <h3 className="font-bold text-gray-900 mb-2">Emotion Scoring</h3>
          <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <span className="text-green-600 font-semibold">calm/relaxed</span>
              <span className="text-gray-600"> +10</span>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <span className="text-blue-600 font-semibold">focused</span>
              <span className="text-gray-600"> +5</span>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <span className="text-red-600 font-semibold">stressed</span>
              <span className="text-gray-600"> -15</span>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <span className="text-yellow-600 font-semibold">excited</span>
              <span className="text-gray-600"> +3</span>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-indigo-500 bg-indigo-50 p-6 rounded-r-xl">
          <h3 className="font-bold text-gray-900 mb-2">Variability Bonus: +5 points</h3>
          <p className="text-gray-700 text-sm">Awarded when heart rate and respiratory rate show healthy variation</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Example Calculation</h2>
      <div className="not-prose">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <code>{`Input:
  HRV RMSSD: 45ms
  HRV SDNN: 55ms
  Emotion: calm
  Variability: good

Calculation:
  Base:         50
  RMSSD bonus:  +2.5  (45-40) × 0.5
  SDNN bonus:   +1.5  (55-50) × 0.3
  Emotion:      +10
  Variability:  +5
  
Total SWIP Score: 69.0 / 100`}</code>
        </pre>
      </div>
    </div>
  );
}

function ExamplesSection() {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Code Examples</h1>
      <p className="text-xl text-gray-600 mb-8">
        Ready-to-use code snippets in multiple programming languages.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">JavaScript / Node.js</h2>
      <div className="not-prose mb-8">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <code>{`const axios = require('axios');

async function submitWellnessData() {
  try {
    const response = await axios.post(
      'https://your-domain.com/api/swip/ingest',
      {
        app_id: 'your_app_id',
        session_id: 'session_' + Date.now(),
        metrics: {
          hrv: {
            rmssd: 45.2,
            sdnn: 52.8
          },
          hr: [72, 74, 71, 70],
          rr: [16, 15, 17],
          emotion: 'calm'
        }
      },
      {
        headers: {
          'X-API-Key': 'sk_live_your_key_here',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('SWIP Score:', response.data.swip_score);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

submitWellnessData();`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Python</h2>
      <div className="not-prose mb-8">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <code>{`import requests
import time

def submit_wellness_data():
    url = 'https://your-domain.com/api/swip/ingest'
    headers = {
        'X-API-Key': 'sk_live_your_key_here',
        'Content-Type': 'application/json'
    }
    data = {
        'app_id': 'your_app_id',
        'session_id': f'session_{int(time.time())}',
        'metrics': {
            'hrv': {
                'rmssd': 45.2,
                'sdnn': 52.8
            },
            'hr': [72, 74, 71, 70],
            'rr': [16, 15, 17],
            'emotion': 'calm'
        }
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        result = response.json()
        print(f"SWIP Score: {result['swip_score']}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    submit_wellness_data()`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">cURL</h2>
      <div className="not-prose mb-8">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <code>{`curl -X POST "https://your-domain.com/api/swip/ingest" \\
  -H "X-API-Key: sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_id": "your_app_id",
    "session_id": "session_123",
    "metrics": {
      "hrv": {
        "rmssd": 45.2,
        "sdnn": 52.8
      },
      "hr": [72, 74, 71, 70],
      "rr": [16, 15, 17],
      "emotion": "calm"
    }
  }'`}</code>
        </pre>
      </div>
    </div>
  );
}

function SDKSection() {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">SDKs & Libraries</h1>
      <p className="text-xl text-gray-600 mb-8">
        Official and community-maintained SDKs for popular platforms.
      </p>

      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">JavaScript SDK</h3>
              <p className="text-sm text-gray-500">Official</p>
            </div>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm mb-3">
            <code>npm install @swip/sdk</code>
          </pre>
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Documentation →
          </a>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐍</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Python SDK</h3>
              <p className="text-sm text-gray-500">Official</p>
            </div>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm mb-3">
            <code>pip install swip-sdk</code>
          </pre>
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Documentation →
          </a>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Ruby Gem</h3>
              <p className="text-sm text-gray-500">Community</p>
            </div>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm mb-3">
            <code>gem install swip-ruby</code>
          </pre>
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Documentation →
          </a>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Go Module</h3>
              <p className="text-sm text-gray-500">Community</p>
            </div>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm mb-3">
            <code>go get github.com/swip/sdk-go</code>
          </pre>
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Documentation →
          </a>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8 not-prose">
        <h3 className="font-bold text-gray-900 mb-2">Building your own SDK?</h3>
        <p className="text-gray-700 text-sm mb-4">
          We'd love to feature your SDK in our documentation. Reach out to our developer relations team.
        </p>
        <a href="mailto:developers@swip.io" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          Contact Us →
        </a>
      </div>
    </div>
  );
}

function ErrorsSection() {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Handling</h1>
      <p className="text-xl text-gray-600 mb-8">
        Understanding and handling API errors effectively.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Response Format</h2>
      <p className="text-gray-700 mb-4">
        All errors follow a consistent JSON structure:
      </p>

      <div className="not-prose mb-8">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <code>{`{
  "ok": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">HTTP Status Codes</h2>
      <div className="not-prose space-y-3">
        <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-gray-900">200 OK</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">SUCCESS</span>
          </div>
          <p className="text-gray-600 text-sm">Request was successful</p>
        </div>

        <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-gray-900">400 Bad Request</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">CLIENT ERROR</span>
          </div>
          <p className="text-gray-600 text-sm">Invalid request data or missing required fields</p>
        </div>

        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-gray-900">401 Unauthorized</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">AUTH ERROR</span>
          </div>
          <p className="text-gray-600 text-sm">Missing or invalid API key</p>
        </div>

        <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-gray-900">429 Too Many Requests</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">RATE LIMIT</span>
          </div>
          <p className="text-gray-600 text-sm">Rate limit exceeded</p>
        </div>

        <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-gray-900">500 Internal Server Error</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">SERVER ERROR</span>
          </div>
          <p className="text-gray-600 text-sm">Something went wrong on our end</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Best Practices</h2>
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
          <span><strong>Always check the HTTP status code</strong> before processing the response</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
          <span><strong>Implement exponential backoff</strong> for retrying failed requests</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
          <span><strong>Log error responses</strong> for debugging and monitoring</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
          <span><strong>Handle rate limits gracefully</strong> by respecting retry-after headers</span>
        </li>
      </ul>
    </div>
  );
}

