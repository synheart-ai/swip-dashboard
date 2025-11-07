/**
 * Bio Signals Chart Component
 *
 * Displays heart rate and HRV data for a session
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BioSignalsChartProps {
  hrData: number[];
  rrData?: number[];
  title?: string;
}

export function BioSignalsChart({ hrData, rrData, title = 'Bio Signals' }: BioSignalsChartProps) {
  // Transform data for recharts
  const chartData = hrData.map((hr, index) => ({
    time: index,
    heartRate: hr,
    rrInterval: rrData?.[index] || null,
  }));

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af' } }}
          />
          <YAxis
            yAxisId="left"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            label={{ value: 'Heart Rate (BPM)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
          />
          {rrData && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickLine={false}
              label={{ value: 'RR Interval (ms)', angle: 90, position: 'insideRight', style: { fill: '#9ca3af' } }}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="heartRate"
            stroke="#fe22b1"
            strokeWidth={2}
            dot={false}
            name="Heart Rate (BPM)"
          />
          {rrData && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rrInterval"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              name="RR Interval (ms)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

