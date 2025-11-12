/**
 * Project Card Component
 * 
 * Displays a project with summary metrics and quick actions
 */

'use client';

import Link from 'next/link';

const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
  stats: {
    wearablesCount: number;
    sessionsCount: number;
    avgSwipScore: number | null;
  };
}

interface ProjectCardProps {
  project: Project;
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

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColor = statusColors[project.status] || statusColors.active;
  const statusLabel = statusLabels[project.status] || project.status;

  const lastActivity = project.lastActivityAt
    ? formatTimeAgo(project.lastActivityAt)
    : 'Never';

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 p-6 transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {statusLabel}
          </span>
        </div>

        {/* Project Name */}
        <h3 className="text-xl font-bold text-white mb-2 pr-20 group-hover:text-purple-300 transition-colors">
          {project.name}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
          <div>
            <div className="text-2xl font-bold text-white">
              {project.stats.wearablesCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">Wearables</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {project.stats.sessionsCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {project.stats.avgSwipScore !== null
                ? project.stats.avgSwipScore.toFixed(1)
                : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Avg SWIP</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>Created {formatTimeAgo(project.createdAt)}</span>
          <span>Active {lastActivity}</span>
        </div>

        {/* Hover Arrow */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

