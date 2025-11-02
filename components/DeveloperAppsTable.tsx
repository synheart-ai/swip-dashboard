/**
 * Developer Apps Table Component
 *
 * Displays the user's apps with detailed metrics
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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

interface DeveloperAppsTableProps {
  apps: AppData[];
  userId: string;
  onRegisterClick: () => void;
}

export function DeveloperAppsTable({ apps, userId, onRegisterClick }: DeveloperAppsTableProps) {
  const [generatingKeyForApp, setGeneratingKeyForApp] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<{ appId: string; key: string } | null>(null);
  const router = useRouter();

  const handleGenerateApiKey = async (appId: string) => {
    setGeneratingKeyForApp(appId);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNewApiKey({ appId, key: data.apiKey });
        router.refresh();
      } else {
        alert(data.error || 'Failed to generate API key');
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('An error occurred while generating API key');
    } finally {
      setGeneratingKeyForApp(null);
    }
  };


  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 85) return 'from-purple-500 to-purple-600';
    if (score >= 70) return 'from-blue-500 to-blue-600';
    if (score >= 60) return 'from-pink-500 to-pink-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Register Button */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">My Apps</h2>
          <p className="text-sm text-gray-400">
            Manage your registered applications and integrations
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={onRegisterClick}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Register New App
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-800/50">
              <th className="pb-4 text-sm font-semibold text-purple-400">App Name</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">SWIP Score</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">API Key</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">Sessions</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">Status</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">Created</th>
              <th className="pb-4 text-sm font-semibold text-purple-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  No apps registered yet. Click "Register New App" to get started!
                </td>
              </tr>
            ) : (
              apps.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                >
                  {/* App Name */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{app.name}</span>
                    </div>
                  </td>

                  {/* SWIP Score */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold w-12">{app.swipScore.toFixed(1)}</span>
                      <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreBarColor(app.swipScore)} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(app.swipScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* API Key */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-800/50 text-purple-400 text-xs rounded font-mono border border-gray-700">
                        {app.apiKey.length > 12 ? `${app.apiKey.substring(0, 12)}...` : app.apiKey}
                      </code>
                      <button
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                        title="Copy"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </button>
                    </div>
                  </td>

                  {/* Sessions */}
                  <td className="py-4">
                    <span className="text-white font-medium">
                      {app.sessions.toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4">
                    {app.status === 'Active' ? (
                      <Badge variant="success" dot size="sm">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="default" dot size="sm">
                        Inactive
                      </Badge>
                    )}
                  </td>

                  {/* Created */}
                  <td className="py-4">
                    <span className="text-gray-400 text-sm">
                      {formatDate(app.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleGenerateApiKey(app.id)}
                      disabled={generatingKeyForApp === app.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-all text-sm font-medium border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate API Key"
                    >
                      {generatingKeyForApp === app.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span>Generate Key</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* API Key Generated Modal */}
      {newApiKey && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setNewApiKey(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">API Key Generated!</h3>
                  <p className="text-gray-400 text-sm">Copy this key now - it won't be shown again</p>
                </div>
              </div>

              {/* API Key Display */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-6">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-purple-400 font-mono text-sm break-all flex-1">
                    {newApiKey.key}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newApiKey.key);
                    }}
                    className="flex-shrink-0 p-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-yellow-400 font-medium text-sm">Important!</p>
                    <p className="text-yellow-300/80 text-sm mt-1">
                      Store this API key securely. You won't be able to see it again.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setNewApiKey(null)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
              >
                I've Copied the Key
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
