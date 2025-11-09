/**
 * Recent Sessions Table Component
 *
 * Displays recent sessions with app, session ID, SWIP score, emotion, and created date
 */

import { Badge } from './ui/Badge';

interface SessionData {
  app: string;
  sessionId: string;
  swipScore: number | null;
  emotion: string | null;
  created: string;
}

interface RecentSessionsTableProps {
  sessions: SessionData[];
}

const normalizeEmotion = (emotion: string | null): string => {
  if (!emotion) return 'Unknown';
  const normalized = emotion.toLowerCase();
  if (normalized === 'calm') return 'Calm';
  if (normalized === 'focused') return 'Focused';
  if (normalized === 'stressed') return 'Stressed';
  if (normalized === 'neutral') return 'Neutral';
  if (normalized === 'happy') return 'Amused';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getEmotionBadgeClass = (emotion: string | null) => {
  if (!emotion) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const e = emotion.toLowerCase();
  if (e === 'calm') return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (e === 'focused') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (e === 'stressed') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  if (e === 'neutral') return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  if (e === 'happy') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

export function RecentSessionsTable({ sessions }: RecentSessionsTableProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-pink-400 mb-1">
          Recent Sessions
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                App
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                Session ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                SWIP Score
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                Emotion
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, index) => (
              <tr 
                key={index}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-white text-sm">{session.app}</span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-gray-400 text-sm font-mono">
                    {session.sessionId}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="warning"
                    size="sm"
                    className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  >
                    {session.swipScore != null ? session.swipScore.toFixed(1) : '—'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getEmotionBadgeClass(session.emotion)}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {normalizeEmotion(session.emotion)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-400 text-sm">{session.created}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
