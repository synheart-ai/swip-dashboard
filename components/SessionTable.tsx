/**
 * Session Table Component
 *
 * Comprehensive table displaying session details with all P1 required columns
 */

'use client';

import { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

export interface SessionData {
  sessionId: string;
  appName: string;
  wearable: string | null;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null; // in seconds
  avgBpm: number | null;
  avgHrv: number | null;
  emotion: string | null;
  swipScore: number | null;
  stressRate: number | null;
  os: string | null;
  category?: string | null;
}

interface SessionTableProps {
  sessions: SessionData[];
  loading?: boolean;
  onSessionClick?: (session: SessionData) => void;
}

const ROW_HEIGHT = 72; // Approximate height of each row

const formatDuration = (seconds: number | null) => {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatDate = (date: Date | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Valid emotions - map database emotions to display names
const emotionDisplayMap: Record<string, string> = {
  stressed: 'Stressed',
  neutral: 'Neutral',
  happy: 'Amused', // Map 'happy' to 'Amused' for display
};

const normalizeEmotion = (emotion: string | null): string => {
  if (!emotion) return 'Unknown';
  return emotionDisplayMap[emotion.toLowerCase()] || 'Unknown';
};

const getEmotionBadgeClass = (emotion: string | null) => {
  if (!emotion) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const e = emotion.toLowerCase();
  if (e === 'stressed') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  if (e === 'neutral') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (e === 'happy') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

const getScoreTone = (score: number | null) => {
  if (!score) return 'text-gray-400';
  if (score >= 70) return 'text-green-500';
  if (score >= 60) return 'text-yellow-400';
  return 'text-orange-500';
};

export const SessionTable = memo(function SessionTable({ sessions, loading = false, onSessionClick }: SessionTableProps) {
  const sessionsArray = useMemo(() => (Array.isArray(sessions) ? sessions : []), [sessions]);
  const listHeight = useMemo(() => {
    if (sessionsArray.length === 0) return 0;
    const visibleRows = Math.min(sessionsArray.length, 12);
    return visibleRows * ROW_HEIGHT;
  }, [sessionsArray]);

  if (loading) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-synheart-pink" />
        <p className="text-gray-400 mt-4">Loading sessions...</p>
      </div>
    );
  }

  if (sessionsArray.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-400 text-lg">No sessions found</p>
        <p className="text-gray-500 text-sm mt-2">Sessions will appear here once data is submitted</p>
      </div>
    );
  }

  const renderRow = useCallback(({ index, style }: ListChildComponentProps) => {
    const session = sessionsArray[index];
    return (
      <div
        key={session.sessionId}
        onClick={() => onSessionClick?.(session)}
        style={{ ...style, width: '100%' }}
        className="grid grid-cols-[1.6fr,1fr,1.4fr,1.2fr,1fr] px-4 py-3 border-b border-gray-800/60 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="min-w-0">
          <span className="text-white font-medium block truncate">{session.appName}</span>
          {session.category && <span className="text-xs text-gray-500 truncate">{session.category}</span>}
        </div>
        <div>
          <span className="text-white font-semibold block">{session.swipScore?.toFixed(1) || 'N/A'}</span>
          <span className={`text-xs ${getScoreTone(session.swipScore)}`}>
            {session.swipScore ? `${session.swipScore.toFixed(0)} pts` : 'No score'}
          </span>
        </div>
        <div className="min-w-0">
          <code className="text-gray-400 text-xs font-mono block truncate">
            {session.sessionId.substring(0, 12)}...
          </code>
          <span className="text-xs text-gray-500">{formatDuration(session.duration)}</span>
        </div>
        <div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getEmotionBadgeClass(session.emotion)}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {normalizeEmotion(session.emotion)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 text-sm block">{formatDate(session.startedAt)}</span>
        </div>
      </div>
    );
  }, [sessionsArray, onSessionClick]);

  return (
    <div className="border border-gray-800/50 rounded-xl overflow-hidden bg-gray-900/30">
      <div className="grid grid-cols-[1.6fr,1fr,1.4fr,1.2fr,1fr] px-4 py-3 border-b border-gray-800/60 text-sm font-semibold text-purple-400">
        <span>App</span>
        <span>Avg SWIP Score</span>
        <span>Session</span>
        <span>Emotion</span>
        <span className="text-right">Started</span>
      </div>
      <List height={listHeight} itemCount={sessionsArray.length} itemSize={ROW_HEIGHT} width="100%">
        {renderRow}
      </List>
    </div>
  );
});

