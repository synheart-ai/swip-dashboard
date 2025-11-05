/**
 * Session Detail Full Page Component
 * 
 * Full page with sidebar showing comprehensive session data
 * - Biosignals with visualizations
 * - Emotion analysis
 * - Device information
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

interface Emotion {
  id: string;
  emotionId: number | null;
  swipScore: number;
  physSubscore: number;
  emoSubscore: number;
  confidence: number;
  dominantEmotion: string;
  modelId: string;
  createdAt: Date;
}

interface Biosignal {
  id: string;
  timestamp: Date;
  heartRate: number | null;
  hrvSdnn: number | null;
  respiratoryRate: number | null;
  bloodOxygenSaturation: number | null;
  temperature: number | null;
  accelerometer: any;
  ecg: number | null;
  emg: number | null;
  eda: number | null;
  gyro: any;
  ppg: number | null;
  ibi: number | null;
  emotions: Emotion[];
}

interface SessionDetail {
  sessionId: string;
  appId: string;
  appName: string;
  appCategory: string | null;
  appDeveloper: string | null;
  userId: string | null;
  deviceId: string | null;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  avgSwipScore: number | null;
  dataOnCloud: number;
  createdAt: Date;
  biosignals: Biosignal[];
  stats: {
    totalBiosignals: number;
    totalEmotions: number;
    avgHeartRate: number | null;
    avgHrv: number | null;
    avgRespiratoryRate: number | null;
    avgSpO2: number | null;
    emotionDistribution: Record<string, number>;
  };
  device?: {
    platform: string;
    watchModel: string;
    mobileOsVersion: string;
  };
}

interface SessionDetailFullPageProps {
  sessionId: string;
}

export function SessionDetailFullPage({ sessionId }: SessionDetailFullPageProps) {
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionDetail();
  }, [sessionId]);

  const fetchSessionDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }
      const data = await response.json();
      setSessionDetail(data);
    } catch (err) {
      console.error('Error fetching session detail:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  // Calculate average emotion from biosignals
  const getAverageEmotion = (): string => {
    if (!sessionDetail || sessionDetail.biosignals.length === 0) return 'Unknown';
    
    const emotionCounts: Record<string, number> = {};
    sessionDetail.biosignals.forEach(biosignal => {
      biosignal.emotions.forEach(emotion => {
        const key = emotion.dominantEmotion;
        emotionCounts[key] = (emotionCounts[key] || 0) + 1;
      });
    });

    if (Object.keys(emotionCounts).length === 0) return 'Unknown';

    // Find the most common emotion
    const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
    return sortedEmotions[0][0];
  };

  // Calculate stress rate from biosignals with stressed emotions
  const getStressRate = (): number => {
    if (!sessionDetail || sessionDetail.biosignals.length === 0) return 0;
    
    let stressedCount = 0;
    sessionDetail.biosignals.forEach(biosignal => {
      const hasStress = biosignal.emotions.some(e => 
        e.dominantEmotion.toLowerCase().includes('stress')
      );
      if (hasStress) stressedCount++;
    });

    return (stressedCount / sessionDetail.biosignals.length) * 100;
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Prepare chart data
  const prepareHeartRateData = () => {
    if (!sessionDetail) return [];
    return sessionDetail.biosignals
      .filter(b => b.heartRate)
      .map((b, index) => ({
        time: index + 1,
        hr: b.heartRate,
        timestamp: new Date(b.timestamp).toLocaleTimeString(),
      }));
  };

  const prepareHRVData = () => {
    if (!sessionDetail) return [];
    return sessionDetail.biosignals
      .filter(b => b.hrvSdnn)
      .map((b, index) => ({
        time: index + 1,
        hrv: b.hrvSdnn,
        timestamp: new Date(b.timestamp).toLocaleTimeString(),
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !sessionDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Session not found'}</p>
          <Link href="/sessions" className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  const averageEmotion = getAverageEmotion();
  const stressRate = getStressRate();
  const heartRateData = prepareHeartRateData();
  const hrvData = prepareHRVData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex">
      {/* Sidebar */}
      <div className="w-96 border-r border-gray-800 bg-gray-950/50 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Back Button */}
          <Link 
            href="/sessions"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Sessions</span>
          </Link>

          {/* Session Overview */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
            <h3 className="text-white font-semibold mb-4">Session Overview</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-xs mb-1">Session ID</p>
                <code className="text-purple-400 text-sm font-mono break-all">{sessionDetail.sessionId}</code>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Application</p>
                <p className="text-white font-medium">{sessionDetail.appName}</p>
              </div>
              {sessionDetail.appCategory && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Category</p>
                  <p className="text-white">{sessionDetail.appCategory}</p>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
            <h3 className="text-white font-semibold mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">SWIP Score</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {sessionDetail.avgSwipScore?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Stress Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">{stressRate.toFixed(1)}%</p>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                      style={{ width: `${Math.min(stressRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Average Emotion</p>
                <p className="text-white font-medium capitalize">{averageEmotion}</p>
              </div>
            </div>
          </div>

          {/* Device Info */}
          {sessionDetail.device && (
            <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
              <h3 className="text-white font-semibold mb-4">Device Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Wearable</p>
                  <p className="text-white">{sessionDetail.device.watchModel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Operating System</p>
                  <p className="text-white">{sessionDetail.device.platform || 'N/A'} {sessionDetail.device.mobileOsVersion || ''}</p>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
            <h3 className="text-white font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Biosignals</span>
                <span className="text-white font-semibold">{sessionDetail.stats.totalBiosignals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Emotions</span>
                <span className="text-white font-semibold">{sessionDetail.stats.totalEmotions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Avg HR</span>
                <span className="text-white font-semibold">{sessionDetail.stats.avgHeartRate?.toFixed(0) || 'N/A'} BPM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Avg HRV</span>
                <span className="text-white font-semibold">{sessionDetail.stats.avgHrv?.toFixed(1) || 'N/A'} ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Session Analytics</h1>
            <p className="text-gray-400">Comprehensive biosignal and emotion analysis</p>
          </div>

          {/* Timeline Info - Fixed Order */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
              <p className="text-gray-400 text-sm mb-1">Started At</p>
              <p className="text-white font-semibold">{formatDate(sessionDetail.startedAt)}</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
              <p className="text-gray-400 text-sm mb-1">Ended At</p>
              <p className="text-white font-semibold">{formatDate(sessionDetail.endedAt)}</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
              <p className="text-gray-400 text-sm mb-1">Duration</p>
              <p className="text-white font-semibold">{formatDuration(sessionDetail.duration)}</p>
            </div>
          </div>

          {/* Biometric Visualizations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Biometric Data</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Heart Rate Chart */}
              {heartRateData.length > 0 && (
                <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
                  <h3 className="text-white font-semibold mb-4">Heart Rate (BPM)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={heartRateData}>
                      <defs>
                        <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Area type="monotone" dataKey="hr" stroke="#ef4444" fillOpacity={1} fill="url(#colorHr)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* HRV Chart */}
              {hrvData.length > 0 && (
                <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
                  <h3 className="text-white font-semibold mb-4">Heart Rate Variability (ms)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={hrvData}>
                      <defs>
                        <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Area type="monotone" dataKey="hrv" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHrv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Wellness Insights - Updated Calculations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Wellness Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emotional State - Average from Biosignals */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-purple-900/10 to-pink-900/10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                    <span className="text-3xl">
                      {averageEmotion.toLowerCase().includes('stress') ? '😰' : 
                       averageEmotion.toLowerCase().includes('calm') ? '😌' : 
                       averageEmotion.toLowerCase().includes('happy') ? '😊' : 
                       averageEmotion.toLowerCase().includes('neutral') ? '😐' : '🙂'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Average Emotional State</p>
                    <p className="text-xl font-bold text-white capitalize">{averageEmotion}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Most common emotion detected across all biosignal measurements during this session.
                </p>
              </div>

              {/* Stress Analysis - From Biosignal Emotions */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-red-900/10 to-orange-900/10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Stress Level</p>
                    <p className="text-xl font-bold text-white">{stressRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                    style={{ width: `${Math.min(stressRate, 100)}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  Percentage of biosignals with stressed emotion detection.
                </p>
              </div>
            </div>
          </div>

          {/* Emotion Distribution */}
          {Object.keys(sessionDetail.stats.emotionDistribution).length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Emotion Distribution</h2>
              
              <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
                <div className="space-y-4">
                  {Object.entries(sessionDetail.stats.emotionDistribution).map(([emotion, count]) => {
                    const total = sessionDetail.stats.totalEmotions;
                    const percentage = (count / total) * 100;
                    const colorMap: Record<string, string> = {
                      'stressed': 'bg-red-500',
                      'calm': 'bg-green-500',
                      'neutral': 'bg-gray-500',
                      'happy': 'bg-yellow-500',
                      'anxious': 'bg-orange-500',
                      'focused': 'bg-blue-500',
                      'excited': 'bg-pink-500',
                      'sad': 'bg-indigo-500',
                      'amused': 'bg-purple-500',
                    };
                    const color = colorMap[emotion.toLowerCase()] || 'bg-purple-500';
                    
                    return (
                      <div key={emotion}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium capitalize">{emotion}</span>
                          <span className="text-gray-400 text-sm">{count} detections ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Biosignals Timeline */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Biosignals Timeline</h2>
              <span className="text-sm text-gray-400">{sessionDetail.biosignals.length} measurements</span>
            </div>
            
            <div className="space-y-4">
              {sessionDetail.biosignals.map((biosignal, index) => (
                <div key={biosignal.id} className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold">Measurement #{index + 1}</span>
                        <code className="text-xs text-purple-400 font-mono">{biosignal.id.slice(0, 12)}...</code>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {new Date(biosignal.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                      {biosignal.emotions.length} emotion{biosignal.emotions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Biosignal Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {biosignal.heartRate && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">Heart Rate</p>
                        <p className="text-white font-semibold">{biosignal.heartRate} <span className="text-xs text-gray-400">BPM</span></p>
                      </div>
                    )}
                    {biosignal.hrvSdnn && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">HRV (SDNN)</p>
                        <p className="text-white font-semibold">{biosignal.hrvSdnn.toFixed(1)} <span className="text-xs text-gray-400">ms</span></p>
                      </div>
                    )}
                    {biosignal.respiratoryRate && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">Resp. Rate</p>
                        <p className="text-white font-semibold">{biosignal.respiratoryRate.toFixed(1)} <span className="text-xs text-gray-400">/min</span></p>
                      </div>
                    )}
                    {biosignal.bloodOxygenSaturation && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">SpO2</p>
                        <p className="text-white font-semibold">{biosignal.bloodOxygenSaturation.toFixed(1)} <span className="text-xs text-gray-400">%</span></p>
                      </div>
                    )}
                    {biosignal.temperature && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">Temperature</p>
                        <p className="text-white font-semibold">{biosignal.temperature.toFixed(1)} <span className="text-xs text-gray-400">°C</span></p>
                      </div>
                    )}
                    {biosignal.accelerometer && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">Accelerometer</p>
                        <p className="text-white font-semibold text-xs">
                          [{Array.isArray(biosignal.accelerometer) 
                            ? biosignal.accelerometer.map((v: number) => v.toFixed(2)).join(', ')
                            : typeof biosignal.accelerometer === 'object' 
                              ? `${biosignal.accelerometer.x?.toFixed(2) || 0}, ${biosignal.accelerometer.y?.toFixed(2) || 0}, ${biosignal.accelerometer.z?.toFixed(2) || 0}`
                              : biosignal.accelerometer
                          }]
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Emotions for this Biosignal */}
                  {biosignal.emotions.length > 0 && (
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-xs mb-3">Detected Emotions:</p>
                      <div className="space-y-2">
                        {biosignal.emotions.map((emotion) => (
                          <div key={emotion.id} className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {emotion.dominantEmotion.toLowerCase().includes('stress') ? '😰' : 
                                 emotion.dominantEmotion.toLowerCase().includes('calm') ? '😌' : 
                                 emotion.dominantEmotion.toLowerCase().includes('happy') || emotion.dominantEmotion.toLowerCase().includes('amused') ? '😊' :
                                 emotion.dominantEmotion.toLowerCase().includes('neutral') ? '😐' :
                                 emotion.dominantEmotion.toLowerCase().includes('sad') ? '😢' :
                                 emotion.dominantEmotion.toLowerCase().includes('anxious') ? '😟' :
                                 emotion.dominantEmotion.toLowerCase().includes('focused') ? '🧐' :
                                 emotion.dominantEmotion.toLowerCase().includes('excited') ? '🤩' : '🙂'}
                              </span>
                              <div>
                                <p className="text-white font-medium capitalize">{emotion.dominantEmotion}</p>
                                <p className="text-gray-400 text-xs">Confidence: {(emotion.confidence * 100).toFixed(1)}%</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-purple-400 font-semibold text-lg">{emotion.swipScore.toFixed(1)}</p>
                              <p className="text-gray-400 text-xs">SWIP Score</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


