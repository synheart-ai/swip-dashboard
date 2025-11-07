/**
 * Device Distribution Component
 * Displays sessions by platform
 */

interface DeviceDistributionProps {
  data: Array<{
    platform: string;
    sessions: number;
    percentage: number;
  }>;
}

export function DeviceDistribution({ data }: DeviceDistributionProps) {
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'ios':
        return 'from-pink-500 to-pink-600';
      case 'android':
        return 'from-blue-500 to-blue-600';
      case 'web':
        return 'from-green-500 to-green-600';
      case 'macos':
        return 'from-gray-500 to-gray-600';
      case 'windows':
        return 'from-cyan-500 to-cyan-600';
      default:
        return 'from-purple-500 to-purple-600';
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-white/10">
      <div className="mb-6">
        <h3 className="text-pink-400 text-xl font-semibold mb-2">Device Distribution</h3>
        <p className="text-gray-400 text-sm">Sessions by platform.</p>
      </div>
      
      <div className="space-y-4">
        {data.map((device, index) => (
          <div key={device.platform} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{device.platform}</span>
              <span className="text-gray-400 text-sm">
                {device.sessions.toLocaleString()} ({device.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${getPlatformColor(device.platform)}`}
                style={{ width: `${device.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
