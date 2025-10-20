"use client";

import { useState, useEffect } from "react";

interface SessionData {
  id: string;
  sessionId: string;
  swipScore: number | null;
  emotion: string | null;
  createdAt: string;
  app: {
    name: string;
  };
}

interface SessionsChartProps {
  sessions: SessionData[];
}

export default function SessionsChart({ sessions }: SessionsChartProps) {
  const [selectedApp, setSelectedApp] = useState<string>("all");
  
  // Get unique apps
  const apps = Array.from(new Set(sessions.map(s => s.app.name)));
  
  // Filter sessions by selected app
  const filteredSessions = selectedApp === "all" 
    ? sessions 
    : sessions.filter(s => s.app.name === selectedApp);
  
  // Calculate average SWIP score by day
  const dailyAverages = filteredSessions.reduce((acc, session) => {
    if (!session.swipScore) return acc;
    
    const date = new Date(session.createdAt).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, count: 0 };
    }
    acc[date].total += session.swipScore;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
  
  const chartData = Object.entries(dailyAverages)
    .map(([date, data]) => ({
      date,
      avgScore: data.total / data.count,
      sessions: data.count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days
  
  // Calculate emotion distribution
  const emotionCounts = filteredSessions.reduce((acc, session) => {
    const emotion = session.emotion || "unknown";
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const emotionData = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: (count / filteredSessions.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      {/* App Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-synheart-pink">Filter by app:</label>
        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="synheart-input text-sm"
        >
          <option value="all">All Apps</option>
          {apps.map(app => (
            <option key={app} value={app}>{app}</option>
          ))}
        </select>
      </div>

      {/* SWIP Score Trend */}
      <div className="synheart-card p-8">
        <h3 className="text-xl font-semibold mb-6 text-synheart-blue">SWIP Score Trend (Last 7 Days)</h3>
        {chartData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data available</p>
        ) : (
          <div className="space-y-4">
            {chartData.map((data) => (
              <div key={data.date} className="flex items-center gap-6">
                <div className="w-24 text-sm text-gray-400">
                  {new Date(data.date).toLocaleDateString()}
                </div>
                <div className="flex-1 bg-synheart-light-gray rounded-full h-6 relative overflow-hidden">
                  <div
                    className="synheart-gradient h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${Math.min(data.avgScore, 100)}%` }}
                  >
                    <span className="text-xs font-bold text-white">
                      {data.avgScore.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-400 text-right">
                  {data.sessions} sessions
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emotion Distribution */}
      <div className="synheart-card p-8">
        <h3 className="text-xl font-semibold mb-6 text-synheart-pink">Emotion Distribution</h3>
        {emotionData.length === 0 ? (
          <p className="text-gray-400 text-sm">No emotion data available</p>
        ) : (
          <div className="space-y-4">
            {emotionData.map((data) => (
              <div key={data.emotion} className="flex items-center gap-6">
                <div className="w-24 text-sm font-medium capitalize text-gray-300">
                  {data.emotion}
                </div>
                <div className="flex-1 bg-synheart-light-gray rounded-full h-4 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-synheart-pink to-synheart-blue h-4 rounded-full transition-all duration-500"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <div className="w-24 text-sm text-gray-400 text-right">
                  {data.count} ({data.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
