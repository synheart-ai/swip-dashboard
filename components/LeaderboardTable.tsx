/**
 * Leaderboard Table Component
 *
 * Displays leaderboard entries in a table format
 */

'use client';

import { Badge } from './ui/Badge';

interface LeaderboardEntry {
  rank: number;
  appName: string;
  category?: string;
  developer?: string;
  appSwipScore: number;
  avgStressRate?: number;
  hrvStatus?: string;
  avgHeartRate?: number;
  problems?: string[];
  sessions: number;
  trend: 'up' | 'down' | 'neutral';
}

interface DeveloperData {
  name: string;
  email: string;
  avgSwipHrv: number;
  totalApps: number;
  avgHrv: string;
  sessions: number;
  trend: 'up' | 'down';
}

interface CategoryData {
  category: string;
  avgSwipScore: number;
  avgStressRate: number;
  totalApps: number;
  totalSessions: number;
  trend: 'up' | 'down';
}

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  showDevelopers?: boolean;
  showCategories?: boolean;
  developerData?: DeveloperData[];
  categoryData?: CategoryData[];
}

export function LeaderboardTable({ entries, showDevelopers = false, showCategories = false, developerData = [], categoryData = [] }: LeaderboardTableProps) {
  if (showCategories) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Avg SWIP Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Avg Stress Rate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Total Apps</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Total Sessions</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Trend</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No category data available
                  </td>
                </tr>
              ) : (
                categoryData.map((cat, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-white font-medium text-lg">{cat.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-xl font-bold text-synheart-pink">{cat.avgSwipScore.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-lg font-medium">{cat.avgStressRate.toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info" size="sm">{cat.totalApps}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{cat.totalSessions.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {cat.trend === 'up' ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (showDevelopers) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Developers</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Avg SWIP/HRV</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Total Apps</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Average HRV</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Sessions</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Trend</th>
              </tr>
            </thead>
            <tbody>
              {developerData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No developer data available
                  </td>
                </tr>
              ) : (
                developerData.map((dev, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-white font-medium">{dev.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-lg font-semibold">{dev.avgSwipHrv}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={dev.totalApps >= 5 ? 'success' : dev.totalApps >= 2 ? 'info' : 'warning'}
                      dot
                    >
                      {dev.totalApps}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white">{dev.avgHrv}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{dev.sessions.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {dev.trend === 'up' ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Original apps leaderboard view (P1 spec: App name, Category, Developer, Average SWIP Score, Average Stress Rate, Total Session)
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">App Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Developer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Average SWIP Score</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Average Stress Rate</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Total Sessions</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-synheart-pink">Trend</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No data available yet. Start submitting sessions to see rankings!
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.rank}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800">
                      <span className="text-synheart-pink font-bold">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium text-lg">{entry.appName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="default">{entry.category || 'Other'}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{entry.developer || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {entry.appSwipScore.toFixed(1)}
                      </span>
                      {entry.appSwipScore >= 70 && (
                        <Badge variant="success" size="sm" dot>
                          Optimal
                        </Badge>
                      )}
                      {entry.appSwipScore >= 60 && entry.appSwipScore < 70 && (
                        <Badge variant="info" size="sm" dot>
                          Good
                        </Badge>
                      )}
                      {entry.appSwipScore < 60 && (
                        <Badge variant="warning" size="sm" dot>
                          Moderate
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-lg font-medium">
                      {(entry.avgStressRate || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium text-lg">{entry.sessions.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {entry.trend === 'up' ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : entry.trend === 'down' ? (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
