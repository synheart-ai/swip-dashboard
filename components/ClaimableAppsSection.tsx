'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClaimableApp {
  id: string;
  name: string;
  appId: string;
  category: string | null;
  developer: string | null;
  createdAt: string;
  avgSwipScore: number | null;
}

export function ClaimableAppsSection() {
  const [claimableApps, setClaimableApps] = useState<ClaimableApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ClaimableApp | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<'package_name'>('package_name');
  const [proof, setProof] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchClaimableApps();
  }, []);

  const fetchClaimableApps = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/apps?claimable=true');
      if (res.ok) {
        const data = await res.json();
        setClaimableApps(data.apps || []);
      }
    } catch (error) {
      console.error('Error fetching claimable apps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (app: ClaimableApp) => {
    setSelectedApp(app);
    setProof(app.appId || '');  // Pre-fill with app ID
    setShowClaimModal(true);
    setClaimError('');
  };

  const submitClaim = async () => {
    if (!selectedApp || !proof) return;

    try {
      setClaiming(true);
      setClaimError('');

      const res = await fetch(`/api/apps/${selectedApp.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationMethod,
          proof
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Close modal and refresh
        setShowClaimModal(false);
        setSelectedApp(null);
        setProof('');
        
        // Refresh apps list
        fetchClaimableApps();
        router.refresh();

        // Show success message (you can add a toast notification here)
        alert(`Successfully claimed "${selectedApp.name}"!`);
      } else {
        setClaimError(data.error || 'Failed to claim app');
      }
    } catch (error) {
      console.error('Error claiming app:', error);
      setClaimError('An error occurred while claiming the app');
    } finally {
      setClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (claimableApps.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Claimable Apps</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Apps created by SWIP users will appear here. You can claim them to manage and access their data.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🎯 Claimable Apps</h2>
        <p className="text-gray-400">
          These apps were created by SWIP users. Claim them to gain ownership and generate API keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {claimableApps.map((app) => (
          <div
            key={app.id}
            className="bg-gradient-to-br from-purple-900/20 to-gray-900/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{app.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                    {app.name}
                  </h3>
                  {app.category && (
                    <span className="text-xs text-gray-400">{app.category}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {app.appId && (
                <p className="text-sm text-gray-300 font-mono truncate">
                  <span className="text-gray-500">ID:</span> {app.appId}
                </p>
              )}
              {app.developer && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Dev:</span> {app.developer}
                </p>
              )}
              {app.avgSwipScore && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Avg Score:</span> {app.avgSwipScore.toFixed(1)}
                </p>
              )}
            </div>

            <button
              onClick={() => handleClaim(app)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20"
            >
              Claim This App
            </button>
          </div>
        ))}
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Claim App</h3>
              <button
                onClick={() => {
                  setShowClaimModal(false);
                  setSelectedApp(null);
                  setClaimError('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                <p className="text-white font-semibold mb-1">{selectedApp.name}</p>
                <p className="text-gray-400 text-sm font-mono">{selectedApp.appId}</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Verification Method
                </label>
                <select
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value as 'package_name')}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="package_name">Package Name Confirmation</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  {verificationMethod === 'package_name' && 'Confirm Package Name'}
                </label>
                <input
                  type="text"
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  placeholder={selectedApp.appId || 'Enter package name'}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Enter the exact package name to verify ownership
                </p>
              </div>

              {claimError && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{claimError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowClaimModal(false);
                  setSelectedApp(null);
                  setClaimError('');
                }}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitClaim}
                disabled={claiming || !proof}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claiming ? 'Claiming...' : 'Claim App'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

