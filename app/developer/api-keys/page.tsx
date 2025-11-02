"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../src/lib/auth-client";

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
  revoked: boolean;
  app: {
    id: string;
    name: string;
  };
}

interface App {
  id: string;
  name: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      if (session && 'data' in session && session.data?.user?.id) {
        setIsAuthenticated(true);
      } else {
        router.push("/auth");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/auth");
    }
  };

  useEffect(() => {
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      const [keysResponse, appsResponse] = await Promise.all([
        fetch("/api/api-keys"),
        fetch("/api/apps"),
      ]);

      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        setKeys(keysData.keys || []);
      }

      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApps(appsData.apps || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleKeyGenerated = () => {
    fetchData();
  };

  const handleCopy = async (keyId: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">API Keys</h1>
        <p className="text-sm text-gray-600 mt-2">
          Manage your API keys for authentication. Generate new keys from the Apps page.
        </p>
      </div>

      {apps.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h3 className="font-medium text-gray-900 mb-1">No Apps Found</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create an app first before generating API keys.
          </p>
          <a
            href="/developer/apps"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Apps
          </a>
        </div>
      )}

      {apps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Your API Keys</h2>
            {keys.length > 0 && (
              <span className="text-sm text-gray-500">
                {keys.filter(k => !k.revoked).length} active key{keys.filter(k => !k.revoked).length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading API keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="font-medium text-gray-900 mb-1">No API Keys Yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Generate your first API key from the Apps page by clicking the "Generate API Key" button on any app.
              </p>
              <a
                href="/developer/apps"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Apps
              </a>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">App</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Key</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Created</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{key.app?.name ?? "-"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">ID: {key.app?.id}</div>
                      </td>
                      <td className="p-4">
                        <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {key.key.slice(0, 12)}••••••••{key.key.slice(-4)}
                        </code>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(key.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            key.revoked
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {key.revoked ? "Revoked" : "Active"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleCopy(key.id, key.key)}
                          disabled={key.revoked}
                          aria-label="Copy API key"
                          title={key.revoked ? "Key revoked" : "Copy API key"}
                        >
                          {copiedKeyId === key.id ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Copied
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                              Copy
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
