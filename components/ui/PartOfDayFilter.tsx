/**
 * Part of Day Filter Component
 *
 * Allows filtering data by part of day
 */

'use client';

interface PartOfDayFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const partOfDayOptions = [
  { value: 'all', label: 'All Day' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
];

export function PartOfDayFilter({ value, onChange }: PartOfDayFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {partOfDayOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              value === option.value
                ? 'bg-synheart-blue text-white'
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

