/**
 * Emotion Distribution Component
 *
 * Displays emotion distribution with gradient progress bars
 */

interface EmotionData {
  emotion: string;
  count: number;
  percentage: number;
}

interface EmotionDistributionProps {
  emotions: EmotionData[];
}

export function EmotionDistribution({ emotions }: EmotionDistributionProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-pink-400 mb-1">
          Emotion Distribution
        </h3>
      </div>
      
      <div className="space-y-4">
        {emotions.map((emotion) => (
          <div key={emotion.emotion}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">{emotion.emotion}</span>
              <span className="text-white text-sm">
                {emotion.count} ({emotion.percentage.toFixed(1)}%)
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"
                style={{ width: `${emotion.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
