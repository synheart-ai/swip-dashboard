/**
 * Register App Side Panel
 *
 * Sliding panel from the right for app registration (like SessionDetailPanel)
 */

'use client';

import { useState } from 'react';

interface RegisterAppPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegisterAppPanel({ isOpen, onClose, onSuccess }: RegisterAppPanelProps) {
  const [formData, setFormData] = useState({
    appName: '',
    category: 'Health',
    description: '',
    os: '',
    appId: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [error, setError] = useState('');

  const handleFetchMetadata = async () => {
    if (!formData.os || !formData.appId) {
      setError('Please select OS and enter App ID to fetch metadata');
      return;
    }

    setFetchingMetadata(true);
    setError('');

    try {
      const response = await fetch('/api/apps/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          os: formData.os,
          appId: formData.appId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch app metadata');
      }

      if (data.metadata) {
        setFormData(prev => ({
          ...prev,
          appName: data.metadata.name || prev.appName,
          category: data.metadata.category || prev.category,
          description: data.metadata.description || prev.description,
        }));
      }
    } catch (err: any) {
      console.error('Metadata fetch error:', err);
      setError(err.message || 'Could not fetch app metadata. Please fill in manually.');
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.appName,
          category: formData.category,
          description: formData.description,
          os: formData.os,
          appId: formData.appId,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server. Please ensure you are logged in.');
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to register app');
      }

      // Reset form
      setFormData({
        appName: '',
        category: 'Health',
        description: '',
        os: '',
        appId: '',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('App registration error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 !mt-0 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-2xl !mt-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto border-l border-gray-800"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-8 z-10 border-b border-purple-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Register New App</h2>
                <p className="text-purple-100 text-sm">Connect your application to the SWIP platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* App Information */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                App Information
              </h3>

              <div className="space-y-4">
                {/* OS Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operating System <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <select
                    value={formData.os}
                    onChange={(e) => handleChange('os', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                  >
                    <option value="">Select OS...</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="web">Web</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Select the platform your app runs on</p>
                </div>

                {/* App ID / Package Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    App ID / Package Name <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.appId}
                      onChange={(e) => handleChange('appId', e.target.value)}
                      placeholder={formData.os === 'android' ? 'com.example.app' : formData.os === 'ios' ? 'com.company.appname' : 'App ID'}
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                    {formData.os && formData.appId && (formData.os === 'android' || formData.os === 'ios') && (
                      <button
                        type="button"
                        onClick={handleFetchMetadata}
                        disabled={fetchingMetadata}
                        className="px-4 py-3 rounded-xl bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                      >
                        {fetchingMetadata ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Auto-fill
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.os === 'android' && 'Enter package name (e.g., com.example.myapp)'}
                    {formData.os === 'ios' && 'Enter bundle ID (e.g., com.company.appname)'}
                    {!formData.os && 'Package name for Android, Bundle ID for iOS'}
                  </p>
                </div>

                {/* App Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    App Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.appName}
                    onChange={(e) => handleChange('appName', e.target.value)}
                    placeholder="My Wellness App"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">Choose a unique name for your application</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                  >
                    <option value="Health">Health & Wellness</option>
                    <option value="Communication">Communication</option>
                    <option value="Game">Gaming</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Select the category that best fits your app</p>
                </div>

                {/* Description (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your app and how it uses SWIP..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                What Happens Next?
              </h3>
              <ul className="space-y-3">
                {[
                  'Your app will be registered in the SWIP platform',
                  'Generate an API key to start sending data',
                  'Integrate the SWIP SDK into your application',
                  'Monitor your app performance on the leaderboard',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.appName}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Register App
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="text-center pt-4 pb-8">
            <p className="text-gray-500 text-sm">
              Need help?{' '}
              <a href="/documentation" className="text-purple-400 hover:text-purple-300 transition-colors">
                View Documentation
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

