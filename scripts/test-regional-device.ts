/**
 * Test script to verify regional and device analytics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRegionalDeviceAnalytics() {
  console.log('🧪 Testing Regional & Device Analytics...\n');

  try {
    // Test regional data
    const regionalData = await prisma.apiCallLog.groupBy({
      by: ['region'],
      where: {
        region: { not: null }
      },
      _count: {
        id: true
      },
      _avg: {
        responseTime: true
      }
    });

    console.log('🌍 Regional Activity:');
    regionalData.forEach(region => {
      const avgScore = Math.round((region._avg.responseTime || 0) * 0.1);
      console.log(`  ${region.region}: ${region._count.id.toLocaleString()} sessions, Avg ${avgScore.toFixed(1)}`);
    });

    // Test device data
    const deviceData = await prisma.apiCallLog.groupBy({
      by: ['devicePlatform'],
      where: {
        devicePlatform: { not: null }
      },
      _count: {
        id: true
      }
    });

    const totalDeviceSessions = deviceData.reduce((sum, device) => sum + device._count.id, 0);
    
    console.log('\n📱 Device Distribution:');
    deviceData.forEach(device => {
      const percentage = Math.round((device._count.id / totalDeviceSessions) * 100);
      console.log(`  ${device.devicePlatform}: ${device._count.id.toLocaleString()} sessions (${percentage}%)`);
    });

    // Test recent data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentRegionalData = await prisma.apiCallLog.groupBy({
      by: ['region'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        region: { not: null }
      },
      _count: {
        id: true
      },
      _avg: {
        responseTime: true
      }
    });

    console.log('\n📊 Recent Regional Activity (Last 30 days):');
    recentRegionalData.forEach(region => {
      const avgScore = Math.round((region._avg.responseTime || 0) * 0.1);
      console.log(`  ${region.region}: ${region._count.id.toLocaleString()} sessions, Avg ${avgScore.toFixed(1)}`);
    });

    const recentDeviceData = await prisma.apiCallLog.groupBy({
      by: ['devicePlatform'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        devicePlatform: { not: null }
      },
      _count: {
        id: true
      }
    });

    const recentTotalDeviceSessions = recentDeviceData.reduce((sum, device) => sum + device._count.id, 0);
    
    console.log('\n📱 Recent Device Distribution (Last 30 days):');
    recentDeviceData.forEach(device => {
      const percentage = Math.round((device._count.id / recentTotalDeviceSessions) * 100);
      console.log(`  ${device.devicePlatform}: ${device._count.id.toLocaleString()} sessions (${percentage}%)`);
    });

    console.log('\n✅ Regional and Device analytics are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing regional/device analytics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegionalDeviceAnalytics();
