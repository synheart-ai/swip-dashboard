/**
 * Stats Card Component
 *
 * Displays key metrics with trend indicators
 */

import { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode | 'users' | 'clock' | 'chart' | 'check';
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
    direction?: 'increase' | 'decrease';
  };
  color?: 'pink' | 'blue' | 'purple' | 'green';
}

const colorStyles = {
  pink: 'from-synheart-pink/20 to-synheart-pink/5 border-synheart-pink/30',
  blue: 'from-synheart-blue/20 to-synheart-blue/5 border-synheart-blue/30',
  purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  green: 'from-green-500/20 to-green-500/5 border-green-500/30',
};

const iconColorStyles = {
  pink: 'bg-synheart-pink/20 text-synheart-pink',
  blue: 'bg-synheart-blue/20 text-synheart-blue',
  purple: 'bg-purple-500/20 text-purple-500',
  green: 'bg-green-500/20 text-green-500',
};

const getIconElement = (icon: ReactNode | 'users' | 'clock' | 'chart' | 'check'): ReactNode => {
  if (typeof icon === 'string') {
    const iconMap: Record<string, ReactNode> = {
      users: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      clock: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      chart: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      check: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    };
    return iconMap[icon];
  }
  return icon;
};

export function StatsCard({ title, value, icon, trend, color = 'pink' }: StatsCardProps) {
  const isPositive = trend?.positive ?? (trend?.direction === 'increase');

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-6
        bg-gradient-to-br ${colorStyles[color]}
        border backdrop-blur-sm
        hover:shadow-lg hover:scale-[1.02] transition-all duration-300
      `}
    >
      {/* Icon */}
      {icon && (
        <div className={`absolute top-4 right-4 p-3 rounded-lg ${iconColorStyles[color]}`}>
          {getIconElement(icon)}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold text-white mb-3">{value}</p>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-gray-500 text-sm">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
