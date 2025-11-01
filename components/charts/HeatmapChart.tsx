/**
 * Heatmap Chart Component
 *
 * Displays SWIP score data as a heatmap (day x hour)
 */

'use client';

interface HeatmapData {
  day: string;
  hour: number;
  score: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  title: string;
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getColorForScore = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-green-400';
  if (score >= 60) return 'bg-yellow-400';
  if (score >= 50) return 'bg-orange-400';
  if (score >= 40) return 'bg-orange-500';
  if (score > 0) return 'bg-red-500';
  return 'bg-gray-800';
};

export function HeatmapChart({ data, title }: HeatmapChartProps) {
  const getScoreForCell = (day: string, hour: number) => {
    const cell = data.find((d) => d.day === day && d.hour === hour);
    return cell?.score || 0;
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12 flex-shrink-0" />
            {hours.map((hour) => (
              <div
                key={hour}
                className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {days.map((day) => (
            <div key={day} className="flex mb-1">
              <div className="w-12 flex-shrink-0 flex items-center text-xs text-gray-400 font-medium">
                {day}
              </div>
              {hours.map((hour) => {
                const score = getScoreForCell(day, hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`w-8 h-8 m-0.5 rounded ${getColorForScore(score)} transition-all hover:scale-110 cursor-pointer relative group`}
                    title={`${day} ${hour}:00 - Score: ${score.toFixed(1)}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {day} {hour}:00<br />
                      Score: {score.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 text-xs text-gray-400">
        <span>Score:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>0-40</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span>40-60</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded" />
          <span>60-70</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded" />
          <span>70-80</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>80+</span>
        </div>
      </div>
    </div>
  );
}

