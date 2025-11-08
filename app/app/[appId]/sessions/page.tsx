/**
 * App Sessions Page
 * 
 * Shows all sessions for a specific app with detailed analytics
 */

import { prisma } from '../../../../src/lib/db';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { AuthWrapper } from '../../../../components/AuthWrapper';
import { AppSessionsContent } from '../../../../components/AppSessionsContent';

interface PageProps {
  params: Promise<{
    appId: string;
  }>;
}

const getAppWithSessions = unstable_cache(async (appId: string) => {
  try {
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
          select: {
            appSessionId: true,
            avgSwipScore: true,
            duration: true,
            startedAt: true,
            endedAt: true,
            userId: true,
            createdAt: true,
            biosignals: {
              select: {
                hrvSdnn: true,
                heartRate: true,
                emotions: {
                  select: {
                    dominantEmotion: true,
                  },
                },
              },
              orderBy: {
                timestamp: 'desc',
              },
            },
            device: {
              select: {
                watchModel: true,
                mobileOsVersion: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 200,
        },
      },
    });

    if (!app) {
      return null;
    }

    // Transform AppSession data to match expected format
    const sessions = app.appSessions.map(session => {
      // Aggregate emotions across biosignals
      const allEmotions = session.biosignals
        .flatMap(b => b.emotions)
        .map(e => e.dominantEmotion.toLowerCase());

      const emotionCounts = allEmotions.reduce<Record<string, number>>((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});

      let dominantEmotion: string | null = session.dominantEmotion
        ? session.dominantEmotion.toLowerCase()
        : null;
      if (!dominantEmotion) {
        let maxCount = 0;
        Object.entries(emotionCounts).forEach(([emotion, count]) => {
          if (count > maxCount) {
            dominantEmotion = emotion;
            maxCount = count;
          }
        });
      }

      const stressedCount = allEmotions.filter(emotion => emotion.includes('stress')).length;
      const stressRate = allEmotions.length > 0
        ? (stressedCount / allEmotions.length) * 100
        : null;
      
      // Calculate average HRV from biosignals
      const hrvValues = session.biosignals
        .map(b => b.hrvSdnn)
        .filter((v): v is number => v !== null && v !== undefined);
      const avgHrv = hrvValues.length > 0
        ? hrvValues.reduce((sum, v) => sum + v, 0) / hrvValues.length
        : null;

      // Get device info
      const deviceInfo = session.device;

      // Calculate average BPM from biosignals
      const hrValues = session.biosignals
        .map(b => b.heartRate)
        .filter((v): v is number => v !== null && v !== undefined);
      const avgBpm = hrValues.length > 0
        ? hrValues.reduce((sum, v) => sum + v, 0) / hrValues.length
        : null;

      return {
        sessionId: session.appSessionId,
        appName: app.name,
        appCategory: app.category || 'Other',
        swipScore: session.avgSwipScore,
        stressRate,
        emotion: dominantEmotion,
        duration: session.duration,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        avgBpm,
        avgHrv,
        wearable: deviceInfo?.watchModel || null,
        os: deviceInfo?.mobileOsVersion || null,
        userId: session.userId,
        category: app.category || 'Other',
      };
    });

    const totalSessions = sessions.length;
    
    // Calculate averages
    const avgSwipScore = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.swipScore || 0), 0) / totalSessions
      : 0;
    
    const sessionsWithStress = sessions.filter(s => s.stressRate !== null);
    const avgStressRate = sessionsWithStress.length > 0
      ? sessionsWithStress.reduce((sum, s) => sum + (s.stressRate || 0), 0) / sessionsWithStress.length
      : 0;
    
    const sessionsWithDuration = sessions.filter(s => s.duration && s.duration > 0);
    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / sessionsWithDuration.length
      : 0;

    // Calculate average HRV across all biosignals
    const allHrvValues = app.appSessions.flatMap(session => 
      session.biosignals
        .map(b => b.hrvSdnn)
        .filter((v): v is number => v !== null && v !== undefined)
    );
    const avgHrv = allHrvValues.length > 0
      ? allHrvValues.reduce((sum, v) => sum + v, 0) / allHrvValues.length
      : 0;

    // Emotion distribution - count all emotions across all sessions
    const allSessionEmotions = app.appSessions.flatMap(session =>
      session.biosignals.flatMap(b => b.emotions)
    );
    const emotionCounts = allSessionEmotions.reduce((acc, emotion) => {
      const emotionName = emotion.dominantEmotion;
      acc[emotionName] = (acc[emotionName] || 0) + 1;
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
    throw error;
  }
}, ['app-sessions'], {
  revalidate: 120,
  tags: ['app-sessions'],
});

export const revalidate = 120;

export default async function AppSessionsPage({ params }: PageProps) {
  try {
    const { appId } = await params;
    
    const data = await getAppWithSessions(appId);

    if (!data) {
      notFound();
    }

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

