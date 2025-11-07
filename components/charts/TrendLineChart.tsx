/**
 * Trend Line Chart Component
 *
 * Displays trend data using Recharts line chart
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendLineChartProps {
  data: Array<{ date: string; value: number; label?: string }>;
  title: string;
  color?: string;
  yAxisLabel?: string;
  formatValue?: (value: number) => string;
}

export function TrendLineChart({
  data,
  title,
  color = '#fe22b1',
  yAxisLabel,
  formatValue = (v) => v.toFixed(1),
}: TrendLineChartProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } } : undefined}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => [formatValue(Number(value)), 'Value']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

