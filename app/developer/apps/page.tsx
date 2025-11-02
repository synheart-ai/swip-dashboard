"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateAppForm from "../../../components/CreateAppForm";
import { authClient } from "../../../src/lib/auth-client";
import { GenerateApiKeyModal } from "../../../components/GenerateApiKeyModal";

interface App {
  id: string;
  name: string;
  createdAt: string;
}

interface AppPerformance {
  sessions: {
    current: number;
    last: number;
    growth: number;
  };
  score: {
    current: number;
    last: number;
    improvement: number;
  };
  apiKeys: {
    active: number;
  };
  engagement: {
    rate: number;
    daysSinceLastActivity: number;
  };
}

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedAppForApiKey, setSelectedAppForApiKey] = useState<string | null>(null);
  const [showCreateAppModal, setShowCreateAppModal] = useState(false);
  const [appPerformance, setAppPerformance] = useState<Record<string, AppPerformance>>({});
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      if (session && 'data' in session && session.data?.user?.id) {
        setIsAuthenticated(true);
      } else {
        router.push('/auth');
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push('/auth');
    }
  };

  useEffect(() => {
    checkAuth();
  }, [router]);

  const fetchApps = async () => {
    try {
      const response = await fetch("/api/apps");
      if (response.ok) {
        const data = await response.json();
        const fetchedApps = data.apps || [];
        setApps(fetchedApps);
        
        // Fetch performance data for each app
        fetchedApps.forEach(async (app: App) => {
          try {
            const perfResponse = await fetch(`/api/apps/${app.id}/performance`);
            if (perfResponse.ok) {
              const perfData = await perfResponse.json();
              if (perfData.success) {
                setAppPerformance(prev => ({
                  ...prev,
                  [app.id]: perfData.performance
                }));
              }
            }
          } catch (error) {
            console.error(`Error fetching performance for app ${app.id}:`, error);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
    }
  }, [isAuthenticated]);

  const handleAppCreated = () => {
    fetchApps();
  };

  const handleRename = async (id: string) => {
    const current = apps.find(a => a.id === id)?.name || "";
    const name = prompt("Rename app", current)?.trim();
    if (!name || name === current) return;
    try {
      const res = await fetch(`/api/apps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) fetchApps();
    } catch (e) {
      console.error("Rename failed", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this app? This also removes sessions, keys, and leaderboard snapshots.")) return;
    try {
      const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
      if (res.ok) fetchApps();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleGenerateApiKey = (appId: string) => {
    setSelectedAppForApiKey(appId);
    setShowApiKeyModal(true);
  };

  const handleApiKeyGenerated = () => {
    setShowApiKeyModal(false);
    setSelectedAppForApiKey(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
              <p className="text-gray-600">Manage your apps and generate API keys for SWIP integration</p>
            </div>
            <button
              onClick={() => setShowCreateAppModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New App
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Apps</p>
                <p className="text-3xl font-bold text-gray-900">{apps.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Apps</p>
                <p className="text-3xl font-bold text-green-600">{apps.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quick Action</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">Generate API Key</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
            {apps.length > 0 && (
              <p className="text-sm text-gray-500">{apps.length} {apps.length === 1 ? 'app' : 'apps'} registered</p>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading your applications...</p>
            </div>
          ) : apps.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by creating your first application. Once created, you'll be able to generate API keys and start integrating SWIP data.
              </p>
              <button
                onClick={() => setShowCreateAppModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First App
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {apps.map((app) => {
                const perf = appPerformance[app.id];
                return (
                  <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-bold text-lg">{app.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate">{app.name}</h3>
                          <p className="text-xs text-gray-500 font-mono truncate">ID: {app.id}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 flex-shrink-0">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    
                    {/* Performance Insights */}
                    {perf && (
                      <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-100">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">Sessions</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-900">{perf.sessions.current}</span>
                            {perf.sessions.growth !== 0 && (
                              <span className={`text-xs font-semibold ${perf.sessions.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {perf.sessions.growth > 0 ? '↑' : '↓'}{Math.abs(perf.sessions.growth)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">this month</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">SWIP Score</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-900">{perf.score.current.toFixed(1)}</span>
                            {perf.score.improvement !== 0 && (
                              <span className={`text-xs font-semibold ${perf.score.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {perf.score.improvement > 0 ? '↑' : '↓'}{Math.abs(perf.score.improvement).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">avg score</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">Engagement</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-900">{perf.engagement.rate.toFixed(1)}</span>
                            <span className="text-xs text-gray-600">/day</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {perf.engagement.daysSinceLastActivity === 0 
                              ? 'active today' 
                              : `${perf.engagement.daysSinceLastActivity}d ago`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created {new Date(app.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {perf && perf.apiKeys.active > 0 && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                          </svg>
                          {perf.apiKeys.active} API {perf.apiKeys.active === 1 ? 'key' : 'keys'}
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        className="col-span-3 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                        onClick={() => handleGenerateApiKey(app.id)}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                        Generate API Key
                      </button>
                      <button
                        className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
                        onClick={() => handleRename(app.id)}
                        title="Rename app"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        className="col-span-2 px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
                        onClick={() => handleDelete(app.id)}
                        title="Delete app"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete App
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create App Modal */}
      <CreateAppForm 
        isOpen={showCreateAppModal} 
        onClose={() => setShowCreateAppModal(false)} 
        onAppCreated={handleAppCreated} 
      />

      {/* Generate API Key Modal */}
      {showApiKeyModal && selectedAppForApiKey && (
        <GenerateApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => {
            setShowApiKeyModal(false);
            setSelectedAppForApiKey(null);
          }}
          onSuccess={handleApiKeyGenerated}
          apps={apps.map(app => ({ id: app.id, name: app.name }))}
          preselectedAppId={selectedAppForApiKey}
        />
      )}
    </div>
  );
}
