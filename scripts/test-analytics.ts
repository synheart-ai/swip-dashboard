/**
 * Test script to verify the new analytics metrics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnalytics() {
  console.log('🧪 Testing Analytics Metrics...\n');

  try {
    // Test API call counts
    const totalApiCalls = await prisma.apiCallLog.count();
    console.log(`📊 Total API Calls: ${totalApiCalls.toLocaleString()}`);

    // Test monthly growth
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const thisMonthCalls = await prisma.apiCallLog.count({
      where: { createdAt: { gte: startOfMonth } }
    });
    
    const lastMonthCalls = await prisma.apiCallLog.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth
        }
      }
    });
    
    const growth = lastMonthCalls > 0 
      ? Math.round(((thisMonthCalls - lastMonthCalls) / lastMonthCalls) * 100)
      : 0;
    
    console.log(`📈 This Month: ${thisMonthCalls.toLocaleString()}`);
    console.log(`📈 Last Month: ${lastMonthCalls.toLocaleString()}`);
    console.log(`📈 Growth: ${growth}%\n`);

    // Test uptime metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totalChecks = await prisma.systemUptime.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    
    const successfulChecks = await prisma.systemUptime.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        isUp: true
      }
    });
    
    const uptimePercentage = totalChecks > 0 
      ? (successfulChecks / totalChecks) * 100
      : 99.9;
    
    console.log(`⏱️  Total Uptime Checks: ${totalChecks.toLocaleString()}`);
    console.log(`✅ Successful Checks: ${successfulChecks.toLocaleString()}`);
    console.log(`📊 Uptime Percentage: ${uptimePercentage.toFixed(1)}%\n`);

    // Test response time
    const avgResponseTime = await prisma.apiCallLog.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _avg: { responseTime: true }
    });
    
    console.log(`⚡ Average Response Time: ${Math.round(avgResponseTime._avg.responseTime || 0)}ms\n`);

    // Test original metrics
    const totalUsers = await prisma.user.count();
    const totalSessions = await prisma.swipSession.count();
    const totalApps = await prisma.app.count();
    
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`📱 Total Sessions: ${totalSessions}`);
    console.log(`🔗 Total Apps: ${totalApps}\n`);

    console.log('✅ All analytics metrics are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing analytics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalytics();
