/**
 * Leaderboard Countdown Timer
 *
 * Shows real-time countdown until the leaderboard cache refreshes
 */

'use client';

import { useEffect, useMemo, useState } from 'react';

interface LeaderboardCountdownProps {
  expiresAt?: string | Date | null;
}

export function LeaderboardCountdown({ expiresAt }: LeaderboardCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const targetTime = useMemo(() => {
    if (expiresAt) {
      const parsed = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Fallback: assume refresh happens in one hour
    return new Date(Date.now() + 60 * 60 * 1000);
  }, [expiresAt]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      let diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        // If expired, show minimal time and let next render update once cache refreshes
        setTimeRemaining('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * 1000 * 60 * 60;
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * 1000 * 60;
      const seconds = Math.floor(diff / 1000);

      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');

      setTimeRemaining(`${hh}:${mm}:${ss}`);
    };

    calculateTimeRemaining();

    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="flex  items-center gap-3 px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-gray-400 text-sm">Next update in:</span>
      </div>
      <span className="text-white font-mono text-sm font-semibold">
        {timeRemaining || 'Loading...'}
      </span>
    </div>
  );
}

