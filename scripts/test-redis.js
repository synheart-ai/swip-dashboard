#!/usr/bin/env node

/**
 * Redis Cloud Connection Test Script
 * 
 * Usage:
 *   node scripts/test-redis.js
 * 
 * Environment variables required:
 *   REDIS_URL or REDIS_HOST + REDIS_PORT + REDIS_PASSWORD
 */

const { redis } = require('../src/lib/redis');

async function testRedisConnection() {
  console.log('🔍 Testing Redis Cloud connection...\n');
  
  try {
    // Test basic connectivity
    console.log('1. Testing PING...');
    const pong = await redis.ping();
    console.log(`   ✅ PONG: ${pong}\n`);
    
    // Test set/get operations
    console.log('2. Testing SET/GET operations...');
    const testKey = 'swip-test:' + Date.now();
    const testValue = 'Hello Redis Cloud!';
    
    await redis.set(testKey, testValue, 'EX', 60); // Expire in 60 seconds
    const retrievedValue = await redis.get(testKey);
    
    if (retrievedValue === testValue) {
      console.log(`   ✅ SET/GET: Successfully stored and retrieved "${testValue}"\n`);
    } else {
      console.log(`   ❌ SET/GET: Expected "${testValue}", got "${retrievedValue}"\n`);
    }
    
    // Test rate limiting operations
    console.log('3. Testing rate limiting operations...');
    const rateLimitKey = 'rate-limit:test:' + Date.now();
    const now = Date.now();
    
    // Add some test entries for rate limiting
    await redis.zadd(rateLimitKey, now, `${now}-1`);
    await redis.zadd(rateLimitKey, now + 1000, `${now + 1000}-2`);
    await redis.zadd(rateLimitKey, now + 2000, `${now + 2000}-3`);
    
    const count = await redis.zcard(rateLimitKey);
    console.log(`   ✅ Rate limiting: Successfully added ${count} entries\n`);
    
    // Clean up test data
    await redis.del(testKey);
    await redis.del(rateLimitKey);
    console.log('4. Cleanup: Removed test data\n');
    
    // Get Redis info
    console.log('5. Redis Cloud information:');
    const info = await redis.info('server');
    const lines = info.split('\r\n');
    const version = lines.find(line => line.startsWith('redis_version:'));
    const uptime = lines.find(line => line.startsWith('uptime_in_seconds:'));
    
    if (version) console.log(`   📊 Redis Version: ${version.split(':')[1]}`);
    if (uptime) console.log(`   ⏱️  Uptime: ${uptime.split(':')[1]} seconds`);
    
    console.log('\n🎉 Redis Cloud connection test completed successfully!');
    console.log('✅ Your Redis Cloud setup is working correctly.\n');
    
  } catch (error) {
    console.error('❌ Redis Cloud connection test failed:');
    console.error(`   Error: ${error.message}\n`);
    
    console.log('🔧 Troubleshooting tips:');
    console.log('   1. Check your REDIS_URL environment variable');
    console.log('   2. Verify Redis Cloud database is running');
    console.log('   3. Check network connectivity');
    console.log('   4. Verify credentials are correct\n');
    
    process.exit(1);
  } finally {
    await redis.disconnect();
  }
}

// Run the test
testRedisConnection().catch(console.error);