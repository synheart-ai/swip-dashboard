'use client';

import { useState, useEffect } from 'react';

const tabs = [
  {
    id: 'analytics',
    title: 'Analytics API',
    subtitle: 'Read Data',
    description:
      'Read-only REST endpoints for claimed applications. Fetch sessions, biosignals, emotions, and SWIP scores using your analytics API key.',
    bullets: [
      'Secure `x-api-key` authentication scoped to your apps',
      'Pagination, filtering, and anonymized aggregates',
      'Ideal for dashboards, reports, and wellness insights',
      'No verification required—generate keys instantly',
    ],
    examples: [
      {
        title: 'List Your Apps',
        code: `GET https://swip.synheart.io/api/v1/apps?limit=10
Headers:
  x-api-key: swip_key_your_analytics_key

Response:
{
  "success": true,
  "apps": [
    {
      "app_id": "com.yourcompany.app",
      "app_name": "Your Wellness App",
      "app_avg_swip_score": 85.5,
      "total_sessions": 1234
    }
  ],
  "total": 1
}`,
      },
      {
        title: 'Get Sessions',
        code: `GET https://swip.synheart.io/api/v1/app_sessions?app_id=com.yourcompany.app&limit=20
Headers:
  x-api-key: swip_key_your_analytics_key

Response:
{
  "success": true,
  "sessions": [
    {
      "app_session_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "anonymous_user_123",
      "started_at": "2025-11-08T14:00:00Z",
      "ended_at": "2025-11-08T14:15:00Z",
      "avg_swip_score": 87.5,
      "duration": 900
    }
  ],
  "total": 1
}`,
      },
      {
        title: 'Get Biosignals',
        code: `GET https://swip.synheart.io/api/v1/app_biosignals?app_session_id=550e8400-e29b-41d4-a716-446655440000
Headers:
  x-api-key: swip_key_your_analytics_key

Response:
{
  "success": true,
  "biosignals": [
    {
      "app_biosignal_id": "uuid-1",
      "timestamp": "2025-11-08T14:00:05Z",
      "heart_rate": 72,
      "hrv_sdnn": 65.4,
      "hrv_rmssd": 58.2,
      "respiratory_rate": 14.0
    }
  ],
  "total": 1
}`,
      },
      {
        title: 'Get Emotions',
        code: `GET https://swip.synheart.io/api/v1/emotions?app_session_id=550e8400-e29b-41d4-a716-446655440000
Headers:
  x-api-key: swip_key_your_analytics_key

Response:
{
  "success": true,
  "emotions": [
    {
      "app_biosignal_id": "uuid-1",
      "swip_score": 88.5,
      "phys_subscore": 52.3,
      "emo_subscore": 36.2,
      "dominant_emotion": "calm",
      "confidence": 0.92
    }
  ],
  "total": 1
}`,
      },
    ],
  },
  {
    id: 'ingestion',
    title: 'Ingestion API',
    subtitle: 'Write Data',
    description:
      'Verified partners can stream biosignals, sessions, and emotion data into the dashboard using an ingestion key obtained through verification.',
    bullets: [
      'Keys are locked to a single external app ID',
      'Validated payloads via SWIP SDK helpers',
      'Bulk ingestion support (up to 100 items per request)',
      'Request verification in the developer portal',
    ],
    examples: [
      {
        title: 'Create Session',
        code: `POST https://swip.synheart.io/api/v1/app_sessions
Headers:
  x-api-key: swip_key_your_ingestion_key
  Content-Type: application/json

Body:
{
  "app_session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user_123",
  "device_id": "device_456",
  "started_at": "2025-11-08T14:00:00Z",
  "app_id": "com.yourcompany.app"
}

Response:
{
  "success": true,
  "message": "Session created successfully"
}`,
      },
      {
        title: 'Ingest Biosignals',
        code: `POST https://swip.synheart.io/api/v1/app_biosignals
Headers:
  x-api-key: swip_key_your_ingestion_key
  Content-Type: application/json

Body:
[
  {
    "app_biosignal_id": "uuid-1",
    "app_session_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-11-08T14:00:05Z",
    "heart_rate": 72,
    "hrv_sdnn": 65.4,
    "hrv_rmssd": 58.2,
    "respiratory_rate": 14.0,
    "temperature": 36.8,
    "blood_oxygen_saturation": 98
  }
]

Response:
{
  "success": true,
  "message": "Biosignals ingested successfully",
  "count": 1
}`,
      },
      {
        title: 'Ingest Emotions',
        code: `POST https://swip.synheart.io/api/v1/emotions
Headers:
  x-api-key: swip_key_your_ingestion_key
  Content-Type: application/json

Body:
[
  {
    "app_biosignal_id": "uuid-1",
    "swip_score": 88.5,
    "phys_subscore": 52.3,
    "emo_subscore": 36.2,
    "confidence": 0.92,
    "dominant_emotion": "calm",
    "model_id": "wesad_emotion_v1_0"
  }
]

Response:
{
  "success": true,
  "message": "Emotions ingested successfully",
  "count": 1
}`,
      },
      {
        title: 'Register App',
        code: `POST https://swip.synheart.io/api/v1/apps
Headers:
  x-api-key: swip_key_your_ingestion_key
  Content-Type: application/json

Body:
{
  "app_id": "com.yourcompany.app",
  "app_name": "Your Wellness App",
  "category": "Health",
  "developer": "Your Company",
  "app_version": "1.0.0"
}

Response:
{
  "success": true,
  "message": "App registered successfully"
}`,
      },
    ],
  },
];

export function ApiSlider() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'ingestion'>('analytics');
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const active = tabs.find((tab) => tab.id === activeTab)!;

  // Reset example index when switching tabs
  useEffect(() => {
    setActiveExampleIndex(0);
  }, [activeTab]);

  const handleTabChange = (tabId: 'analytics' | 'ingestion') => {
    if (tabId !== activeTab) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab(tabId);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const handleExampleChange = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveExampleIndex(index);
      setIsTransitioning(false);
    }, 200);
  };

  const currentExample = active.examples[activeExampleIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-gray-900/30 p-8 md:p-12 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_55%)]" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-200 text-sm font-medium">REST API</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              SWIP Dashboard APIs
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl">
              Explore read and write endpoints with interactive examples. Switch between analytics and ingestion modes.
            </p>
          </div>
          <div className="inline-flex bg-black/40 border border-purple-500/30 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as 'analytics' | 'ingestion')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10">
          {/* Left: Description & Navigation */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-2xl font-semibold text-white">{active.title}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-200 border border-purple-500/30">
                  {active.subtitle}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">{active.description}</p>
              <ul className="space-y-3 mb-6">
                {active.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example Navigation */}
            <div>
              <p className="text-gray-400 text-sm font-medium mb-3">Example Endpoints:</p>
              <div className="flex flex-wrap gap-2">
                {active.examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleChange(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeExampleIndex === index
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                    }`}
                  >
                    {example.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Code Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-transparent blur-3xl" />
            <div className="relative rounded-2xl border border-purple-500/20 bg-black/60 backdrop-blur-sm overflow-hidden">
              {/* Code Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 bg-black/40">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-xs text-purple-300 font-medium">{currentExample.title}</div>
              </div>
              
              {/* Code Content */}
              <div className={`p-6 font-mono text-xs md:text-sm text-purple-100 leading-relaxed transition-opacity duration-200 ${
                isTransitioning ? 'opacity-50' : 'opacity-100'
              }`}>
                <pre className="whitespace-pre-wrap break-words overflow-x-auto">
                  {currentExample.code}
                </pre>
              </div>
            </div>

            {/* Navigation Arrows */}
            {active.examples.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => handleExampleChange((activeExampleIndex - 1 + active.examples.length) % active.examples.length)}
                  className="px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50 transition-all text-sm font-medium"
                >
                  ← Previous
                </button>
                <span className="text-gray-500 text-sm">
                  {activeExampleIndex + 1} / {active.examples.length}
                </span>
                <button
                  onClick={() => handleExampleChange((activeExampleIndex + 1) % active.examples.length)}
                  className="px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50 transition-all text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

