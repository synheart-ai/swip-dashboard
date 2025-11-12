/**
 * Apps Content Component
 * 
 * Main content area for applications list page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface App {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  avgSwipScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export function AppsContent() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/apps');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch apps');
      }

      let filtered = data.apps || [];
      
      // Client-side search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter((app: App) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setApps(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load apps');
      console.error('Error fetching apps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [searchQuery]);

  const getScoreColor = (score: number | null): string => {
    if (!score) return 'text-gray-400';
    if (score >= 85) return 'text-purple-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-pink-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Applications</h1>
            <p className="text-gray-400">
              View and manage your registered wellness applications
            </p>
          </div>
          <Link href="/developer">
            <Button variant="secondary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Register New App
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <Input
            placeholder="Search applications by name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Apps Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading applications...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchApps}>
            Try Again
          </Button>
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Get started by registering your first application'}
          </p>
          {!searchQuery && (
            <Link href="/developer">
              <Button>Register Your First App</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/app/${app.id}/sessions`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 p-6 transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
                {/* App Name */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors pr-20">
                  {app.name}
                </h3>

                {/* Category Badge */}
                {app.category && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-3">
                    {app.category}
                  </div>
                )}

                {/* Description */}
                {app.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {app.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-800">
                  <div>
                    <div className={`text-2xl font-bold ${getScoreColor(app.avgSwipScore)}`}>
                      {app.avgSwipScore !== null
                        ? app.avgSwipScore.toFixed(1)
                        : '—'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Avg SWIP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">—</div>
                    <div className="text-xs text-gray-500 mt-1">Sessions</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(app.createdAt).toLocaleDateString()}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
                    View Sessions →
                  </span>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

