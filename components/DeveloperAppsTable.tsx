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
import { RegisterAppModal } from './RegisterAppModal';

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
}

export function DeveloperAppsTable({ apps, userId }: DeveloperAppsTableProps) {
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-green-400';
    if (score >= 60) return 'from-blue-500 to-blue-400';
    if (score >= 50) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Register Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">My Apps</h2>
          <p className="text-sm text-gray-400">
            Manage your registered applications and integrations
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowNewAppModal(true)}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Register New App
        </Button>
      </div>

      {/* Table */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  App Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  SWIP Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  API Key
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Sessions
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Problems
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No apps registered yet. Click "Register New App" to get started!
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    {/* App Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-synheart-pink to-synheart-blue flex items-center justify-center text-white text-sm font-bold">
                          {app.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{app.name}</span>
                      </div>
                    </td>

                    {/* SWIP Score */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-gray-800"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="url(#gradient)"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${(app.swipScore / 100) * 175.93} 175.93`}
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" className={`stop-color-${app.swipScore >= 70 ? 'green' : app.swipScore >= 50 ? 'blue' : 'red'}`} />
                                <stop offset="100%" className={`stop-color-${app.swipScore >= 70 ? 'green' : app.swipScore >= 50 ? 'blue' : 'red'}`} />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {app.swipScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* API Key */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-800 text-synheart-pink text-xs rounded font-mono">
                          {app.apiKey}
                        </code>
                        <button
                          className="text-gray-400 hover:text-white transition-colors"
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
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {app.sessions.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {app.status === 'Active' ? (
                        <Badge variant="success" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="default" dot>
                          Inactive
                        </Badge>
                      )}
                    </td>

                    {/* Problems */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {app.problems.length === 0 ? (
                          <span className="text-gray-500 text-sm">None</span>
                        ) : (
                          app.problems.map((problem) => (
                            <Badge key={problem} variant="default" size="sm">
                              {problem}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {formatDate(app.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register App Modal */}
      <RegisterAppModal
        isOpen={showNewAppModal}
        onClose={() => setShowNewAppModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
