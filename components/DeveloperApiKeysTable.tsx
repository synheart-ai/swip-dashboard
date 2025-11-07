/**
 * Developer API Keys Table Component
 *
 * Displays and manages API keys with enhanced features
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/Badge';

interface ApiKeyData {
  id: string;
  preview: string;
  appName: string;
  createdAt: Date;
  lastUsed: Date | null;
  revoked: boolean;
}

interface DeveloperApiKeysTableProps {
  apiKeys: ApiKeyData[];
  apps: Array<{ id: string; name: string }>;
}

export function DeveloperApiKeysTable({ apiKeys, apps }: DeveloperApiKeysTableProps) {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const router = useRouter();

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(date);
  };

  const copyToClipboard = (keyId: string, preview: string) => {
    navigator.clipboard.writeText(preview);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleToggleRevoke = async (keyId: string, currentlyRevoked: boolean) => {
    const action = currentlyRevoked ? 'reactivate' : 'revoke';
    const confirmMessage = currentlyRevoked 
      ? 'Are you sure you want to reactivate this API key?'
      : 'Are you sure you want to revoke this API key? It will stop working immediately.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || `Failed to ${action} key`);
      }
    } catch (error) {
      console.error(`Failed to ${action} key:`, error);
      alert(`An error occurred while trying to ${action} the key`);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY DELETE this API key? This action cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete key');
      }
    } catch (error) {
      console.error('Failed to delete key:', error);
      alert('An error occurred while trying to delete the key');
    }
  };

  // Mock permissions count
  const getPermissionsCount = () => {
    return Math.floor(Math.random() * 20) + 30;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">API Keys</h2>
          <p className="text-sm text-gray-400">
            View and manage your existing API keys. Generate new keys from the Apps tab.
          </p>
        </div>
      </div>

      {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
            <tr className="text-left border-b border-gray-800/50">
              <th className="pb-4 text-sm font-semibold text-purple-400">API Key</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">Associated App</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">Status</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">Last Used</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">Created</th>
              <th className="pb-4 text-sm font-semibold text-purple-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.length === 0 ? (
                <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No API keys generated yet. Go to Apps tab and click "Generate Key" for an app!
                  </td>
                </tr>
              ) : (
                apiKeys.map((key, index) => {
                  return (
                    <tr
                      key={key.id}
                    className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                    >
                      {/* API Key with Copy Button */}
                    <td className="py-4">
                        <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-800/50 text-purple-400 text-xs rounded font-mono border border-gray-700">
                          {key.preview.length > 16 ? `${key.preview.substring(0, 16)}...` : key.preview}
                          </code>
                          <button
                            onClick={() => copyToClipboard(key.id, key.preview)}
                          className="text-gray-400 hover:text-purple-400 transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedKeyId === key.id ? (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>

                    {/* Associated App */}
                    <td className="py-4">
                      <span className="text-white text-sm font-medium">{key.appName}</span>
                      </td>

                      {/* Status */}
                    <td className="py-4">
                        {key.revoked ? (
                        <Badge variant="danger" dot size="sm">
                            Inactive
                          </Badge>
                        ) : (
                        <Badge variant="success" dot size="sm">
                            Active
                          </Badge>
                        )}
                      </td>

                      {/* Last Used */}
                    <td className="py-4">
                        {key.lastUsed ? (
                          <span className="text-white text-sm">
                            {getTimeSince(key.lastUsed)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Never used</span>
                        )}
                      </td>

                      {/* Created */}
                    <td className="py-4">
                        <span className="text-gray-400 text-sm">
                          {formatDate(key.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Revoke/Reactivate Button */}
                        <button
                          onClick={() => handleToggleRevoke(key.id, key.revoked)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium border ${
                            key.revoked
                              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border-green-500/30'
                              : 'bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border-orange-500/30'
                          }`}
                          title={key.revoked ? "Reactivate API Key" : "Revoke API Key"}
                        >
                          {key.revoked ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Reactivate</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              <span>Revoke</span>
                            </>
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all text-sm font-medium border border-red-500/30"
                          title="Permanently Delete API Key"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-blue-400 font-medium mb-1">API Key Management</h4>
            <p className="text-sm text-gray-300">
              <strong>Revoke:</strong> Temporarily disable a key (can be reactivated later).<br/>
              <strong>Reactivate:</strong> Re-enable a revoked key.<br/>
              <strong>Delete:</strong> Permanently remove a key from the database (cannot be undone).<br/>
              <br/>
              Generate new keys from the Apps tab. Keys are displayed only once upon creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
