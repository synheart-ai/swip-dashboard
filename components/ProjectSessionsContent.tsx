/**
 * Project Sessions Content Component
 * 
 * Main content area for sessions explorer with filtering, sorting, and session management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ProjectSession {
  id: string;
  createdAt: string;
  notes: string | null;
  tags: string[];
  activityType: string | null;
  userReportedMood: string | null;
  wearable: {
    id: string;
    name: string;
    deviceType: string;
  } | null;
  appSession: {
    avgSwipScore: number | null;
    startedAt: string;
    endedAt: string | null;
    duration: number | null;
    dominantEmotion: string | null;
  };
}

interface ProjectSessionsContentProps {
  projectId: string;
  projectName: string;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const getScoreColor = (score: number | null): string => {
  if (!score) return 'text-gray-400';
  if (score >= 85) return 'text-purple-400';
  if (score >= 70) return 'text-blue-400';
  if (score >= 60) return 'text-pink-400';
  return 'text-red-400';
};

const getEmotionColor = (emotion: string | null): string => {
  if (!emotion) return 'text-gray-400';
  const emotionLower = emotion.toLowerCase();
  if (emotionLower.includes('calm') || emotionLower.includes('happy')) return 'text-green-400';
  if (emotionLower.includes('stress') || emotionLower.includes('anxious')) return 'text-red-400';
  if (emotionLower.includes('focused')) return 'text-blue-400';
  return 'text-gray-400';
};

export function ProjectSessionsContent({ projectId, projectName }: ProjectSessionsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [sessions, setSessions] = useState<ProjectSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgSwipScore: null as number | null,
    emotionCounts: {} as Record<string, number>,
    totalSessions: 0,
  });
  
  // Filters from URL params
  const [wearableFilter, setWearableFilter] = useState(searchParams.get('wearableId') || 'all');
  const [emotionFilter, setEmotionFilter] = useState(searchParams.get('emotion') || 'all');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Get available wearables for filter
  const [wearables, setWearables] = useState<Array<{ id: string; name: string }>>([]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (wearableFilter !== 'all') {
        params.append('wearableId', wearableFilter);
      }
      if (emotionFilter !== 'all') {
        params.append('emotion', emotionFilter);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/projects/${projectId}/sessions?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      let filtered = data.data || [];
      
      // Client-side search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter((s: ProjectSession) => {
          const searchLower = searchQuery.toLowerCase();
          return (
            s.wearable?.name.toLowerCase().includes(searchLower) ||
            s.appSession.dominantEmotion?.toLowerCase().includes(searchLower) ||
            s.activityType?.toLowerCase().includes(searchLower) ||
            s.notes?.toLowerCase().includes(searchLower)
          );
        });
      }

      setSessions(filtered);
      setStats({
        avgSwipScore: data.stats?.avgSwipScore || null,
        emotionCounts: data.stats?.emotionCounts || {},
        totalSessions: data.pagination?.total || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, wearableFilter, emotionFilter, startDate, endDate, searchQuery]);

  const fetchWearables = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/wearables`);
      const data = await response.json();
      if (response.ok && data.data) {
        setWearables(data.data.map((w: any) => ({ id: w.id, name: w.name })));
      }
    } catch (err) {
      console.error('Error fetching wearables:', err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWearables();
  }, [fetchWearables]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (filterType === 'wearable') {
      setWearableFilter(value);
      if (value === 'all') {
        params.delete('wearableId');
      } else {
        params.set('wearableId', value);
      }
    } else if (filterType === 'emotion') {
      setEmotionFilter(value);
      if (value === 'all') {
        params.delete('emotion');
      } else {
        params.set('emotion', value);
      }
    } else if (filterType === 'startDate') {
      setStartDate(value);
      if (value) {
        params.set('startDate', value);
      } else {
        params.delete('startDate');
      }
    } else if (filterType === 'endDate') {
      setEndDate(value);
      if (value) {
        params.set('endDate', value);
      } else {
        params.delete('endDate');
      }
    }
    
    router.push(`/projects/${projectId}/sessions?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setWearableFilter('all');
    setEmotionFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    router.push(`/projects/${projectId}/sessions`);
  };

  const emotions = Object.keys(stats.emotionCounts);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/projects" className="hover:text-white transition-colors">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${projectId}`} className="hover:text-white transition-colors">
            {projectName}
          </Link>
          <span>/</span>
          <span className="text-white">Sessions</span>
        </div>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Sessions Explorer</h1>
            <p className="text-gray-400">Browse and analyze sessions for {projectName}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {stats.avgSwipScore !== null ? stats.avgSwipScore.toFixed(1) : '—'}
            </div>
            <div className="text-sm text-gray-400">Avg SWIP Score</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.totalSessions}</div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">{sessions.length}</div>
            <div className="text-sm text-gray-400">Filtered Results</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Wearable Filter */}
            <div>
              <select
                value={wearableFilter}
                onChange={(e) => handleFilterChange('wearable', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
              >
                <option value="all">All Wearables</option>
                {wearables.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Emotion Filter */}
            <div>
              <select
                value={emotionFilter}
                onChange={(e) => handleFilterChange('emotion', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
              >
                <option value="all">All Emotions</option>
                {emotions.map(emotion => (
                  <option key={emotion} value={emotion}>{emotion}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading sessions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchSessions}>
            Try Again
          </Button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No sessions found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || wearableFilter !== 'all' || emotionFilter !== 'all' || startDate || endDate
              ? 'Try adjusting your filters'
              : 'Sessions will appear here once data is collected from wearables'}
          </p>
          {(searchQuery || wearableFilter !== 'all' || emotionFilter !== 'all' || startDate || endDate) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Wearable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    SWIP Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Emotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{formatDate(session.appSession.startedAt)}</div>
                      <div className="text-xs text-gray-500">{formatTimeAgo(session.appSession.startedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {session.wearable?.name || 'Unknown Device'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.wearable?.deviceType || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDuration(session.appSession.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${getScoreColor(session.appSession.avgSwipScore)}`}>
                        {session.appSession.avgSwipScore !== null
                          ? session.appSession.avgSwipScore.toFixed(1)
                          : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm capitalize ${getEmotionColor(session.appSession.dominantEmotion)}`}>
                        {session.appSession.dominantEmotion || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {session.activityType || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/projects/${projectId}/sessions/${session.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


