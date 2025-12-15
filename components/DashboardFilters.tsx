/**
 * Dashboard Filters Component
 *
 * Comprehensive filter panel for dashboard analytics
 */

'use client';

import { useState } from 'react';
import { DateRangeFilter } from './ui/DateRangeFilter';
import { PartOfDayFilter } from './ui/PartOfDayFilter';
import { MultiSelectFilter } from './ui/MultiSelectFilter';

export interface FilterState {
  dateRange: string;
  partOfDay: string;
  wearables: string[];
  os: string[];
  categories: string[];
}

interface DashboardFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showAdvanced?: boolean;
}

const wearableOptions = ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit', 'Garmin', 'Other'];
const osOptions = ['iOS', 'Android'];
const categoryOptions = ['Health', 'Communication', 'Game', 'Entertainment', 'Other'];

export function DashboardFilters({ filters, onChange, showAdvanced = false }: DashboardFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-gray-900/50 rounded-xl  space-y-6">
      {/* Primary Filters */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-3 block">Time Range</label>
          <DateRangeFilter
            value={filters.dateRange}
            onChange={(value) => updateFilter('dateRange', value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-3 block">Part of Day</label>
          <PartOfDayFilter
            value={filters.partOfDay}
            onChange={(value) => updateFilter('partOfDay', value)}
          />
        </div>

      {/* Advanced Filters Toggle */}
      {showAdvanced && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-synheart-pink text-sm font-medium hover:text-pink-400 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Advanced Filters
          </button>

          {isExpanded && (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <MultiSelectFilter
                label="Wearables"
                options={wearableOptions}
                selectedValues={filters.wearables}
                onChange={(values) => updateFilter('wearables', values)}
                color="purple"
              />

              <MultiSelectFilter
                label="Operating System"
                options={osOptions}
                selectedValues={filters.os}
                onChange={(values) => updateFilter('os', values)}
                color="blue"
              />

              <MultiSelectFilter
                label="App Category"
                options={categoryOptions}
                selectedValues={filters.categories}
                onChange={(values) => updateFilter('categories', values)}
                color="pink"
              />
            </div>
          )}
        </>
      )}

      {/* Reset Filters */}
      <button
        onClick={() =>
          onChange({
            dateRange: 'thisWeek',
            partOfDay: 'all',
            wearables: [],
            os: [],
            categories: [],
          })
        }
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );
}

