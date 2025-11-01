/**
 * Modern Profile Component
 * 
 * Compact, professional profile/account page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface ModernProfileProps {
  user: User;
  onUpdateName: (name: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  updating?: boolean;
}

export function ModernProfile({ user, onUpdateName, onSignOut, updating = false }: ModernProfileProps) {
  const [name, setName] = useState(user.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateName(name);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-8">
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-800">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {user.name || 'User'}
              </h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              
              <div className="space-y-4">
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white">
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your email address cannot be changed.
                  </p>
                </div>

                {/* Display Name (Editable) */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                      Display Name
                    </label>
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your display name"
                          className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={updating}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50"
                          >
                            {updating ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setName(user.name || '');
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white font-semibold hover:bg-gray-700/50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white">
                          {user.name || 'Not set'}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white font-semibold hover:bg-gray-700/50 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Account Actions */}
            <div className="pt-6 border-t border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={onSignOut}
                  className="w-full px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors"
                >
                  Sign Out
                </button>
                
                <Link
                  href="/developer"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-white font-semibold hover:bg-gray-700/50 transition-colors text-center"
                >
                  ← Back to Developer Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Account Type</p>
              <p className="text-white font-semibold">Developer</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className="text-white font-semibold">Active</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Member Since</p>
              <p className="text-white font-semibold">2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

