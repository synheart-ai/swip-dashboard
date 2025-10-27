/**
 * SWIP Score Trend Component
 *
 * Displays SWIP score trend with gradient progress bar
 */

interface SwipScoreTrendProps {
  score: number;
  sessions: number;
  date: string;
}

export function SwipScoreTrend({ score, sessions, date }: SwipScoreTrendProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-1">
          SWIP Score Trend (Last 7 Days)
        </h3>
        <p className="text-sm text-white">{date}</p>
      </div>
      
      <div className="relative">
        {/* Progress bar background */}
        <div className="w-full h-8 bg-gray-800 rounded-full overflow-hidden">
          {/* Gradient progress bar */}
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center"
            style={{ width: `${Math.min((score / 100) * 100, 100)}%` }}
          >
            <span className="text-white font-semibold text-sm">
              {score.toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Sessions count */}
        <div className="mt-2 text-right">
          <span className="text-white text-sm">
            {sessions} session{sessions !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
