/**
 * Recent Sessions Table Component
 *
 * Displays recent sessions with app, session ID, SWIP score, emotion, and created date
 */

import { Badge } from './ui/Badge';

interface SessionData {
  app: string;
  sessionId: string;
  swipScore: number;
  emotion: string;
  created: string;
}

interface RecentSessionsTableProps {
  sessions: SessionData[];
}

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
                    {session.swipScore.toFixed(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge 
                    variant="info" 
                    size="sm"
                    className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                  >
                    {session.emotion}
                  </Badge>
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
