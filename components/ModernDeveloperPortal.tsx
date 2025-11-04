/**
 * Modern Developer Portal Component
 * 
 * Compact, professional developer portal with better space utilization
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCard } from './ui/StatsCard';
import { DeveloperAppsTable } from './DeveloperAppsTable';
import { DeveloperApiKeysTable } from './DeveloperApiKeysTable';
import { RegisterAppPanel } from './RegisterAppPanel';
import { GenerateApiKeyModal } from './GenerateApiKeyModal';
import { ClaimableAppsSection } from './ClaimableAppsSection';

interface DeveloperStats {
  totalApps: number;
  totalSessions: number;
  apiCallsToday: number;
  avgSwipScore: number;
}

interface AppData {
  id: string;
  name: string;
  swipScore: number;
  apiKey: string;
  sessions: number;
  status: string;
  problems: string[];
  createdAt: Date;
  lastActivity: Date;
}

interface ApiKeyData {
  id: string;
  preview: string;
  appName: string;
  createdAt: Date;
  lastUsed: Date | null;
  revoked: boolean;
}

interface ModernDeveloperPortalProps {
  stats: DeveloperStats;
  apps: AppData[];
  apiKeys: ApiKeyData[];
  userId: string;
}

export function ModernDeveloperPortal({ stats, apps, apiKeys, userId }: ModernDeveloperPortalProps) {
  const [activeTab, setActiveTab] = useState<'apps' | 'keys' | 'claimable'>('apps');
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const [showGenerateKeyModal, setShowGenerateKeyModal] = useState(false);
  const [preselectedAppId, setPreselectedAppId] = useState<string | undefined>(undefined);
  const router = useRouter();

  const handleAppRegistered = () => {
    router.refresh();
  };

  const handleOpenGenerateKey = (appId?: string) => {
    setPreselectedAppId(appId);
    setShowGenerateKeyModal(true);
  };

  const handleKeyGenerated = () => {
    router.refresh();
    setShowGenerateKeyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Compact Header with Inline Controls */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              SWIP
            </span>
            <span className="text-white">
              {" "}Developer Portal
            </span>
          </h1>
          <p className="text-gray-400">Register apps, manage API keys, and monitor your wellness applications.</p>
        </div>
        
        {/* Compact Inline Controls */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-gray-400 text-sm hover:text-white hover:border-purple-500/50 transition-all backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Modern Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Apps */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-pink-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Apps</p>
              <p className="text-3xl font-bold text-white">{stats.totalApps.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-500 font-medium">3</span>
            <span className="text-gray-500">New this month</span>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-purple-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalSessions >= 1000000 
                  ? `${(stats.totalSessions / 1000000).toFixed(1)}M` 
                  : stats.totalSessions >= 1000 
                  ? `${(stats.totalSessions / 1000).toFixed(1)}K` 
                  : stats.totalSessions.toString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            All time data ingestions
          </div>
        </div>

        {/* API Calls Today */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-blue-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">API Calls Today</p>
              <p className="text-3xl font-bold text-white">
                {stats.apiCallsToday >= 1000000 
                  ? `${(stats.apiCallsToday / 1000000).toFixed(1)}M` 
                  : stats.apiCallsToday >= 1000 
                  ? `${(stats.apiCallsToday / 1000).toFixed(1)}K` 
                  : stats.apiCallsToday.toString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-red-500 font-medium">6%</span>
            <span className="text-gray-500">New record</span>
          </div>
        </div>

        {/* Average SWIP Score */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-green-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Avg SWIP Score</p>
              <p className="text-3xl font-bold text-white">{stats.avgSwipScore.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            Performance across all apps
          </div>
        </div>
      </div>

      {/* Modern Table with Tabs */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
        {/* Tabs */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('apps')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === 'apps'
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Apps
            </button>
            <button
              onClick={() => setActiveTab('keys')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === 'keys'
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('claimable')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === 'claimable'
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Claimable Apps
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          {activeTab === 'apps' && (
            <DeveloperAppsTable 
              apps={apps} 
              userId={userId}
              onRegisterClick={() => setShowRegisterPanel(true)}
              onGenerateKeyClick={handleOpenGenerateKey}
            />
          )}
          {activeTab === 'keys' && (
            <DeveloperApiKeysTable 
              apiKeys={apiKeys} 
              apps={apps.map((a) => ({ id: a.id, name: a.name }))} 
            />
          )}
          {activeTab === 'claimable' && (
            <ClaimableAppsSection />
          )}
        </div>
      </div>

      {/* Register App Panel - Overlays entire portal */}
      <RegisterAppPanel
        isOpen={showRegisterPanel}
        onClose={() => setShowRegisterPanel(false)}
        onSuccess={handleAppRegistered}
      />

      {/* Generate API Key Modal - Overlays entire portal */}
      <GenerateApiKeyModal
        isOpen={showGenerateKeyModal}
        onClose={() => setShowGenerateKeyModal(false)}
        onSuccess={handleKeyGenerated}
        apps={apps.map((a) => ({ id: a.id, name: a.name }))}
        preselectedAppId={preselectedAppId}
      />
    </div>
  );
}

