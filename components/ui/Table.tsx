/**
 * Table Component
 *
 * Reusable table with sorting and responsive design
 */

import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
  hover?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onSort,
  sortKey,
  sortOrder,
  loading = false,
  emptyMessage = 'No data available',
  hover = true,
}: TableProps<T>) {
  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-synheart-pink/30 border-t-synheart-pink rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-6 py-4 text-left text-sm font-semibold text-gray-400
                  ${column.sortable ? 'cursor-pointer select-none hover:text-white' : ''}
                  ${column.className || ''}
                `}
                onClick={() => handleSort(column.key, column.sortable)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortKey === column.key && (
                    <span className="text-synheart-pink">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              className={`
                border-b border-gray-800/50
                ${hover ? 'hover:bg-gray-800/50 transition-colors' : ''}
                ${index % 2 === 0 ? 'bg-gray-900/20' : ''}
              `}
            >
              {columns.map((column) => {
                const value = (row as any)[column.key];
                return (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm text-gray-300 ${column.className || ''}`}
                  >
                    {column.render ? column.render(value, row) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
