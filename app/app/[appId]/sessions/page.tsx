/**
 * App Sessions Page
 * 
 * Shows all sessions for a specific app with detailed analytics
 */

import { prisma } from '../../../../src/lib/db';
import { notFound } from 'next/navigation';
import { AuthWrapper } from '../../../../components/AuthWrapper';
import { AppSessionsContent } from '../../../../components/AppSessionsContent';

interface PageProps {
  params: Promise<{
    appId: string;
  }>;
}

async function getAppWithSessions(appId: string) {
  try {
    // Valid emotions only (match database case - lowercase)
    const VALID_EMOTIONS = ['stressed', 'neutral', 'happy']; // Using 'happy' instead of 'amused'
    
    console.log('Querying database for app:', appId);
    
    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        swipSessions: {
          where: {
            OR: [
              { emotion: { in: VALID_EMOTIONS } },
              { emotion: null }
            ]
          },
          select: {
            id: true,
            swipScore: true,
            stressRate: true,
            emotion: true,
            duration: true,
            createdAt: true,
            hrvMetrics: true,
            wearable: true,
            os: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1000, // Limit to recent 1000 sessions
        },
      },
    });

    if (!app) {
      console.log('App not found in database:', appId);
      return null;
    }
    
    console.log('Found app:', app.name, 'with', app.swipSessions.length, 'sessions');

    // Calculate stats
    const sessions = app.swipSessions;
    const totalSessions = sessions.length;
    const avgSwipScore = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.swipScore || 0), 0) / totalSessions
      : 0;
    const avgStressRate = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.stressRate || 0), 0) / totalSessions
      : 0;
    const avgDuration = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions
      : 0;

    // Calculate average HRV (RMSSD from hrvMetrics)
    let totalHrv = 0;
    let hrvCount = 0;
    sessions.forEach(s => {
      if (s.hrvMetrics && typeof s.hrvMetrics === 'object') {
        const hrv = s.hrvMetrics as any;
        const rmssd = hrv.rmssd || hrv.sdnn || null;
        if (rmssd && typeof rmssd === 'number') {
          totalHrv += rmssd;
          hrvCount++;
        }
      }
    });
    const avgHrv = hrvCount > 0 ? totalHrv / hrvCount : 0;

    // Emotion breakdown - map to display names
    const emotionDisplayMap: Record<string, string> = {
      'stressed': 'Stressed',
      'neutral': 'Neutral',
      'happy': 'Amused',
    };
    
    const normalizeEmotion = (emotion: string | null) => {
      if (!emotion) return 'Unknown';
      return emotionDisplayMap[emotion.toLowerCase()] || 'Unknown';
    };

    const emotionCounts = sessions.reduce((acc, s) => {
      const emotion = normalizeEmotion(s.emotion);
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      app: {
        id: app.id,
        name: app.name,
        category: app.category,
        owner: app.owner,
      },
      sessions: sessions.map(s => ({
        id: s.id,
        swipScore: s.swipScore,
        stressRate: s.stressRate,
        emotion: s.emotion,
        duration: s.duration,
        createdAt: s.createdAt.toISOString(),
        hrvMetrics: s.hrvMetrics,
        wearable: s.wearable,
        os: s.os,
      })),
      stats: {
        totalSessions,
        avgSwipScore,
        avgStressRate,
        avgDuration,
        avgHrv,
        emotionCounts,
      },
    };
  } catch (error) {
    console.error('Database error fetching app:', error);
    throw error;
  }
}

export default async function AppSessionsPage({ params }: PageProps) {
  try {
    const { appId } = await params;
    console.log('Fetching sessions for app:', appId);
    
    const data = await getAppWithSessions(appId);

    if (!data) {
      console.log('No data found for app:', appId);
      notFound();
    }

    console.log('Successfully fetched data:', {
      appName: data.app.name,
      totalSessions: data.stats.totalSessions,
      avgHrv: data.stats.avgHrv
    });

    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1a0b2e] to-[#0A0118] p-8">
          <AppSessionsContent data={data} />
        </div>
      </AuthWrapper>
    );
  } catch (error) {
    console.error('Error loading app sessions:', error);
    throw error;
  }
}

