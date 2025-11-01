/**
 * Session Detail Panel
 * 
 * Comprehensive session analytics with beautiful visualizations
 */

'use client';

import { SessionData } from './SessionTable';
import { BioSignalsChart } from './charts/BioSignalsChart';

interface SessionDetailPanelProps {
  session: SessionData | null;
  onClose: () => void;
}

export function SessionDetailPanel({ session, onClose }: SessionDetailPanelProps) {
  if (!session) return null;

  // Valid emotions - map database emotions to display names
  const emotionDisplayMap: Record<string, string> = {
    'stressed': 'Stressed',
    'neutral': 'Neutral',
    'happy': 'Amused', // Map 'happy' to 'Amused' for display
  };
  
  const normalizeEmotion = (emotion: string | null): string => {
    if (!emotion) return 'Unknown';
    return emotionDisplayMap[emotion.toLowerCase()] || 'Unknown';
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

          {/* Additional Metrics */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Detailed Metrics</h3>
            
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
                    <span className="text-white font-semibold">{session.avgBpm?.toFixed(0) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className="text-green-400 text-sm font-medium">Normal Range</span>
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
                    <span className="text-gray-400 text-sm">Average HRV</span>
                    <span className="text-white font-semibold">{session.avgHrv?.toFixed(1) || 'N/A'} ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Variability</span>
                    <span className="text-blue-400 text-sm font-medium">Good</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

