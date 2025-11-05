/**
 * Sessions Page
 *
 * Displays session analytics with stats, regional activity, and device distribution
 */

import { Suspense } from 'react';
import { AuthWrapper } from '@/components/AuthWrapper';
import { SessionsPageContent } from '@/components/SessionsPageContent';

export default async function SessionsPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[15%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[25%] right-[20%] w-[500px] h-[500px] bg-synheart-pink/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-[1800px] mx-auto p-6">
          {/* Enhanced Header */}
          <div className="mb-10">
            <div className="inline-block mb-3">
              <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                Sessions
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-3">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                SWIP
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-300">
                {" "}Session Explorer
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl">
              Transparent, anonymized session logs with comprehensive filters and real-time analytics
            </p>
          </div>

          {/* Sessions Content */}
          <Suspense fallback={<SessionsSkeleton />}>
            <SessionsPageContent />
          </Suspense>
        </div>
      </div>
    </AuthWrapper>
  );
}

function SessionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 h-32 animate-pulse" />
        ))}
      </div>
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 h-96 animate-pulse" />
    </div>
  );
}
