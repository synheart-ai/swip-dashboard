/**
 * Date Range Filter Component
 *
 * Allows filtering data by different time ranges
 */

'use client';

interface DateRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const dateRangeOptions = [
  { value: 'last6h', label: 'Last 6 Hrs.' },
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
];

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {dateRangeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              value === option.value
                ? 'bg-synheart-pink text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

