/**
 * Update existing API call logs with region and device data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple IP-to-region mapping (same as in api-tracker.ts)
function getRegionFromIP(ipAddress: string): string {
  const ip = ipAddress.replace(/[^\d.]/g, '');
  const parts = ip.split('.').map(Number);
  
  if (parts.length === 4) {
    const firstOctet = parts[0];
    if (firstOctet >= 1 && firstOctet <= 50) return 'North America';
    if (firstOctet >= 51 && firstOctet <= 100) return 'Europe';
    if (firstOctet >= 101 && firstOctet <= 150) return 'Asia';
    if (firstOctet >= 151 && firstOctet <= 200) return 'South America';
    if (firstOctet >= 201 && firstOctet <= 255) return 'Oceania';
  }
  
  return 'North America';
}

// Extract device platform from User-Agent (same as in api-tracker.ts)
function getDevicePlatform(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return 'iOS';
  }
  if (ua.includes('android')) {
    return 'Android';
  }
  if (ua.includes('windows phone')) {
    return 'Windows Phone';
  }
  if (ua.includes('macintosh') || ua.includes('mac os')) {
    return 'macOS';
  }
  if (ua.includes('windows')) {
    return 'Windows';
  }
  if (ua.includes('linux')) {
    return 'Linux';
  }
  
  return 'Web';
}

async function updateApiCallLogs() {
  console.log('🔄 Updating API call logs with region and device data...');

  try {
    // Get all API call logs that don't have region/device data
    const logsToUpdate = await prisma.apiCallLog.findMany({
      where: {
        OR: [
          { region: null },
          { devicePlatform: null }
        ]
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true
      }
    });

    console.log(`📊 Found ${logsToUpdate.length} logs to update`);

    // Update in batches
    const batchSize = 1000;
    let updated = 0;

    for (let i = 0; i < logsToUpdate.length; i += batchSize) {
      const batch = logsToUpdate.slice(i, i + batchSize);
      
      const updatePromises = batch.map(log => {
        const region = getRegionFromIP(log.ipAddress || '127.0.0.1');
        const devicePlatform = getDevicePlatform(log.userAgent || 'unknown');
        
        return prisma.apiCallLog.update({
          where: { id: log.id },
          data: {
            region,
            devicePlatform
          }
        });
      });

      await Promise.all(updatePromises);
      updated += batch.length;
      console.log(`✅ Updated ${updated}/${logsToUpdate.length} logs`);
    }

    console.log('🎉 All API call logs updated successfully!');
    
    // Show some statistics
    const regionStats = await prisma.apiCallLog.groupBy({
      by: ['region'],
      _count: { id: true }
    });
    
    const deviceStats = await prisma.apiCallLog.groupBy({
      by: ['devicePlatform'],
      _count: { id: true }
    });

    console.log('\n📈 Regional Distribution:');
    regionStats.forEach(stat => {
      console.log(`  ${stat.region}: ${stat._count.id.toLocaleString()} sessions`);
    });

    console.log('\n📱 Device Distribution:');
    deviceStats.forEach(stat => {
      console.log(`  ${stat.devicePlatform}: ${stat._count.id.toLocaleString()} sessions`);
    });

  } catch (error) {
    console.error('❌ Error updating API call logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateApiCallLogs();
