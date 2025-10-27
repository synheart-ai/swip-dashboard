/**
 * Sessions Content Component
 *
 * Displays tabbed content for Recent Sessions, Device & Regions, and Analytics
 */

'use client';

import { useState } from 'react';
import { Badge } from './ui/Badge';
import { SwipScoreTrend } from './SwipScoreTrend';
import { EmotionDistribution } from './EmotionDistribution';
import { RecentSessionsTable } from './RecentSessionsTable';

interface RegionalData {
  region: string;
  avgScore: number;
  sessions: number;
}

interface DeviceData {
  platform: string;
  sessions: number;
  percentage: number;
}

const regionalData: RegionalData[] = [
  { region: 'North America', avgScore: 68.5, sessions: 42435 },
  { region: 'Europe', avgScore: 71.2, sessions: 38920 },
  { region: 'Asia', avgScore: 65.8, sessions: 28450 },
  { region: 'South America', avgScore: 69.3, sessions: 12340 },
  { region: 'Oceania', avgScore: 72.1, sessions: 8920 },
];

const deviceData: DeviceData[] = [
  { platform: 'iOS', sessions: 42435, percentage: 46 },
  { platform: 'Android', sessions: 38920, percentage: 36 },
];

export function SessionsContent() {
  const [activeTab, setActiveTab] = useState<'recent' | 'devices' | 'analytics'>('recent');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'recent'
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Recent Sessions
          {activeTab === 'recent' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-synheart-pink" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'devices'
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
          Device & Regions
          {activeTab === 'devices' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-synheart-pink" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'analytics'
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Analytics
          {activeTab === 'analytics' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-synheart-pink" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'recent' && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Session ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    App
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    SWIP Score
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Device
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Mock data - replace with real data */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <code className="text-synheart-pink text-sm font-mono">
                        sess_{Math.random().toString(36).substring(7)}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">Demo App {i}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white text-sm font-medium">
                        {(Math.random() * 30 + 60).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {Math.floor(Math.random() * 5)}m {Math.floor(Math.random() * 60)}s
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default" size="sm">
                        {Math.random() > 0.5 ? 'iOS' : 'Android'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {Math.floor(Math.random() * 30)}m ago
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Activity */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-synheart-pink mb-1">
                Regional Activity
              </h3>
              <p className="text-sm text-gray-400">Sessions by geographic region</p>
            </div>
            <div className="space-y-4">
              {regionalData.map((region) => (
                <div key={region.region}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{region.region}</div>
                        <div className="text-gray-500 text-xs">Avg {region.avgScore}</div>
                      </div>
                    </div>
                    <span className="text-white text-sm font-medium">
                      {region.sessions.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-synheart-pink mb-1">
                Device Distribution
              </h3>
              <p className="text-sm text-gray-400">Sessions by platform</p>
            </div>
            <div className="space-y-6">
              {deviceData.map((device) => (
                <div key={device.platform}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{device.platform}</span>
                    <span className="text-white text-sm">
                      {device.sessions.toLocaleString()} ({device.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        device.platform === 'iOS'
                          ? 'bg-gradient-to-r from-synheart-pink to-pink-400'
                          : 'bg-gradient-to-r from-synheart-blue to-blue-400'
                      }`}
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* SWIP Score Trend */}
          <SwipScoreTrend 
            score={60.0}
            sessions={1}
            date="10/19/2025"
          />
          
          {/* Emotion Distribution */}
          <EmotionDistribution 
            emotions={[
              { emotion: 'Calm', count: 1, percentage: 100.0 }
            ]}
          />
          
          {/* Recent Sessions Table */}
          <RecentSessionsTable 
            sessions={[
              {
                app: 'E2E Test App',
                sessionId: 'test-ses••••••••sion-123',
                swipScore: 60.0,
                emotion: 'Calm',
                created: '10/20/2025, 1:43:00 PM'
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}
