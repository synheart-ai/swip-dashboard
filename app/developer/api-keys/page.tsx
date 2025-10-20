"use client";

import { useState, useEffect } from "react";
import GenerateApiKeyForm from "../../../components/GenerateApiKeyForm";

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
    fetchData();
  }, []);

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
      <h1 className="text-xl font-semibold">API Keys</h1>
      <p className="text-sm text-gray-600">Use keys to authenticate ingestion requests.</p>

      <div className="border rounded-2xl p-6">
        <h2 className="font-medium mb-4">Generate New API Key</h2>
        {apps.length === 0 ? (
          <p className="text-sm text-gray-500">Create an app first to generate API keys.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select an app to generate an API key for:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {apps.map((app) => (
                <div key={app.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{app.name}</div>
                    <div className="text-xs text-gray-500">ID: {app.id}</div>
                  </div>
                  <GenerateApiKeyForm appId={app.id} onKeyGenerated={handleKeyGenerated} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-medium mb-4">Your API Keys</h2>
        {isLoading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="text-gray-500 text-sm">No API keys yet. Generate one above.</div>
        ) : (
          <table className="w-full text-sm border rounded-2xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">App</th>
                <th className="text-left p-3">Key</th>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-t">
                  <td className="p-3">{key.app?.name ?? "-"}</td>
                  <td className="p-3 font-mono text-xs">
                    {key.key.slice(0, 8)}••••••••{key.key.slice(-8)}
                  </td>
                  <td className="p-3">{new Date(key.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      key.revoked 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {key.revoked ? "Revoked" : "Active"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1.5 rounded-md border text-xs hover:bg-gray-50 active:scale-[.99] transition"
                      onClick={() => handleCopy(key.id, key.key)}
                      disabled={key.revoked}
                      aria-label="Copy API key"
                      title={key.revoked ? "Key revoked" : "Copy API key"}
                    >
                      {copiedKeyId === key.id ? "Copied" : "Copy"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
