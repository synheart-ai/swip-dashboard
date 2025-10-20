"use client";

import { useState, useEffect } from "react";
import SessionsChart from "../../components/SessionsChart";

interface SwipSession {
  id: string;
  sessionId: string;
  swipScore: number | null;
  emotion: string | null;
  createdAt: string;
  app: {
    name: string;
  };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SwipSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/public/swipsessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Sessions</h1>
      <p className="text-sm text-gray-600">Transparent, anonymized session logs.</p>
      
      {/* Data Visualization */}
      {!isLoading && sessions.length > 0 && (
        <SessionsChart sessions={sessions} />
      )}

      {/* Sessions Table */}
      <div className="synheart-table">
        <div className="px-6 py-3 border-b" style={{borderColor: "var(--synheart-light-gray)"}}>
          <h2 className="font-medium text-synheart-pink">Recent Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-3">App</th>
                <th className="text-left p-3">Session ID</th>
                <th className="text-left p-3">SWIP Score</th>
                <th className="text-left p-3">Emotion</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr key="loading">
                  <td colSpan={5} className="p-4 text-gray-400 text-center">
                    Loading sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr key="empty">
                  <td colSpan={5} className="p-4 text-gray-400 text-center">
                    No sessions yet.
                  </td>
                </tr>
              ) : (
                sessions.slice(0, 50).map((session) => (
                  <tr key={session.id}>
                    <td className="p-3">{session.app?.name ?? "-"}</td>
                    <td className="p-3 font-mono text-xs">
                      {session.sessionId.slice(0, 8)}••••••••{session.sessionId.slice(-8)}
                    </td>
                    <td className="p-3">
                      {session.swipScore ? (
                        <span className={`text-xs font-medium ${
                          session.swipScore >= 70 
                            ? "synheart-badge-success"
                            : session.swipScore >= 50
                            ? "synheart-badge-warning"
                            : "synheart-badge-error"
                        } synheart-badge`}>
                          {session.swipScore.toFixed(1)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      {session.emotion ? (
                        <span className="synheart-badge synheart-badge-info capitalize">
                          {session.emotion}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 text-gray-300">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
