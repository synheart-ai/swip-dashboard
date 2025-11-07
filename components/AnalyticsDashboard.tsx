/**
 * Analytics Dashboard Component
 *
 * Main dashboard component with all P1 features
 */

'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from './ui/StatsCard';
import { DashboardFilters, FilterState } from './DashboardFilters';
import { TrendLineChart } from './charts/TrendLineChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { SessionTable, SessionData } from './SessionTable';
import { P1Metrics } from '@/lib/analytics';

export function AnalyticsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'thisWeek',
    partOfDay: 'all',
    wearables: [],
    os: [],
    categories: [],
  });

  const [metrics, setMetrics] = useState<P1Metrics | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch metrics
      const metricsResponse = await fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch sessions
      const sessionsResponse = await fetch('/api/analytics/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });
      const sessionsData = await sessionsResponse.json();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-synheart-pink" />
          <p className="text-gray-400 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <DashboardFilters filters={filters} onChange={setFilters} showAdvanced={true} />

      {/* User Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">User Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Users"
            value={formatNumber(metrics.totalUsers)}
            icon="users"
            color="pink"
            trend={{
              value: 12,
              label: 'Growth',
              positive: true,
            }}
          />
          <StatsCard
            title="New Users"
            value={formatNumber(metrics.newUsers)}
            icon="users"
            color="blue"
            trend={{
              value: 8,
              label: 'This Period',
              positive: true,
            }}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendLineChart
            data={metrics.usersTrend}
            title="Active Users Trend"
            color="#fe22b1"
            yAxisLabel="Users"
            formatValue={(v) => v.toFixed(0)}
          />
          <TrendLineChart
            data={metrics.newUsersTrend}
            title="New Users Trend"
            color="#60a5fa"
            yAxisLabel="New Users"
            formatValue={(v) => v.toFixed(0)}
          />
        </div>
      </div>

      {/* SWIP Score Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">SWIP Score Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Average SWIP Score"
            value={metrics.avgSwipScore.toFixed(1)}
            icon="chart"
            color="purple"
            trend={{
              value: 5,
              label: 'Improvement',
              positive: true,
            }}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendLineChart
            data={metrics.swipScoreTrend}
            title="SWIP Score Trend"
            color="#a855f7"
            yAxisLabel="SWIP Score"
            formatValue={(v) => v.toFixed(1)}
          />
          <HeatmapChart data={metrics.swipScoreHeatmap} title="SWIP Score per Day/Hour" />
        </div>
      </div>

      {/* Session Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Session Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <StatsCard
            title="Total Sessions"
            value={formatNumber(metrics.totalSessions)}
            icon="chart"
            color="blue"
            trend={{
              value: 15,
              label: 'Growth',
              positive: true,
            }}
          />
          <StatsCard
            title="Avg Sessions/Day"
            value={metrics.avgSessionsPerDay.toFixed(1)}
            icon="clock"
            color="purple"
          />
          <StatsCard
            title="Avg Sessions/User"
            value={metrics.avgSessionsPerUser.toFixed(1)}
            icon="users"
            color="pink"
          />
          <StatsCard
            title="Avg Sessions/User/Day"
            value={metrics.avgSessionsPerUserPerDay.toFixed(2)}
            icon="chart"
            color="green"
          />
          <StatsCard
            title="Avg Duration"
            value={formatDuration(metrics.avgSessionDuration)}
            icon="clock"
            color="blue"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendLineChart
            data={metrics.sessionsTrend}
            title="Total Sessions Trend"
            color="#60a5fa"
            yAxisLabel="Sessions"
            formatValue={(v) => v.toFixed(0)}
          />
          <TrendLineChart
            data={metrics.durationTrend}
            title="Average Session Duration Trend"
            color="#10b981"
            yAxisLabel="Duration (seconds)"
            formatValue={(v) => `${Math.floor(v / 60)}m ${Math.floor(v % 60)}s`}
          />
        </div>
      </div>

      {/* Stress & HRV Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Stress & HRV Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Average Stress Rate"
            value={`${metrics.avgStressRate.toFixed(1)}%`}
            icon="chart"
            color="pink"
            trend={{
              value: 3,
              label: 'Decrease',
              positive: false,
            }}
          />
          <StatsCard
            title="Average HRV"
            value={metrics.avgHrv.toFixed(1)}
            icon="chart"
            color="green"
            trend={{
              value: 7,
              label: 'Improvement',
              positive: true,
            }}
          />
        </div>
        <TrendLineChart
          data={metrics.stressRateTrend}
          title="Average Stress Rate Trend"
          color="#f43f5e"
          yAxisLabel="Stress Rate (%)"
          formatValue={(v) => `${v.toFixed(1)}%`}
        />
      </div>

      {/* Sessions Table */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Sessions</h2>
        <SessionTable sessions={sessions} loading={loading} />
      </div>
    </div>
  );
}

