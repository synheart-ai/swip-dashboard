"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateAppForm from "../../../components/CreateAppForm";
import { authClient } from "../../../src/lib/auth-client";

interface App {
  id: string;
  name: string;
  createdAt: string;
}

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      if (session?.user?.id) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apps.map((app) => (
              <div key={app.id} className="border rounded-2xl p-4">
                <div className="font-medium">{app.name}</div>
                <div className="text-xs text-gray-500 mt-1">ID: {app.id}</div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(app.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    className="px-3 py-1.5 rounded-md border text-xs hover:bg-gray-50"
                    onClick={() => handleRename(app.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-md border text-xs hover:bg-red-50 text-red-600 border-red-200"
                    onClick={() => handleDelete(app.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
