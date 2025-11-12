/**
 * Project Detail Content Component
 * 
 * Main content area for project dashboard with KPIs, recent activity, and navigation
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  stats: {
    wearablesCount: number;
    sessionsCount: number;
    avgSwipScore: number | null;
    recentSessions: number;
  };
  wearables: Array<{
    id: string;
    name: string;
    deviceType: string;
    connectionStatus: string;
    lastSyncAt: string | null;
  }>;
  projectSessions: Array<{
    id: string;
    createdAt: string;
    appSession: {
      avgSwipScore: number | null;
      startedAt: string;
      dominantEmotion: string | null;
    };
    wearable: {
      name: string;
      deviceType: string;
    } | null;
  }>;
}

interface ProjectDetailContentProps {
  projectId: string;
}

export function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project');
      }

      setProject(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
          <Button variant="outline" onClick={() => router.push('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    setup_incomplete: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  const statusLabels: Record<string, string> = {
    active: 'Active',
    archived: 'Archived',
    setup_incomplete: 'Setup Incomplete',
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/projects" className="hover:text-white transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-white">{project.name}</span>
        </div>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">{project.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status] || statusColors.active}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {statusLabels[project.status] || project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-gray-400 text-lg">{project.description}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}/wearables`}>
            <Button variant="secondary" className='flex items-center'>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Manage Wearables
            </Button>
          </Link>
          <Link href={`/projects/${projectId}/sessions`}>
            <Button variant="secondary" className='flex items-center'>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Sessions
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-1">{project.stats.wearablesCount}</div>
          <div className="text-sm text-gray-400">Total Wearables</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
          <div className="text-3xl font-bold text-purple-400 mb-1">{project.stats.sessionsCount}</div>
          <div className="text-sm text-gray-400">Total Sessions</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {project.stats.avgSwipScore !== null
              ? project.stats.avgSwipScore.toFixed(1)
              : '—'}
          </div>
          <div className="text-sm text-gray-400">Avg SWIP Score</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-400 mb-1">{project.stats.recentSessions}</div>
          <div className="text-sm text-gray-400">Sessions (7 days)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Wearables */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Wearables</h2>
            <Link
              href={`/projects/${projectId}/wearables`}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All →
            </Link>
          </div>
          {project.wearables.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No wearables yet</p>
              <Link href={`/projects/${projectId}/wearables`}>
                <Button variant="outline" size="sm" className="mt-4">
                  Add Wearable
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {project.wearables.map((wearable) => (
                <div
                  key={wearable.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-white">{wearable.name}</div>
                    <div className="text-sm text-gray-400">{wearable.deviceType}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      wearable.connectionStatus === 'connected'
                        ? 'bg-green-500/20 text-green-400'
                        : wearable.connectionStatus === 'needs_setup'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {wearable.connectionStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
            <Link
              href={`/projects/${projectId}/sessions`}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All →
            </Link>
          </div>
          {project.projectSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No sessions yet</p>
              <p className="text-sm mt-2">Sessions will appear here once data is collected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.projectSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/projects/${projectId}/sessions/${session.id}`}
                  className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {session.wearable?.name || 'Unknown Device'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(session.appSession.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-400">
                        {session.appSession.avgSwipScore !== null
                          ? session.appSession.avgSwipScore.toFixed(1)
                          : '—'}
                      </div>
                      {session.appSession.dominantEmotion && (
                        <div className="text-xs text-gray-400 capitalize">
                          {session.appSession.dominantEmotion}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

