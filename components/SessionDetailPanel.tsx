/**
 * Session Detail Panel
 * 
 * Comprehensive session analytics with beautiful visualizations
 * Shows the full data flow: Session → Biosignals → Emotions
 */

'use client';

import { useState, useEffect } from 'react';
import { SessionData } from './SessionTable';
import { BioSignalsChart } from './charts/BioSignalsChart';

interface SessionDetailPanelProps {
  session: SessionData | null;
  onClose: () => void;
}

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
  accelerometer: number | null;
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
  dominantEmotion: string | null;
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
}

export function SessionDetailPanel({ session, onClose }: SessionDetailPanelProps) {
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchSessionDetail(session.sessionId);
    } else {
      setSessionDetail(null);
    }
  }, [session]);

  const fetchSessionDetail = async (sessionId: string) => {
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

  if (!session) return null;

  // Valid emotions - map database emotions to display names
  const emotionDisplayMap: Record<string, string> = {
    'calm': 'Calm',
    'focused': 'Focused',
    'stressed': 'Stressed',
    'neutral': 'Neutral',
    'happy': 'Amused', // Map 'happy' to 'Amused' for display
  };

  const normalizeEmotion = (emotion: string | null): string => {
    if (!emotion) return 'Unknown';
    const key = emotion.toLowerCase();
    return emotionDisplayMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  const getScoreGrade = (score: number | null): { label: string; color: string; bgColor: string } => {
    if (!score) return { label: 'N/A', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
    if (score >= 85) return { label: 'Excellent', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    if (score >= 60) return { label: 'Moderate', color: 'text-pink-400', bgColor: 'bg-pink-500/20' };
    return { label: 'Low', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const scoreGrade = getScoreGrade(session.swipScore);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-[#0A0118] border-l border-gray-800 z-50 overflow-y-auto">
        {/* Panel Header */}
        <div className="sticky top-0 bg-[#0A0118] border-b border-gray-800 p-8 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-white">Session Analytics</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${scoreGrade.bgColor} ${scoreGrade.color} border border-current/30`}>
                  {scoreGrade.label}
                </span>
              </div>
              <code className="text-purple-400 text-sm font-mono">{session.sessionId}</code>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="p-8 space-y-8">
          {/* SWIP Score Hero Section */}
          <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative z-10">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm mb-2">SWIP Wellness Score</p>
                <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4">
                  {session.swipScore?.toFixed(1) || 'N/A'}
                </div>
                <div className="w-full max-w-md mx-auto h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((session.swipScore || 0), 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 rounded-xl bg-black/30 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Stress Rate</p>
                  <p className="text-2xl font-bold text-white">{session.stressRate?.toFixed(1) || 'N/A'}%</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-black/30 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Avg BPM</p>
                  <p className="text-2xl font-bold text-white">{session.avgBpm?.toFixed(0) || 'N/A'}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-black/30 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Avg HRV</p>
                  <p className="text-2xl font-bold text-white">{session.avgHrv?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* App Name */}
            <div className="p-5 rounded-2xl border border-gray-800 bg-gray-900/30">
              <p className="text-gray-400 text-xs mb-2">Application</p>
              <p className="text-white font-semibold text-lg">{session.appName}</p>
            </div>

            {/* Duration */}
            <div className="p-5 rounded-2xl border border-gray-800 bg-gray-900/30">
              <p className="text-gray-400 text-xs mb-2">Duration</p>
              <p className="text-white font-semibold text-lg">{formatDuration(session.duration)}</p>
            </div>

            {/* Emotion */}
            <div className="p-5 rounded-2xl border border-gray-800 bg-gray-900/30">
              <p className="text-gray-400 text-xs mb-2">Emotion</p>
              <p className="text-white font-semibold text-lg capitalize">{normalizeEmotion(session.emotion)}</p>
            </div>

            {/* Wearable */}
            <div className="p-5 rounded-2xl border border-gray-800 bg-gray-900/30">
              <p className="text-gray-400 text-xs mb-2">Wearable Device</p>
              <p className="text-white font-semibold">{session.wearable || 'N/A'}</p>
            </div>

            {/* OS */}
            <div className="p-5 rounded-2xl border border-gray-800 bg-gray-900/30">
              <p className="text-gray-400 text-xs mb-2">Operating System</p>
              <p className="text-white font-semibold">{session.os || 'N/A'}</p>
            </div>

            {/* Started At */}
            <div className="p-5 rounded-2xl border border-gray-800 bg-gray-900/30">
              <p className="text-gray-400 text-xs mb-2">Started At</p>
              <p className="text-white font-semibold text-sm">{formatDate(session.startedAt)}</p>
            </div>
          </div>

          {/* Bio Signals Chart Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Biometric Data</h3>
              <span className="text-xs text-gray-400">Real-time measurements</span>
            </div>
            
            {/* Charts would go here if HR/HRV data exists */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 p-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Heart Rate Stats */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Heart Rate</p>
                      <p className="text-2xl font-bold text-white">{session.avgBpm?.toFixed(0) || 'N/A'} <span className="text-sm text-gray-400">BPM</span></p>
                    </div>
                  </div>
                  <div className="h-24 bg-gray-800/50 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500 text-sm">HR waveform visualization</p>
                  </div>
                </div>

                {/* HRV Stats */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Heart Rate Variability</p>
                      <p className="text-2xl font-bold text-white">{session.avgHrv?.toFixed(1) || 'N/A'} <span className="text-sm text-gray-400">ms</span></p>
                    </div>
                  </div>
                  <div className="h-24 bg-gray-800/50 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500 text-sm">HRV variability chart</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Insights */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Wellness Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Emotional State */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-purple-900/10 to-pink-900/10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                    <span className="text-3xl">😊</span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Emotional State</p>
                    <p className="text-xl font-bold text-white capitalize">{normalizeEmotion(session.emotion)}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  The session showed a <span className="text-purple-400 font-semibold">{normalizeEmotion(session.emotion).toLowerCase()}</span> emotional state based on HRV analysis.
                </p>
              </div>

              {/* Stress Analysis */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-blue-900/10 to-cyan-900/10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Stress Level</p>
                    <p className="text-xl font-bold text-white">{session.stressRate?.toFixed(1) || 'N/A'}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${Math.min(session.stressRate || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Session Timeline</h3>
            
            <div className="relative pl-8 border-l-2 border-gray-800">
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute -left-[37px] w-6 h-6 rounded-full bg-green-500 border-4 border-[#0A0118] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4">
                    <p className="text-sm font-semibold text-green-400 mb-1">Session Started</p>
                    <p className="text-gray-400 text-sm">{formatDate(session.startedAt)}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[37px] w-6 h-6 rounded-full bg-purple-500 border-4 border-[#0A0118] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4">
                    <p className="text-sm font-semibold text-purple-400 mb-1">Data Collection</p>
                    <p className="text-gray-400 text-sm">Wearable: {session.wearable || 'Unknown'} • OS: {session.os || 'Unknown'}</p>
                    <p className="text-gray-400 text-xs mt-1">Duration: {formatDuration(session.duration)}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[37px] w-6 h-6 rounded-full bg-blue-500 border-4 border-[#0A0118] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4">
                    <p className="text-sm font-semibold text-blue-400 mb-1">SWIP Analysis Complete</p>
                    <p className="text-gray-400 text-sm">Score: {session.swipScore?.toFixed(1)} • Grade: {scoreGrade.label}</p>
                  </div>
                </div>

                {session.endedAt && (
                  <div className="relative">
                    <div className="absolute -left-[37px] w-6 h-6 rounded-full bg-gray-500 border-4 border-[#0A0118] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4">
                      <p className="text-sm font-semibold text-gray-400 mb-1">Session Ended</p>
                      <p className="text-gray-400 text-sm">{formatDate(session.endedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Flow Visualization */}
          {sessionDetail && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Data Flow Architecture</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1: Session Created */}
                <div className="relative overflow-hidden rounded-2xl border border-green-800 bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6">
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-400">1</span>
                  </div>
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-1">Session Created</h4>
                    <p className="text-gray-400 text-sm">SWIP App initiates tracking</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Session ID</span>
                      <code className="text-green-400 font-mono">{sessionDetail.sessionId.slice(0, 8)}...</code>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">App</span>
                      <span className="text-white">{sessionDetail.appName}</span>
                    </div>
                  </div>
                </div>

                {/* Step 2: Biosignals Sent */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-800 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6">
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400">2</span>
                  </div>
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-1">Biosignals Sent</h4>
                    <p className="text-gray-400 text-sm">Physiological data streamed</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Total Signals</span>
                      <span className="text-blue-400 font-semibold">{sessionDetail.stats.totalBiosignals}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Avg HR</span>
                      <span className="text-white">{sessionDetail.stats.avgHeartRate?.toFixed(0) || 'N/A'} BPM</span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Emotions Computed */}
                <div className="relative overflow-hidden rounded-2xl border border-purple-800 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6">
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-400">3</span>
                  </div>
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-1">Emotions Computed</h4>
                    <p className="text-gray-400 text-sm">AI analysis completed</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Total Emotions</span>
                      <span className="text-purple-400 font-semibold">{sessionDetail.stats.totalEmotions}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">SWIP Score</span>
                      <span className="text-white">{sessionDetail.avgSwipScore?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Biosignals and Emotions Details */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {sessionDetail && !loading && (
            <>
              {/* Emotion Distribution */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Emotion Distribution</h3>
                
                <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
                  <div className="space-y-3">
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
                      };
                      const color = colorMap[emotion.toLowerCase()] || 'bg-purple-500';
                      
                      return (
                        <div key={emotion}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-medium capitalize">{emotion}</span>
                            <span className="text-gray-400 text-sm">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
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

              {/* Biosignals Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Biosignals Timeline</h3>
                  <span className="text-sm text-gray-400">{sessionDetail.biosignals.length} measurements</span>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {sessionDetail.biosignals.map((biosignal, index) => (
                    <div key={biosignal.id} className="rounded-2xl border border-gray-800 bg-gray-900/30 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">Measurement #{index + 1}</span>
                            <code className="text-xs text-purple-400 font-mono">{biosignal.id.slice(0, 8)}...</code>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {new Date(biosignal.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                          {biosignal.emotions.length} emotions
                        </span>
                      </div>

                      {/* Biosignal Metrics */}
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
                            <p className="text-gray-400 text-xs mb-1">Respiratory Rate</p>
                            <p className="text-white font-semibold">{biosignal.respiratoryRate.toFixed(1)} <span className="text-xs text-gray-400">/min</span></p>
                          </div>
                        )}
                        {biosignal.bloodOxygenSaturation && (
                          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">SpO2</p>
                            <p className="text-white font-semibold">{biosignal.bloodOxygenSaturation.toFixed(1)} <span className="text-xs text-gray-400">%</span></p>
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
                                  <span className="text-2xl">{emotion.dominantEmotion === 'stressed' ? '😰' : emotion.dominantEmotion === 'calm' ? '😌' : '😊'}</span>
                                  <div>
                                    <p className="text-white font-medium capitalize">{emotion.dominantEmotion}</p>
                                    <p className="text-gray-400 text-xs">Confidence: {(emotion.confidence * 100).toFixed(1)}%</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-purple-400 font-semibold">{emotion.swipScore.toFixed(1)}</p>
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
            </>
          )}

          {/* Additional Metrics */}
          {sessionDetail && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Statistical Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Heart Rate Details */}
                <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white">Heart Rate Analysis</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Average BPM</span>
                      <span className="text-white font-semibold">{sessionDetail.stats.avgHeartRate?.toFixed(0) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Data Points</span>
                      <span className="text-white font-semibold">{sessionDetail.biosignals.filter(b => b.heartRate).length}</span>
                    </div>
                  </div>
                </div>

                {/* HRV Details */}
                <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white">HRV Metrics</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Average HRV (SDNN)</span>
                      <span className="text-white font-semibold">{sessionDetail.stats.avgHrv?.toFixed(1) || 'N/A'} ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Data Points</span>
                      <span className="text-white font-semibold">{sessionDetail.biosignals.filter(b => b.hrvSdnn).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
              Export Session Data
            </button>
            <button className="flex-1 px-6 py-3 rounded-lg border border-gray-800 bg-gray-900/30 text-white font-semibold hover:bg-gray-800/50 transition-all">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

