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
        appSessions: {
          include: {
            biosignals: {
              include: {
                emotions: {
                  where: {
                    dominantEmotion: {
                      in: VALID_EMOTIONS.map(e => e.charAt(0).toUpperCase() + e.slice(1))
                    }
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1, // Get most recent emotion per biosignal
                },
              },
              orderBy: {
                timestamp: 'desc',
              },
            },
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
    
    console.log('Found app:', app.name, 'with', app.appSessions.length, 'sessions');

    // Transform AppSession data to match expected format
    const sessions = app.appSessions.map(session => {
      // Get most recent emotion from biosignals
      const recentEmotion = session.biosignals
        .flatMap(b => b.emotions)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      
      // Calculate average HRV from biosignals
      const hrvValues = session.biosignals
        .map(b => b.hrvSdnn)
        .filter((v): v is number => v !== null && v !== undefined);
      const avgHrv = hrvValues.length > 0
        ? hrvValues.reduce((sum, v) => sum + v, 0) / hrvValues.length
        : null;

      // Calculate stress rate based on emotion (stressed = 80%, neutral = 20%, happy = 10%)
      const stressRateMap: Record<string, number> = {
        'Stressed': 80,
        'stressed': 80,
        'Anxious': 70,
        'anxious': 70,
        'Neutral': 20,
        'neutral': 20,
        'Happy': 10,
        'happy': 10,
        'Amused': 10,
        'amused': 10,
      };
      const stressRate = recentEmotion 
        ? stressRateMap[recentEmotion.dominantEmotion] || 30
        : null;

      return {
        id: session.id,
        swipScore: session.avgSwipScore,
        stressRate,
        emotion: recentEmotion?.dominantEmotion.toLowerCase() || null,
        duration: session.duration,
        createdAt: session.createdAt.toISOString(),
        hrvMetrics: avgHrv ? { sdnn: avgHrv, rmssd: avgHrv } : null,
        wearable: null, // AppSession doesn't have wearable directly
        os: null, // AppSession doesn't have os directly
      };
    });

    const totalSessions = sessions.length;
    const avgSwipScore = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.swipScore || 0), 0) / totalSessions
      : 0;
    const avgStressRate = totalSessions > 0
      ? sessions.filter(s => s.stressRate !== null).length > 0
        ? sessions
            .filter(s => s.stressRate !== null)
            .reduce((sum, s) => sum + (s.stressRate || 0), 0) / sessions.filter(s => s.stressRate !== null).length
        : 0
      : 0;
    const avgDuration = totalSessions > 0
      ? sessions.filter(s => s.duration !== null).length > 0
        ? sessions
            .filter(s => s.duration !== null)
            .reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.filter(s => s.duration !== null).length
        : 0
      : 0;

    // Calculate average HRV
    const hrvValues = sessions
      .map(s => s.hrvMetrics && typeof s.hrvMetrics === 'object' ? (s.hrvMetrics as any).sdnn : null)
      .filter((v): v is number => v !== null && v !== undefined);
    const avgHrv = hrvValues.length > 0 
      ? hrvValues.reduce((sum, v) => sum + v, 0) / hrvValues.length 
      : 0;

    // Emotion breakdown
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
      sessions,
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

