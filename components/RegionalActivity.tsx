/**
 * Regional Activity Component
 * Displays sessions by geographic region
 */

interface RegionalActivityProps {
  data: Array<{
    region: string;
    sessions: number;
    avgScore: number;
  }>;
}

export function RegionalActivity({ data }: RegionalActivityProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-white/10">
      <div className="mb-6">
        <h3 className="text-pink-400 text-xl font-semibold mb-2">Regional Activity</h3>
        <p className="text-gray-400 text-sm">Sessions by geographic region.</p>
      </div>
      
      <div className="space-y-4">
        {data.map((region, index) => (
          <div key={region.region} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 text-gray-400">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className="text-white font-medium">{region.region}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                Avg {region.avgScore.toFixed(1)}
              </div>
              <div className="text-gray-400 text-sm">
                {region.sessions.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
