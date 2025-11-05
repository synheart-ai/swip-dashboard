/**
 * Cron Job: Recalculate Leaderboard
 * 
 * Runs every 24 hours to recalculate and cache leaderboard data
 * Can be scheduled with cron, node-cron, or Vercel Cron
 */

import { forceRecalculateLeaderboard } from '../src/lib/redis-leaderboard';

async function main() {
  console.log('🔄 Starting leaderboard recalculation...');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  try {
    const data = await forceRecalculateLeaderboard();
    
    console.log('✅ Leaderboard recalculated successfully!');
    console.log(`📊 Stats:`);
    console.log(`   - Total Apps: ${data.stats.totalApps}`);
    console.log(`   - Average SWIP Score: ${data.stats.averageSwipScore.toFixed(2)}`);
    console.log(`   - Total Users: ${data.stats.totalUsers}`);
    console.log(`   - New Users Today: ${data.stats.newUsers}`);
    console.log(`   - Stress Rate: ${data.stats.stressRate.toFixed(2)}%`);
    console.log(`   - Active Sessions: ${data.stats.activeSessions}`);
    console.log(`📅 Calculated At: ${data.calculatedAt}`);
    console.log(`⏳ Expires At: ${data.expiresAt}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to recalculate leaderboard:', error);
    process.exit(1);
  }
}

main();

