/**
 * Create diverse test data for regional and device analytics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDiverseTestData() {
  console.log('🔄 Creating diverse test data for regional and device analytics...');

  try {
    // Create some diverse API call logs with different regions and devices
    const testData = [
      // North America - iOS
      { ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', region: 'North America', devicePlatform: 'iOS' },
      { ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', region: 'North America', devicePlatform: 'iOS' },
      { ipAddress: '192.168.1.30', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', region: 'North America', devicePlatform: 'iOS' },
      
      // Europe - Android
      { ipAddress: '192.168.51.10', userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)', region: 'Europe', devicePlatform: 'Android' },
      { ipAddress: '192.168.51.20', userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)', region: 'Europe', devicePlatform: 'Android' },
      
      // Asia - Web
      { ipAddress: '192.168.101.10', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', region: 'Asia', devicePlatform: 'Web' },
      { ipAddress: '192.168.101.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', region: 'Asia', devicePlatform: 'Web' },
      
      // South America - macOS
      { ipAddress: '192.168.151.10', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', region: 'South America', devicePlatform: 'macOS' },
      
      // Oceania - Windows
      { ipAddress: '192.168.201.10', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', region: 'Oceania', devicePlatform: 'Windows' },
    ];

    // Create multiple API calls for each test data entry
    const apiCallPromises = [];
    
    for (let i = 0; i < 10000; i++) { // Create 10,000 diverse API calls
      const testEntry = testData[i % testData.length];
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random time in last 30 days
      
      apiCallPromises.push(
        prisma.apiCallLog.create({
          data: {
            endpoint: '/api/swip/ingest',
            method: 'POST',
            statusCode: 200,
            responseTime: Math.floor(Math.random() * 200) + 20,
            ipAddress: testEntry.ipAddress,
            userAgent: testEntry.userAgent,
            region: testEntry.region,
            devicePlatform: testEntry.devicePlatform,
            createdAt
          }
        })
      );
      
      // Batch insert every 1000 records
      if (apiCallPromises.length >= 1000) {
        await Promise.all(apiCallPromises);
        apiCallPromises.length = 0;
        console.log(`✅ Created ${i + 1} diverse API calls...`);
      }
    }
    
    // Insert remaining records
    if (apiCallPromises.length > 0) {
      await Promise.all(apiCallPromises);
    }

    console.log('🎉 Diverse test data created successfully!');
    
    // Show the new distribution
    const regionalStats = await prisma.apiCallLog.groupBy({
      by: ['region'],
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      _count: { id: true }
    });
    
    const deviceStats = await prisma.apiCallLog.groupBy({
      by: ['devicePlatform'],
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      _count: { id: true }
    });

    console.log('\n📈 New Regional Distribution (Last 30 days):');
    regionalStats.forEach(stat => {
      console.log(`  ${stat.region}: ${stat._count.id.toLocaleString()} sessions`);
    });

    console.log('\n📱 New Device Distribution (Last 30 days):');
    deviceStats.forEach(stat => {
      console.log(`  ${stat.devicePlatform}: ${stat._count.id.toLocaleString()} sessions`);
    });

  } catch (error) {
    console.error('❌ Error creating diverse test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDiverseTestData();
