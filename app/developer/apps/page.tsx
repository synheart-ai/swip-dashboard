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

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedAppForApiKey, setSelectedAppForApiKey] = useState<string | null>(null);
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
        setApps(data.apps || []);
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
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Apps</h1>
      <p className="text-sm text-gray-600">Create and manage projects that send SWIP data.</p>
      
      <div className="border rounded-2xl p-6">
        <h2 className="font-medium mb-4">Create New App</h2>
        <CreateAppForm onAppCreated={handleAppCreated} />
      </div>

      <div>
        <h2 className="font-medium mb-4">Your Apps</h2>
        {isLoading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : apps.length === 0 ? (
          <div className="text-gray-500 text-sm">No apps yet. Create your first app above.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{app.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">ID: {app.id}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-4">
                  Created: {new Date(app.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleGenerateApiKey(app.id)}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                    Generate API Key
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                    onClick={() => handleRename(app.id)}
                    title="Rename app"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(app.id)}
                    title="Delete app"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
