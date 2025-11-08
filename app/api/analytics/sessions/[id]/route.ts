/**
 * Session Detail API
 *
 * Fetches complete session data with biosignals and emotions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch session with all nested data
    const session = await prisma.appSession.findUnique({
      where: {
        appSessionId: id,
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
            category: true,
            developer: true,
          },
        },
        device: {
          select: {
            platform: true,
            watchModel: true,
            mobileOsVersion: true,
          },
        },
        biosignals: {
          include: {
            emotions: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const sessionDetail = {
      sessionId: session.appSessionId,
      appId: session.appInternalId,
      appName: session.app?.name || 'Unknown App',
      appCategory: session.app?.category,
      appDeveloper: session.app?.developer,
      userId: session.userId,
      deviceId: session.deviceId,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.duration,
      avgSwipScore: session.avgSwipScore,
      dominantEmotion: (session as { dominantEmotion?: string | null }).dominantEmotion ?? null,
      dominantEmotion: session.dominantEmotion,
      dataOnCloud: session.dataOnCloud,
      createdAt: session.createdAt,
      
      // Biosignals with nested emotions
      biosignals: session.biosignals.map(biosignal => ({
        id: biosignal.appBiosignalId,
        timestamp: biosignal.timestamp,
        
        // Physiological metrics
        heartRate: biosignal.heartRate,
        hrvSdnn: biosignal.hrvSdnn,
        respiratoryRate: biosignal.respiratoryRate,
        bloodOxygenSaturation: biosignal.bloodOxygenSaturation,
        temperature: biosignal.temperature,
        accelerometer: biosignal.accelerometer,
        ecg: biosignal.ecg,
        emg: biosignal.emg,
        eda: biosignal.eda,
        gyro: biosignal.gyro,
        ppg: biosignal.ppg,
        ibi: biosignal.ibi,
        
        // Emotions for this biosignal
        emotions: biosignal.emotions.map(emotion => ({
          id: emotion.id,
          emotionId: emotion.emotionId,
          swipScore: emotion.swipScore,
          physSubscore: emotion.physSubscore,
          emoSubscore: emotion.emoSubscore,
          confidence: emotion.confidence,
          dominantEmotion: emotion.dominantEmotion,
          modelId: emotion.modelId,
          createdAt: emotion.createdAt,
        })),
      })),
      
      // Device information
      device: session.device ? {
        platform: session.device.platform || 'Unknown',
        watchModel: session.device.watchModel || 'Unknown',
        mobileOsVersion: session.device.mobileOsVersion || 'Unknown',
      } : undefined,
      
      // Statistics
      stats: {
        totalBiosignals: session.biosignals.length,
        totalEmotions: session.biosignals.reduce((sum, b) => sum + b.emotions.length, 0),
        avgHeartRate: session.biosignals.filter(b => b.heartRate).length > 0
          ? session.biosignals
              .filter(b => b.heartRate)
              .reduce((sum, b) => sum + (b.heartRate || 0), 0) / 
              session.biosignals.filter(b => b.heartRate).length
          : null,
        avgHrv: session.biosignals.filter(b => b.hrvSdnn).length > 0
          ? session.biosignals
              .filter(b => b.hrvSdnn)
              .reduce((sum, b) => sum + (b.hrvSdnn || 0), 0) /
              session.biosignals.filter(b => b.hrvSdnn).length
          : null,
        avgRespiratoryRate: session.biosignals.filter(b => b.respiratoryRate).length > 0
          ? session.biosignals
              .filter(b => b.respiratoryRate)
              .reduce((sum, b) => sum + (b.respiratoryRate || 0), 0) /
              session.biosignals.filter(b => b.respiratoryRate).length
          : null,
        avgSpO2: session.biosignals.filter(b => b.bloodOxygenSaturation).length > 0
          ? session.biosignals
              .filter(b => b.bloodOxygenSaturation)
              .reduce((sum, b) => sum + (b.bloodOxygenSaturation || 0), 0) /
              session.biosignals.filter(b => b.bloodOxygenSaturation).length
          : null,
        emotionDistribution: session.biosignals
          .flatMap(b => b.emotions)
          .reduce((acc, emotion) => {
            const key = emotion.dominantEmotion;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
      },
    };

    return NextResponse.json(sessionDetail, { status: 200 });
  } catch (error) {
    console.error('Error fetching session detail:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch session details',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

