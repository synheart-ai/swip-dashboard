/**
 * Multi Select Filter Component
 *
 * Generic multi-select filter for various categories
 */

'use client';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  color?: 'pink' | 'blue' | 'purple' | 'green';
}

const colorStyles = {
  pink: 'bg-synheart-pink hover:bg-synheart-pink/80',
  blue: 'bg-synheart-blue hover:bg-synheart-blue/80',
  purple: 'bg-purple-500 hover:bg-purple-600',
  green: 'bg-green-500 hover:bg-green-600',
};

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onChange,
  color = 'purple',
}: MultiSelectFilterProps) {
  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectAll = () => {
    onChange(options);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <button
              key={option}
              onClick={() => toggleValue(option)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${
                  isSelected
                    ? `${colorStyles[color]} text-white`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

