/**
 * Developer Apps Table Component
 *
 * Displays the user's apps with detailed metrics
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

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
  onGenerateKeyClick: (appId: string) => void;
}

export function DeveloperAppsTable({
  apps,
  userId,
  onRegisterClick,
  onGenerateKeyClick,
}: DeveloperAppsTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 85) return "from-purple-500 to-purple-600";
    if (score >= 70) return "from-blue-500 to-blue-600";
    if (score >= 60) return "from-pink-500 to-pink-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header with Register Button */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">My Apps</h2>
          <p className="text-sm text-gray-400">
            Manage your registered applications and integrations
          </p>
        </div>
        <Button variant="primary" className="" size="md" onClick={onRegisterClick}>
          Register New App
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead >
            <tr className="text-left  border-b border-gray-800/50">
              <th className="pb-4 text-sm  font-semibold text-purple-400">
                App Name
              </th>
              <th className="pb-4 text-sm font-semibold text-purple-400">
                SWIP Score
              </th>
              <th className="pb-4 text-sm font-semibold text-purple-400">
                API Key
              </th>
              <th className="pb-4 text-sm font-semibold text-purple-400">
                Sessions
              </th>
              <th className="pb-4 text-sm font-semibold text-purple-400">
                Status
              </th>
              <th className="pb-4 text-sm font-semibold text-purple-400">
                Created
              </th>
              <th className="pb-4 text-sm font-semibold text-purple-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  No apps registered yet. Click "Register New App" to get
                  started!
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
                      <span className="text-white font-semibold w-12">
                        {app.swipScore.toFixed(1)}
                      </span>
                      <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreBarColor(
                            app.swipScore
                          )} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(app.swipScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* API Key */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-800/50 text-purple-400 text-xs rounded font-mono border border-gray-700">
                        {app.apiKey.length > 12
                          ? `${app.apiKey.substring(0, 12)}...`
                          : app.apiKey}
                      </code>
                      <button
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                        title="Copy"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
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
                    {app.status === "Active" ? (
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
                      onClick={() => onGenerateKeyClick(app.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-all text-sm font-medium border border-purple-500/30"
                      title="Generate API Key"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      <span>Generate Key</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
