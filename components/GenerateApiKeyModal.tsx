/**
 * Generate API Key Modal
 *
 * Modal for generating a new API key
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface GenerateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  apps: Array<{ id: string; name: string }>;
  preselectedAppId?: string;
}

export function GenerateApiKeyModal({ isOpen, onClose, onSuccess, apps, preselectedAppId }: GenerateApiKeyModalProps) {
  const [keyName, setKeyName] = useState('');
  const [selectedAppId, setSelectedAppId] = useState(preselectedAppId || '');
  const [platformIntegrations, setPlatformIntegrations] = useState({
    real: false,
    web: false,
    delete: false,
  });
  const [environment, setEnvironment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update selected app when preselectedAppId changes
  useEffect(() => {
    if (preselectedAppId) {
      setSelectedAppId(preselectedAppId);
    }
  }, [preselectedAppId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure modal animation completes
      const resetTimeout = setTimeout(() => {
        setKeyName('');
        setSelectedAppId(preselectedAppId || '');
        setPlatformIntegrations({ real: false, web: false, delete: false });
        setEnvironment('');
        setNewApiKey('');
        setShowKey(false);
        setCopied(false);
        setError('');
      }, 300);

      return () => clearTimeout(resetTimeout);
    }
  }, [isOpen, preselectedAppId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCheckboxChange = (platform: 'real' | 'web' | 'delete') => {
    setPlatformIntegrations(prev => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: selectedAppId,
          keyName,
          platformIntegrations,
          environment,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate API key');
      }

      // Show the new API key
      setNewApiKey(data.apiKey);
      setShowKey(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newApiKey);
    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleClose = () => {
    // Call onSuccess and onClose first
    onSuccess?.();
    onClose();
    // State cleanup will be handled by the useEffect watching isOpen
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="space-y-6">
        {!showKey ? (
          <>
            {/* Icon and Title */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-synheart-pink to-synheart-blue flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Generate API Key</h2>
              <p className="text-gray-400 text-sm">
                Create a new API key for secure authentication
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Associated App (Read-only) */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">Generating key for</p>
                    <p className="text-white font-semibold">
                      {apps.find(app => app.id === selectedAppId)?.name || 'Unknown App'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Name <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production Key, Development Key"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
                />
              </div>

              {/* Platform Integrations */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Platform Integrations
                </label>
                <div className="space-y-2.5">
                  {/* Real - Authentication and encryption */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={platformIntegrations.real}
                        onChange={() => handleCheckboxChange('real')}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 peer-checked:bg-synheart-pink peer-checked:border-synheart-pink transition-all flex items-center justify-center">
                        {platformIntegrations.real && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">Real - Authentication and encryption</div>
                    </div>
                  </label>

                  {/* Web - Client and mobile sessions */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={platformIntegrations.web}
                        onChange={() => handleCheckboxChange('web')}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 peer-checked:bg-synheart-pink peer-checked:border-synheart-pink transition-all flex items-center justify-center">
                        {platformIntegrations.web && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">Web - Client and mobile sessions</div>
                    </div>
                  </label>

                  {/* Delete - Remove sessions and data */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={platformIntegrations.delete}
                        onChange={() => handleCheckboxChange('delete')}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 peer-checked:bg-synheart-pink peer-checked:border-synheart-pink transition-all flex items-center justify-center">
                        {platformIntegrations.delete && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">Delete - Remove sessions and data</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Environment */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="">Production (SL-MLJ)</option>
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={!selectedAppId}
                >
                  Generate Key
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Success Screen */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">API Key Generated!</h2>
              <p className="text-gray-400 text-sm">
                Copy this key now. You won't be able to see it again.
              </p>
            </div>

            {/* API Key Display */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Your API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-900 text-synheart-pink text-sm rounded font-mono break-all">
                    {newApiKey}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    {copied ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-red-400 font-medium mb-1">Save This Key Now</h4>
                    <p className="text-sm text-gray-300">
                      This is the only time you'll see this key. Make sure to copy it before closing this window.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleClose}
              >
                Done - I've Saved My Key
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
