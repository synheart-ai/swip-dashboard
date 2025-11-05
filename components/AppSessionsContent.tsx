/**
 * App Sessions Content Component
 * 
 * Displays all sessions for a specific app using the modern SessionTable component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/Badge';
import Link from 'next/link';
import { SessionTable, SessionData } from './SessionTable';
import { StatsCard } from './ui/StatsCard';

// Using SessionData interface from SessionTable
// Extending with avgBpm and avgHrv which are calculated from biosignals

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
      } | null;  // Nullable for apps created by SWIP App
    };
    sessions: SessionData[];
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { app, sessions, stats } = data;
  
  const handleSessionClick = (session: SessionData) => {
    router.push(`/sessions/${session.sessionId}`);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = searchQuery === '' || 
      session.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.emotion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.appName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  
  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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
            {app.owner ? (
              <span className="text-gray-400">
                Owner: {app.owner.name || app.owner.email}
              </span>
            ) : (
              <span className="text-gray-400">
                Created by SWIP App
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions.toLocaleString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="Avg SWIP Score"
          value={stats.avgSwipScore.toFixed(1)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatsCard
          title="Avg Stress Rate"
          value={`${stats.avgStressRate.toFixed(1)}%`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Avg Duration"
          value={formatDuration(stats.avgDuration)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search sessions by ID, emotion, or app name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="text-gray-400 text-sm">
          {filteredSessions.length} of {stats.totalSessions} sessions
        </div>
      </div>

      {/* Sessions Table */}
      <SessionTable
        sessions={filteredSessions}
        onSessionClick={handleSessionClick}
      />

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

