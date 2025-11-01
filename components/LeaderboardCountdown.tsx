/**
 * Leaderboard Countdown Timer
 * 
 * Shows real-time countdown until midnight (next cache reset)
 * Calculates time remaining from now until 00:00:00 next day
 */

'use client';

import { useEffect, useState } from 'react';

interface LeaderboardCountdownProps {
  expiresAt?: string; // Optional, we calculate from midnight instead
}

export function LeaderboardCountdown({ expiresAt }: LeaderboardCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      
      // Calculate next midnight
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0); // Set to midnight tomorrow
      
      const diff = tomorrow.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Updating...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Format with leading zeros for cleaner display
      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');

      setTimeRemaining(`${hh}:${mm}:${ss}`);
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
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

