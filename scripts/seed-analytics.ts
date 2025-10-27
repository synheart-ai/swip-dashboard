/**
 * Seed script to populate initial API call and uptime data
 * This helps demonstrate the analytics functionality
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAnalyticsData() {
  console.log('Seeding analytics data...');

  try {
    // Generate API call logs for the last 60 days
    const now = new Date();
    const apiEndpoints = [
      '/api/swip/ingest',
      '/api/apps',
      '/api/api-keys',
      '/api/auth/profile',
      '/api/health',
      '/api/public/swipsessions'
    ];
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const statusCodes = [200, 201, 400, 401, 404, 500];
    
    const apiCallPromises = [];
    
    // Generate ~1.2M API calls over 60 days
    for (let i = 0; i < 1200000; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      // Add some randomness to the timestamp within the day
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));
      createdAt.setSeconds(Math.floor(Math.random() * 60));
      
      const endpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
      const responseTime = Math.floor(Math.random() * 200) + 20; // 20-220ms
      
      apiCallPromises.push(
        prisma.apiCallLog.create({
          data: {
            endpoint,
            method,
            statusCode,
            responseTime,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (compatible; SWIP-Dashboard/1.0)',
            createdAt
          }
        })
      );
      
      // Batch insert every 1000 records
      if (apiCallPromises.length >= 1000) {
        await Promise.all(apiCallPromises);
        apiCallPromises.length = 0;
        console.log(`Created ${i + 1} API call logs...`);
      }
    }
    
    // Insert remaining records
    if (apiCallPromises.length > 0) {
      await Promise.all(apiCallPromises);
    }
    
    console.log('✅ API call logs seeded successfully');
    
    // Generate system uptime data for the last 60 days
    const services = ['database', 'redis', 'api'];
    const uptimePromises = [];
    
    // Generate uptime checks every 5 minutes for 60 days
    const totalChecks = (60 * 24 * 12); // 60 days * 24 hours * 12 checks per hour (every 5 minutes)
    
    for (let i = 0; i < totalChecks; i++) {
      const minutesAgo = i * 5;
      const createdAt = new Date(now.getTime() - minutesAgo * 60 * 1000);
      
      for (const service of services) {
        // 99.9% uptime means 0.1% downtime
        const isUp = Math.random() > 0.001; // 99.9% chance of being up
        const responseTime = isUp ? Math.floor(Math.random() * 50) + 10 : undefined;
        const errorMessage = isUp ? undefined : 'Service temporarily unavailable';
        
        uptimePromises.push(
          prisma.systemUptime.create({
            data: {
              serviceName: service,
              isUp,
              responseTime,
              errorMessage,
              createdAt
            }
          })
        );
      }
      
      // Batch insert every 1000 records
      if (uptimePromises.length >= 1000) {
        await Promise.all(uptimePromises);
        uptimePromises.length = 0;
        console.log(`Created ${i + 1} uptime checks...`);
      }
    }
    
    // Insert remaining records
    if (uptimePromises.length > 0) {
      await Promise.all(uptimePromises);
    }
    
    console.log('✅ System uptime data seeded successfully');
    console.log('🎉 Analytics data seeding completed!');
    
  } catch (error) {
    console.error('Error seeding analytics data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAnalyticsData();
