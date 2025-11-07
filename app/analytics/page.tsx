/**
 * Analytics Dashboard Page
 *
 * Comprehensive P1 analytics dashboard with all metrics, charts, and filters
 */

import { Suspense } from 'react';
import { AuthWrapper } from '@/components/AuthWrapper';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export default async function AnalyticsPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-synheart-pink/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-[1800px] mx-auto p-6">
          {/* Enhanced Header with Gradient */}
          <div className="mb-10">
            <div className="inline-block mb-3">
              <span className="text-synheart-pink text-sm font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-synheart-pink/10 border border-synheart-pink/20">
                Analytics
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-3">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                SWIP
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-synheart-pink">
                {" "}Wellness Intelligence
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl">
              Real-time insights into wellness metrics, user engagement, and SWIP protocol performance
            </p>
          </div>

          {/* Dashboard Content */}
          <Suspense fallback={<DashboardSkeleton />}>
            <AnalyticsDashboard />
          </Suspense>
        </div>
      </div>
    </AuthWrapper>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 h-32 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 h-96 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

