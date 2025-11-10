'use client';

import { useMemo, useState } from 'react';
import type { AppCatalogEntry } from '../src/types';

interface AppsExplorerProps {
  apps: AppCatalogEntry[];
}

type ViewMode = 'grid' | 'table';
type SortKey = 'score' | 'sessions' | 'name';

export function AppsExplorer({ apps }: AppsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOs, setSelectedOs] = useState<string[]>([]);
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('score');

  const categories = useMemo(() => {
    const unique = new Set<string>();
    apps.forEach((app) => {
      unique.add(normalizeCategory(app.category));
    });
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [apps]);

  const osOptions = useMemo(() => {
    const map = new Map<string, string>();
    apps.forEach((app) => {
      const value = normalizeOsValue(app.os);
      if (!map.has(value)) {
        map.set(value, formatOsLabel(app.os));
      }
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [apps]);

  const filtersActive = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      selectedCategories.length > 0 ||
      selectedOs.length > 0 ||
      scoreRange[0] !== 0 ||
      scoreRange[1] !== 100 ||
      sortKey !== 'score'
    );
  }, [scoreRange, searchQuery, selectedCategories, selectedOs, sortKey]);

  const filteredApps = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const [minScore, maxScore] = scoreRange;

    const filtered = apps.filter((app) => {
      const appNameMatch =
        query.length === 0 ||
        app.name.toLowerCase().includes(query) ||
        (app.description ?? '').toLowerCase().includes(query);

      const categoryValue = normalizeCategory(app.category);
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(categoryValue);

      const osValue = normalizeOsValue(app.os);
      const osMatch =
        selectedOs.length === 0 || selectedOs.includes(osValue);

      const score = Number.isFinite(app.avgSwipScore)
        ? app.avgSwipScore
        : 0;
      const scoreMatch = score >= minScore && score <= maxScore;

      return appNameMatch && categoryMatch && osMatch && scoreMatch;
    });

    return filtered.sort((a, b) => {
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortKey === 'sessions') {
        return b.totalSessions - a.totalSessions;
      }
      return b.avgSwipScore - a.avgSwipScore;
    });
  }, [apps, searchQuery, selectedCategories, selectedOs, scoreRange, sortKey]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const toggleOs = (value: string) => {
    setSelectedOs((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedOs([]);
    setScoreRange([0, 100]);
    setSortKey('score');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Applications
            </h1>
            <p className="text-gray-400">
              Explore wellness apps ingesting SWIP data. Filter by category,
              platform, and performance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-gray-900/60 border border-gray-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-600/20 text-white border border-purple-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h4v4H4V6zm6 0h4v4h-4V6zm6 0h4v4h-4V6zM4 12h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 18h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"
                />
              </svg>
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'table'
                  ? 'bg-purple-600/20 text-white border border-purple-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              Table
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-2 flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-300">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0011.15 11.15z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by app name, description, or category"
                className="w-full rounded-xl border border-gray-800 bg-gray-950/70 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-300">
              Sort by
            </label>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="rounded-xl border border-gray-800 bg-gray-950/70 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="score">Highest SWIP score</option>
              <option value="sessions">Most sessions</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-300">
              SWIP score range
            </label>
            <div className="bg-gray-950/70 border border-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{scoreRange[0]}</span>
                <span>{scoreRange[1]}</span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={scoreRange[0]}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    setScoreRange(([_, upper]) => [
                      Math.min(nextValue, upper),
                      upper,
                    ]);
                  }}
                  className="w-full accent-purple-500"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={scoreRange[1]}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    setScoreRange(([lower]) => [
                      lower,
                      Math.max(nextValue, lower),
                    ]);
                  }}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FilterChipGroup
            label="Category"
            options={categories}
            selected={selectedCategories}
            onToggle={toggleCategory}
            emptyLabel="No categories"
          />
          <FilterChipGroup
            label="Operating system"
            options={osOptions.map((option) => option.label)}
            selected={selectedOs.map((value) =>
              osOptions.find((option) => option.value === value)?.label ?? value
            )}
            onToggle={(label) => {
              const option = osOptions.find((item) => item.label === label);
              if (option) {
                toggleOs(option.value);
              }
            }}
            emptyLabel="No OS data"
          />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                {filteredApps.length} of {apps.length} apps
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!filtersActive}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filtersActive
                  ? 'text-gray-300 border border-gray-700 hover:border-purple-500/50 hover:text-white'
                  : 'text-gray-600 border border-gray-800 cursor-not-allowed'
              }`}
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-12 text-center">
          <p className="text-lg font-semibold text-white mb-2">
            No apps match your filters
          </p>
          <p className="text-gray-400 text-sm">
            Try adjusting the score range or clearing some filters to see more apps.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <AppsTable apps={filteredApps} />
      )}
    </div>
  );
}

function AppCard({ app }: { app: AppCatalogEntry }) {
  const categoryLabel = normalizeCategory(app.category);
  const osLabel = formatOsLabel(app.os);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/70 via-gray-900/40 to-gray-900/10 p-6 shadow-lg shadow-black/20 backdrop-blur">
      <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),transparent_60%)]" />
      <div className="relative z-10 space-y-6">
        <div className="flex items-start gap-4">
          <AppIcon iconUrl={app.iconUrl} name={app.name} />
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                {app.name}
              </h3>
              {app.claimable && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  Claimable
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l2-.75L13 20l-.75-3"
                  />
                </svg>
                {categoryLabel}
              </span>
              <span className="text-gray-600">•</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l2-.75L13 20l-.75-3"
                  />
                </svg>
                {osLabel}
              </span>
            </div>
          </div>
        </div>

        {app.description && (
          <p className="text-sm text-gray-400 leading-relaxed max-h-20 overflow-hidden">
            {app.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <StatPill
            label="Avg SWIP score"
            value={`${app.avgSwipScore.toFixed(1)}`}
            accent="from-purple-500/30 to-pink-500/30"
          />
          <StatPill
            label="Leaderboard sessions"
            value={formatNumber(app.leaderboardSessions)}
            accent="from-blue-500/30 to-cyan-500/30"
          />
          <StatPill
            label="SWIP users"
            value={formatNumber(app.swipUserSessions)}
            accent="from-emerald-500/30 to-teal-500/30"
          />
          <StatPill
            label="Ingestion sessions"
            value={formatNumber(app.ingestionSessions)}
            accent="from-amber-500/30 to-orange-500/30"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total sessions: {formatNumber(app.totalSessions)}</span>
          <span>
            Added {new Date(app.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function AppsTable({ apps }: { apps: AppCatalogEntry[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800/60">
          <thead>
            <tr className="bg-gray-900/60 text-xs uppercase tracking-wide text-gray-400">
              <th scope="col" className="px-6 py-3 text-left">App</th>
              <th scope="col" className="px-6 py-3 text-left">Category</th>
              <th scope="col" className="px-6 py-3 text-left">Platform</th>
              <th scope="col" className="px-6 py-3 text-right">Avg SWIP</th>
              <th scope="col" className="px-6 py-3 text-right">SWIP users</th>
              <th scope="col" className="px-6 py-3 text-right">Ingestion</th>
              <th scope="col" className="px-6 py-3 text-right">Total sessions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <AppIcon iconUrl={app.iconUrl} name={app.name} />
                    <div>
                      <p className="text-sm font-semibold text-white">{app.name}</p>
                      {app.claimable && (
                        <span className="text-amber-300 text-xs font-medium">
                          Claimable
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {normalizeCategory(app.category)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {formatOsLabel(app.os)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-200">
                  {app.avgSwipScore.toFixed(1)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-200">
                  {formatNumber(app.swipUserSessions)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-200">
                  {formatNumber(app.ingestionSessions)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-200">
                  {formatNumber(app.totalSessions)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChipGroup({
  label,
  options,
  selected,
  onToggle,
  emptyLabel,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      {options.length === 0 ? (
        <div className="text-xs text-gray-500 border border-dashed border-gray-800 rounded-xl px-4 py-6 text-center">
          {emptyLabel}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? 'border-purple-500/60 text-white bg-purple-500/20'
                    : 'border-gray-800 text-gray-400 hover:border-purple-500/30 hover:text-white'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AppIcon({ iconUrl, name }: { iconUrl: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (!iconUrl || hasError) {
    return (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/40 via-purple-500/20 to-pink-500/40 flex items-center justify-center text-white font-bold text-lg border border-purple-400/30 shadow-inner shadow-purple-900/30">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-800 bg-gray-900/80 shadow-inner shadow-black/30">
      <img
        src={iconUrl}
        alt={`${name} icon`}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border border-gray-800 bg-gradient-to-br ${accent} px-4 py-3`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function normalizeCategory(category: string | null): string {
  return category?.trim().length ? category : 'Uncategorized';
}

function normalizeOsValue(os: string | null): string {
  return os?.trim().toLowerCase() ?? 'unknown';
}

function formatOsLabel(os: string | null): string {
  const value = normalizeOsValue(os);
  if (value === 'unknown') {
    return 'Unknown OS';
  }
  return value
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}


