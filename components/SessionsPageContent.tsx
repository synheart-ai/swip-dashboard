/**
 * Sessions Page Content Component
 *
 * Main content for sessions page with filters and detailed session view
 */

'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from './ui/StatsCard';
import { DashboardFilters, FilterState } from './DashboardFilters';
import { SessionTable, SessionData } from './SessionTable';
import { SessionDetailPanel } from './SessionDetailPanel';
import { BioSignalsChart } from './charts/BioSignalsChart';
import { Modal } from './ui/Modal';

export function SessionsPageContent() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'thisWeek',
    partOfDay: 'all',
    wearables: [],
    os: [],
    categories: [],
  });

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgDuration: 0,
    avgSwipScore: 0,
    avgStressRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Fetch sessions
      const sessionsResponse = await fetch('/api/analytics/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });
      
      if (!sessionsResponse.ok) {
        const errorData = await sessionsResponse.json().catch(() => ({ error: sessionsResponse.statusText }));
        const errorMessage = `Failed to fetch sessions: ${errorData.error || sessionsResponse.statusText} (${sessionsResponse.status})`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const sessionsData = await sessionsResponse.json();
      
      // Ensure sessionsData is an array
      const sessionsArray = Array.isArray(sessionsData) ? sessionsData : [];
      
      // Check for error response
      if (!Array.isArray(sessionsData) && sessionsData.error) {
        console.error('API error:', sessionsData.error);
        setSessions([]);
        setStats({
          totalSessions: 0,
          avgDuration: 0,
          avgSwipScore: 0,
          avgStressRate: 0,
        });
        return;
      }
      
      setSessions(sessionsArray);

      // Calculate stats from sessions
      const totalSessions = sessionsArray.length;
      
      // Average Duration
      const avgDuration = totalSessions > 0
        ? sessionsArray.reduce((sum: number, s: SessionData) => sum + (s.duration || 0), 0) / totalSessions
        : 0;
      
      // Average SWIP Score  
      const avgSwipScore = totalSessions > 0
        ? sessionsArray.reduce((sum: number, s: SessionData) => sum + (s.swipScore || 0), 0) / totalSessions
        : 0;
      
      // Stress Rate = (COUNT sessions WHERE emotion = "stressed") / COUNT(all sessions)
      const stressedCount = sessionsArray.filter((s: SessionData) => 
        s.emotion?.toLowerCase() === 'stressed'
      ).length;
      const avgStressRate = totalSessions > 0 ? (stressedCount / totalSessions) * 100 : 0;

      setStats({
        totalSessions,
        avgDuration,
        avgSwipScore,
        avgStressRate,
      });
    } catch (error) {
      console.error('Error fetching sessions data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions data';
      setError(errorMessage);
      // Set empty state on error
      setSessions([]);
      setStats({
        totalSessions: 0,
        avgDuration: 0,
        avgSwipScore: 0,
        avgStressRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Compact Modern Header with Inline Controls */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sessions</h1>
          <p className="text-gray-400">Transparent, anonymized session logs.</p>
        </div>
        
        {/* Compact Inline Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm hover:border-purple-500/50 focus:outline-none focus:border-purple-500 transition-all cursor-pointer backdrop-blur-sm"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="allTime">All Time</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-gray-400 text-sm hover:text-white hover:border-purple-500/50 transition-all backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>More Filters</span>
            {(filters.wearables.length + filters.os.length > 0) && (
              <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-semibold">
                {filters.wearables.length + filters.os.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 backdrop-blur-sm p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-400 font-medium">Error loading sessions</p>
            <p className="text-red-300/80 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="px-3 py-1.5 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Modern Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sessions */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-purple-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-white">{stats.totalSessions.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            Active sessions in period
          </div>
        </div>

        {/* Average SWIP Score */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-blue-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Average SWIP Score</p>
              <p className="text-3xl font-bold text-white">{stats.avgSwipScore.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            Performance metric
          </div>
        </div>

        {/* Average Duration */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-pink-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Average Duration</p>
              <p className="text-3xl font-bold text-white">{formatDuration(stats.avgDuration)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            Time per session
          </div>
        </div>

        {/* Average Stress Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-red-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Stress Rate</p>
              <p className="text-3xl font-bold text-white">{stats.avgStressRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            Stressed sessions
          </div>
        </div>
      </div>

      {/* Modern Sessions Table */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
        {/* Table Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
            <span className="ml-2 text-gray-400 text-sm">({sessions.length})</span>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="p-6">
          <SessionTable 
            sessions={sessions} 
            loading={loading} 
            onSessionClick={setSelectedSession}
          />
        </div>
      </div>

      {/* Stunning Session Detail Panel */}
      <SessionDetailPanel 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)} 
      />
    </div>
  );
}

