/**
 * App Sessions Content Component
 * 
 * Displays all sessions for a specific app with filtering and detailed views
 */

'use client';

import { useState } from 'react';
import { Badge } from './ui/Badge';
import Link from 'next/link';

interface Session {
  id: string;
  swipScore: number | null;
  stressRate: number | null;
  emotion: string | null;
  duration: number | null;
  createdAt: string;
  hrvMetrics: any;
  wearable: string | null;
  os: string | null;
}

interface AppSessionsContentProps {
  data: {
    app: {
      id: string;
      name: string;
      category: string | null;
      owner: {
        id: string;
        name: string | null;
        email: string;
      };
    };
    sessions: Session[];
    stats: {
      totalSessions: number;
      avgSwipScore: number;
      avgStressRate: number;
      avgDuration: number;
      avgHrv: number;
      emotionCounts: Record<string, number>;
    };
  };
}

export function AppSessionsContent({ data }: AppSessionsContentProps) {
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { app, sessions, stats } = data;

  // Valid emotions - map database emotions to display names
  const emotionDisplayMap: Record<string, string> = {
    'stressed': 'Stressed',
    'neutral': 'Neutral',
    'happy': 'Amused', // Map 'happy' to 'Amused' for display
  };
  
  const normalizeEmotion = (emotion: string | null): string => {
    if (!emotion) return 'Unknown';
    return emotionDisplayMap[emotion.toLowerCase()] || 'Unknown';
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesEmotion = emotionFilter === 'all' || session.emotion?.toLowerCase() === emotionFilter.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.emotion?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEmotion && matchesSearch;
  });

  const getEmotionColor = (emotion: string | null) => {
    const normalized = normalizeEmotion(emotion);
    if (normalized === 'Stressed') return 'bg-red-500';
    if (normalized === 'Amused') return 'bg-green-500'; // 'happy' displayed as 'Amused'
    if (normalized === 'Neutral') return 'bg-blue-500';
    return 'bg-gray-500'; // Unknown
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 85) return 'text-purple-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-pink-400';
    return 'text-red-400';
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link 
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Leaderboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              SWIP
            </span>
            <span className="text-white">
              {" "}{app.name} Sessions
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant="default">{app.category || 'Other'}</Badge>
            <span className="text-gray-400">
              Owner: {app.owner.name || app.owner.email}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards - Better alignment and spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sessions */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm p-6 hover:border-purple-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs font-medium">Total Sessions</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalSessions.toLocaleString()}</p>
          </div>
        </div>

        {/* Avg SWIP Score */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm p-6 hover:border-purple-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs font-medium">Avg SWIP Score</p>
            </div>
            <p className="text-3xl font-bold text-purple-400">{stats.avgSwipScore.toFixed(1)}</p>
          </div>
        </div>

        {/* Avg HRV */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm p-6 hover:border-green-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs font-medium">Avg HRV</p>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.avgHrv > 0 ? stats.avgHrv.toFixed(1) : 'N/A'} {stats.avgHrv > 0 && <span className="text-sm text-gray-400">ms</span>}</p>
          </div>
        </div>

        {/* Avg Stress Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm p-6 hover:border-pink-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs font-medium">Avg Stress Rate</p>
            </div>
            <p className="text-3xl font-bold text-pink-400">{stats.avgStressRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Avg Duration */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm p-6 hover:border-blue-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs font-medium">Avg Duration</p>
            </div>
            <p className="text-3xl font-bold text-blue-400">{formatDuration(stats.avgDuration)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search sessions by ID or emotion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <select
          value={emotionFilter}
          onChange={(e) => setEmotionFilter(e.target.value)}
          className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="all">All Emotions</option>
          {Object.keys(stats.emotionCounts)
            .filter(emotion => ['Stressed', 'Amused', 'Neutral', 'Unknown'].includes(emotion))
            .map((emotion) => (
              <option key={emotion} value={emotion.toLowerCase()}>
                {emotion}
              </option>
            ))}
        </select>
        <div className="text-gray-400 text-sm">
          Showing {filteredSessions.length} of {stats.totalSessions}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-semibold">Session ID</th>
                <th className="text-left p-4 text-gray-400 font-semibold">SWIP Score</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Emotion</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Stress Rate</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Duration</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    No sessions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm text-gray-400">{session.id.slice(0, 8)}...</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${getScoreColor(session.swipScore)}`}>
                          {session.swipScore?.toFixed(1) || 'N/A'}
                        </span>
                        {session.swipScore && (
                          <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${Math.min(session.swipScore, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50">
                        <div className={`w-2 h-2 rounded-full ${getEmotionColor(session.emotion)}`} />
                        <span className="text-white text-sm font-medium">{normalizeEmotion(session.emotion)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white">{session.stressRate?.toFixed(1) || 'N/A'}%</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{formatDuration(session.duration)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400 text-sm">{formatDate(session.createdAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination hint */}
      {sessions.length >= 1000 && (
        <div className="text-center p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
          <p className="text-yellow-400">
            Showing the most recent 1,000 sessions. Older sessions are archived.
          </p>
        </div>
      )}
    </div>
  );
}

