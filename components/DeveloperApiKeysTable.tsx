/**
 * Developer API Keys Table Component
 *
 * Displays and manages API keys with enhanced features
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { GenerateApiKeyModal } from './GenerateApiKeyModal';

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
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

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

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to revoke key:', error);
    }
  };

  // Mock permissions count
  const getPermissionsCount = () => {
    return Math.floor(Math.random() * 20) + 30;
  };

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">API Keys</h2>
          <p className="text-sm text-gray-400">
            Manage your API keys and access permissions
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowNewKeyModal(true)}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
          </svg>
          Generate New Key
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-800/50">
              <th className="pb-4 text-sm font-semibold text-purple-400">Key Name</th>
              <th className="pb-4 text-sm font-semibold text-purple-400">API Key</th>
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
                  No API keys generated yet. Click "Generate New Key" to create one!
                </td>
              </tr>
            ) : (
              apiKeys.map((key, index) => {
                const keyName = ['Production Key', 'Development Key', 'Staging Key'][index % 3];

                return (
                  <tr
                    key={key.id}
                    className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                  >
                    {/* Key Name */}
                    <td className="py-4">
                      <span className="text-white font-medium">{keyName}</span>
                    </td>

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
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleRevoke(key.id)}
                        disabled={key.revoked}
                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
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
            <h4 className="text-blue-400 font-medium mb-1">Security Notice</h4>
            <p className="text-sm text-gray-300">
              API keys are displayed only once upon creation. Store them securely and never share them publicly.
              If a key is compromised, revoke it immediately and generate a new one.
            </p>
          </div>
        </div>
      </div>

      {/* Generate API Key Modal */}
      <GenerateApiKeyModal
        isOpen={showNewKeyModal}
        onClose={() => setShowNewKeyModal(false)}
        onSuccess={handleSuccess}
        apps={apps}
      />
    </div>
  );
}
