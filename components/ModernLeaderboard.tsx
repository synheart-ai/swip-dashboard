/**
 * Modern Leaderboard Component
 *
 * Compact, professional leaderboard with clickable app details, countdown, and sharing
 */

"use client";

import { useState } from "react";
import { Badge } from "./ui/Badge";
import { LeaderboardCountdown } from "./LeaderboardCountdown";
import { ShareButtons } from "./ShareButtons";

interface LeaderboardEntry {
  rank: number;
  appId?: string;
  appName: string;
  category?: string;
  developer?: string;
  developerId?: string;
  appSwipScore: number;
  avgStressRate?: number;
  avgDuration?: number;
  sessions: number;
  trend: "up" | "down" | "neutral";
}

interface DeveloperData {
  rank?: number;
  name: string;
  email: string;
  avgSwipHrv: number;
  totalApps: number;
  avgHrv: string;
  sessions: number;
  trend: "up" | "down";
}

interface CategoryData {
  rank?: number;
  category: string;
  avgSwipScore: number;
  avgStressRate: number;
  totalApps: number;
  totalSessions: number;
  trend: "up" | "down";
}

interface ModernLeaderboardProps {
  entries: LeaderboardEntry[];
  developerData: DeveloperData[];
  categoryData: CategoryData[];
  stats: {
    totalApps: number;
    averageSwipScore: number;
    totalUsers: number;
    newUsers: number;
    stressRate: number;
    activeSessions: number;
  };
  expiresAt: string;
  currentUserId?: string;
}

export function ModernLeaderboard({
  entries,
  developerData,
  categoryData,
  stats,
  expiresAt,
  currentUserId,
}: ModernLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<
    "apps" | "developers" | "categories"
  >("apps");
  const [selectedApp, setSelectedApp] = useState<LeaderboardEntry | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareApp, setCompareApp] = useState<LeaderboardEntry | null>(null);

  // Assemble full leaderboard data for export
  const fullLeaderboardData = {
    entries,
    developerData,
    categoryData,
    stats,
  };

  const isAppOwner = (entry: LeaderboardEntry) => {
    return currentUserId && entry.developerId === currentUserId;
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 85) return "from-purple-500 to-purple-600";
    if (score >= 70) return "from-blue-500 to-blue-600";
    if (score >= 60) return "from-pink-500 to-pink-600";
    return "from-red-500 to-red-600";
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { emoji: "🥇", color: "text-yellow-400" };
    if (rank === 2) return { emoji: "🥈", color: "text-gray-400" };
    if (rank === 3) return { emoji: "🥉", color: "text-orange-400" };
    return { emoji: "", color: "text-gray-500" };
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds || seconds === 0) return "N/A";
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    if (minutes === 0) return `${totalSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6" data-screenshot-container>
      {/* Compact Header with Countdown and Share */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              SWIP
            </span>
            <span className="text-white">
              {" "}Global Leaderboard
            </span>
          </h1>
          <p className="text-gray-400">
            Real-time rankings updated every hour.
          </p>
        </div>

        {/* Countdown Timer and Share */}
        <div className="flex items-center gap-3">
          <LeaderboardCountdown expiresAt={expiresAt} />
          <ShareButtons
            type="leaderboard"
            leaderboardData={fullLeaderboardData}
          />
        </div>
      </div>

      {/* Modern Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Apps */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-pink-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Apps</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalApps.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">Last hour</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-blue-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-white">
                {stats.activeSessions >= 1000000
                  ? `${(stats.activeSessions / 1000000).toFixed(1)}M`
                  : stats.activeSessions >= 1000
                    ? `${(stats.activeSessions / 1000).toFixed(1)}K`
                    : stats.activeSessions.toString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">All time</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Avg SWIP Score */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-purple-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Avg SWIP Score</p>
              <p className="text-3xl font-bold text-white">
                {stats.averageSwipScore?.toFixed(1) || "0.0"}
              </p>
              <p className="text-gray-500 text-xs mt-1">All time</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 group hover:border-green-500/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalUsers >= 1000000
                  ? `${(stats.totalUsers / 1000000).toFixed(1)}M`
                  : stats.totalUsers >= 1000
                    ? `${(stats.totalUsers / 1000).toFixed(1)}K`
                    : stats.totalUsers.toString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">All time</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Table with Tabs */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
        {/* Tabs */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("apps")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === "apps"
                  ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Top Applications
            </button>
            <button
              onClick={() => setActiveTab("developers")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === "developers"
                  ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
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
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              Top Developers
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === "categories"
                  ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Category Leaders
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          {activeTab === "apps" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-800/50">
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Rank
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      App
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Category
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Avg SWIP Score
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Stress Rate
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Sessions
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-400"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    entries.slice(0, 50).map((entry) => {
                      const rankDisplay = getRankDisplay(entry.rank);
                      return (
                        <tr
                          key={entry.rank}
                          onClick={() => setSelectedApp(entry)}
                          className="border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {rankDisplay.emoji && (
                                <span className="text-xl">
                                  {rankDisplay.emoji}
                                </span>
                              )}
                              <span
                                className={`text-sm font-bold ${rankDisplay.color}`}
                              >
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-white font-medium">
                              {entry.appName}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge variant="default" size="sm">
                              {entry.category || "Other"}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-semibold w-12">
                                {entry.appSwipScore?.toFixed(1) || "0.0"}
                              </span>
                              <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${getScoreBarColor(entry.appSwipScore || 0)} rounded-full transition-all duration-500`}
                                  style={{
                                    width: `${Math.min(entry.appSwipScore || 0, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-gray-300">
                              {entry.avgStressRate?.toFixed(1) || "N/A"}%
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-white font-medium">
                              {entry.sessions?.toLocaleString() || "0"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isAppOwner(entry) && (
                                <div className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ShareButtons
                                    type="app"
                                    appName={entry.appName}
                                    rank={entry.rank}
                                    score={entry.appSwipScore}
                                  />
                                </div>
                              )}
                              <svg
                                className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "developers" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-800/50">
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Rank
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Developer
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Avg SWIP Score
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Total Apps
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400 text-right">
                      Sessions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {developerData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-gray-400"
                      >
                        No developer data available
                      </td>
                    </tr>
                  ) : (
                    developerData.map((dev, index) => {
                      const rankDisplay = getRankDisplay(dev.rank || index + 1);
                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {rankDisplay.emoji && (
                                <span className="text-lg">{rankDisplay.emoji}</span>
                              )}
                              <span className={`text-white font-bold ${rankDisplay.color}`}>
                                #{dev.rank || index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                {dev.name?.[0]?.toUpperCase() || "D"}
                              </div>
                              <span className="text-white font-medium">
                                {dev.name || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-white font-semibold">
                              {dev.avgSwipHrv?.toFixed(1) || "N/A"}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge variant="info" size="sm">
                              {dev.totalApps || 0}
                            </Badge>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-white font-medium">
                              {dev.sessions?.toLocaleString() || "0"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-800/50">
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Rank
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Category
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Avg SWIP Score
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Avg Stress Rate
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400">
                      Total Apps
                    </th>
                    <th className="pb-4 text-sm font-semibold text-purple-400 text-right">
                      Sessions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-400"
                      >
                        No category data available
                      </td>
                    </tr>
                  ) : (
                    categoryData.map((cat, index) => {
                      const rankDisplay = getRankDisplay(cat.rank || index + 1);
                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {rankDisplay.emoji && (
                                <span className="text-lg">{rankDisplay.emoji}</span>
                              )}
                              <span className={`text-white font-bold ${rankDisplay.color}`}>
                                #{cat.rank || index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-white font-medium text-lg">
                              {cat.category}
                            </span>
                          </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-semibold w-12">
                              {cat.avgSwipScore?.toFixed(1) || "0.0"}
                            </span>
                            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getScoreBarColor(cat.avgSwipScore || 0)} rounded-full`}
                                style={{
                                  width: `${Math.min(cat.avgSwipScore || 0, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-300">
                            {cat.avgStressRate?.toFixed(1) || "0.0"}%
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge variant="info" size="sm">
                            {cat.totalApps || 0}
                          </Badge>
                        </td>
                          <td className="py-4 text-right">
                            <span className="text-white font-medium">
                              {cat.totalSessions?.toLocaleString() || "0"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* App Detail Panel (similar to Sessions) */}
      {selectedApp && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setSelectedApp(null)}
          />

          {/* Slide-in Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-[#0A0118] border-l border-gray-800 z-50 overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 bg-[#0A0118] border-b border-gray-800 p-8 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedApp.appName}
                    </h2>
                    <div className="flex items-center gap-2">
                      {getRankDisplay(selectedApp.rank).emoji && (
                        <span className="text-2xl">
                          {getRankDisplay(selectedApp.rank).emoji}
                        </span>
                      )}
                      <span
                        className={`text-lg font-bold ${getRankDisplay(selectedApp.rank).color}`}
                      >
                        Rank #{selectedApp.rank}
                      </span>
                    </div>
                  </div>
                  <Badge variant="default">
                    {selectedApp.category || "Other"}
                  </Badge>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-8 space-y-8">
              {/* SWIP Score Hero */}
              <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="relative z-10 text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    Average SWIP Score
                  </p>
                  <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4">
                    {selectedApp.appSwipScore?.toFixed(1) || "0.0"}
                  </div>
                  <div className="w-full max-w-md mx-auto h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(selectedApp.appSwipScore || 0, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 rounded-xl bg-black/30 border border-gray-800">
                      <p className="text-gray-400 text-xs mb-1">
                        Total Sessions
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {selectedApp.sessions?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-black/30 border border-gray-800">
                      <p className="text-gray-400 text-xs mb-1">Avg Duration</p>
                      <p className="text-2xl font-bold text-white">
                        {formatDuration(selectedApp.avgDuration)}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-black/30 border border-gray-800">
                      <p className="text-gray-400 text-xs mb-1">Avg Stress</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedApp.avgStressRate?.toFixed(1) || "N/A"}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/30">
                  <p className="text-gray-400 text-xs mb-2">Category</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedApp.category || "Other"}
                  </p>
                </div>
                <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/30">
                  <p className="text-gray-400 text-xs mb-2">Developer</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedApp.developer || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">
                  Performance Metrics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Wellness Impact */}
                  <div className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <svg
                          className="w-5 h-5 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-white">
                        Wellness Impact
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          SWIP Score
                        </span>
                        <span className="text-white font-semibold">
                          {selectedApp.appSwipScore?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Grade</span>
                        <span className="text-purple-400 text-sm font-medium">
                          {(selectedApp.appSwipScore || 0) >= 85
                            ? "Excellent"
                            : (selectedApp.appSwipScore || 0) >= 70
                              ? "Good"
                              : (selectedApp.appSwipScore || 0) >= 60
                                ? "Moderate"
                                : "Low"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Engagement */}
                  <div className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-blue-900/10 to-cyan-900/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <svg
                          className="w-5 h-5 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-white">
                        User Engagement
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          Total Sessions
                        </span>
                        <span className="text-white font-semibold">
                          {selectedApp.sessions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Trend</span>
                        <div className="flex items-center gap-1">
                          {selectedApp.trend === "up" ? (
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span
                            className={
                              selectedApp.trend === "up"
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {selectedApp.trend === "up" ? "Rising" : "Falling"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {selectedApp.appId ? (
                  <a
                    href={`/app/${selectedApp.appId}/sessions`}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all text-center flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    View All Sessions
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 rounded-lg bg-gray-700 text-gray-400 font-semibold cursor-not-allowed text-center"
                  >
                    Sessions Not Available
                  </button>
                )}
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`flex-1 px-6 py-3 rounded-lg border border-gray-800 text-white font-semibold transition-all ${
                    compareMode
                      ? "bg-purple-600 border-purple-500"
                      : "bg-gray-900/30 hover:bg-gray-800/50"
                  }`}
                >
                  {compareMode ? "Exit Compare" : "Compare Apps"}
                </button>
              </div>

              {/* Compare App Selector */}
              {compareMode && (
                <div className="mt-6 p-6 rounded-2xl border border-purple-500/30 bg-purple-900/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Select an app to compare with {selectedApp.appName}
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {entries
                      .filter((app) => app.appId !== selectedApp.appId)
                      .slice(0, 10)
                      .map((app) => (
                        <button
                          key={app.appId}
                          onClick={() => {
                            setCompareApp(app);
                            setCompareMode(false);
                          }}
                          className="w-full p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500">#{app.rank}</span>
                              <span className="text-white font-medium">
                                {app.appName}
                              </span>
                              <Badge variant="default" size="sm">
                                {app.category}
                              </Badge>
                            </div>
                            <span className="text-purple-400 font-semibold">
                              {app.appSwipScore?.toFixed(1)}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Comparison View */}
              {compareApp && !compareMode && (
                <div className="mt-6 p-6 rounded-2xl border border-gray-800 bg-gray-900/30">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      Comparison: {selectedApp.appName} vs {compareApp.appName}
                    </h3>
                    <button
                      onClick={() => setCompareApp(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* SWIP Score Comparison */}
                    <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                      <p className="text-gray-400 text-sm mb-2">SWIP Score</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">
                              {selectedApp.appName}
                            </span>
                            <span className="text-purple-400 font-bold">
                              {selectedApp.appSwipScore?.toFixed(1)}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{
                                width: `${Math.min(selectedApp.appSwipScore || 0, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">
                              {compareApp.appName}
                            </span>
                            <span className="text-blue-400 font-bold">
                              {compareApp.appSwipScore?.toFixed(1)}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                              style={{
                                width: `${Math.min(compareApp.appSwipScore || 0, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="text-center">
                          <span className="text-gray-400 text-xs">
                            Difference:{" "}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              (selectedApp.appSwipScore || 0) >
                              (compareApp.appSwipScore || 0)
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {Math.abs(
                              (selectedApp.appSwipScore || 0) -
                                (compareApp.appSwipScore || 0),
                            ).toFixed(1)}{" "}
                            points
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sessions Comparison */}
                    <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                      <p className="text-gray-400 text-sm mb-2">
                        Total Sessions
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">
                            {selectedApp.appName}
                          </span>
                          <span className="text-purple-400 font-bold">
                            {selectedApp.sessions?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">
                            {compareApp.appName}
                          </span>
                          <span className="text-blue-400 font-bold">
                            {compareApp.sessions?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="text-center">
                          <span className="text-gray-400 text-xs">
                            Difference:{" "}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              (selectedApp.sessions || 0) >
                              (compareApp.sessions || 0)
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {Math.abs(
                              (selectedApp.sessions || 0) -
                                (compareApp.sessions || 0),
                            ).toLocaleString()}{" "}
                            sessions
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stress Rate Comparison */}
                    <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                      <p className="text-gray-400 text-sm mb-2">
                        Avg Stress Rate
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">
                            {selectedApp.appName}
                          </span>
                          <span className="text-purple-400 font-bold">
                            {selectedApp.avgStressRate?.toFixed(1) || "N/A"}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">
                            {compareApp.appName}
                          </span>
                          <span className="text-blue-400 font-bold">
                            {compareApp.avgStressRate?.toFixed(1) || "N/A"}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="text-center">
                          <span className="text-gray-400 text-xs">
                            Lower is better. Difference:{" "}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              (selectedApp.avgStressRate || 0) <
                              (compareApp.avgStressRate || 0)
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {Math.abs(
                              (selectedApp.avgStressRate || 0) -
                                (compareApp.avgStressRate || 0),
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rank Comparison */}
                    <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                      <p className="text-gray-400 text-sm mb-2">
                        Leaderboard Rank
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">
                            {selectedApp.appName}
                          </span>
                          <span className="text-purple-400 font-bold">
                            #{selectedApp.rank}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">
                            {compareApp.appName}
                          </span>
                          <span className="text-blue-400 font-bold">
                            #{compareApp.rank}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="text-center">
                          <span className="text-gray-400 text-xs">
                            Rank difference:{" "}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              selectedApp.rank < compareApp.rank
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {Math.abs(selectedApp.rank - compareApp.rank)}{" "}
                            positions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
