/**
 * Sessions Page
 *
 * Displays session analytics with stats, regional activity, and device distribution
 */

import { StatsCard } from '@/components/ui/StatsCard';
import { SessionsContent } from '@/components/SessionsContent';
import { AuthWrapper } from '@/components/AuthWrapper';

export default async function SessionsPage() {
  return (
    <AuthWrapper>
      <SessionsPageContent />
    </AuthWrapper>
  );
}

async function SessionsPageContent() {
  // In a real app, fetch this data from your API
  const stats = {
    activeSessions: 3257,
    activeSessionsChange: 12,
    activeSessionsChangeType: 'increase' as const,
    averageDuration: '1m 42s',
    averageDurationChange: 8.3,
    averageDurationChangeType: 'increase' as const,
    totalToday: 107600,
    totalTodayChange: -6,
    totalTodayChangeType: 'decrease' as const,
    completionRate: 68.4,
    completionRateChange: 8.3,
    completionRateChangeType: 'increase' as const,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sessions</h1>
        <p className="text-gray-400 text-sm">
          Transparent, anonymized session logs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Sessions"
          value={stats.activeSessions.toLocaleString()}
          trend={{
            value: stats.activeSessionsChange,
            label: 'From last hour',
            direction: stats.activeSessionsChangeType,
          }}
          icon="users"
          color="pink"
        />
        <StatsCard
          title="Average Duration"
          value={stats.averageDuration}
          trend={{
            value: stats.averageDurationChange,
            label: 'Vs Yesterday',
            direction: stats.averageDurationChangeType,
          }}
          icon="clock"
          color="purple"
        />
        <StatsCard
          title="Total Today"
          value={`${(stats.totalToday / 1000).toFixed(1)}K`}
          trend={{
            value: Math.abs(stats.totalTodayChange),
            label: 'New record',
            direction: stats.totalTodayChangeType,
          }}
          icon="chart"
          color="pink"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          trend={{
            value: stats.completionRateChange,
            label: 'Improvement',
            direction: stats.completionRateChangeType,
          }}
          icon="check"
          color="blue"
        />
      </div>

      {/* Tabs and Content */}
      <SessionsContent />
    </div>
  );
}
