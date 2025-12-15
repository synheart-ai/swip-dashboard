/**
 * Session Detail Page - Full Page View with Sidebar
 *
 * Displays comprehensive session data with biosignals and emotions
 */

import { Suspense } from 'react';
import { AuthWrapper } from '@/components/AuthWrapper';
import { SessionDetailFullPage } from '@/components/SessionDetailFullPage';

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { sessionId } = await params;

  return (
    <AuthWrapper>
      <Suspense fallback={<SessionDetailSkeleton />}>
        <SessionDetailFullPage sessionId={sessionId} />
      </Suspense>
    </AuthWrapper>
  );
}

function SessionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex">
      {/* Sidebar Skeleton */}
      <div className="w-80 border-r border-gray-800 bg-gray-950/50 p-6">
        <div className="space-y-4">
          <div className="h-12 bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-8">
        <div className="space-y-6">
          <div className="h-16 bg-gray-800 rounded-lg animate-pulse" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}


