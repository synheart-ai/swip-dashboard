/**
 * API Call Tracking Middleware
 * Automatically logs API calls to the database for analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './db';

// Simple IP-to-region mapping (in production, use a proper GeoIP service)
function getRegionFromIP(ipAddress: string): string {
  // For demo purposes, we'll simulate regions based on IP patterns
  // In production, use a service like MaxMind GeoIP2 or similar
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
  
  // Default fallback
  return 'North America';
}

// Extract device platform from User-Agent
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

export async function trackApiCall(
  request: NextRequest,
  response: NextResponse,
  startTime: number
) {
  try {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Extract relevant information
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const method = request.method;
    const statusCode = response.status;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Extract user ID from headers or auth (if available)
    const userId = request.headers.get('x-user-id') || null;
    const appId = request.headers.get('x-app-id') || null;
    
    // Extract location and device information
    const region = getRegionFromIP(ipAddress);
    const devicePlatform = getDevicePlatform(userAgent);
    
    // Log the API call
    await prisma.apiCallLog.create({
      data: {
        endpoint,
        method,
        statusCode,
        responseTime,
        userId,
        appId,
        ipAddress,
        userAgent,
        region,
        devicePlatform
      }
    });
  } catch (error) {
    // Don't let API tracking errors affect the main request
    console.error('Error tracking API call:', error);
  }
}

export async function trackApiCallFromMiddleware(
  endpoint: string,
  method: string,
  startTime: number,
  ipAddress: string,
  userAgent: string,
  userId: string | null,
  appId: string | null,
  statusCode: number
) {
  try {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Extract location and device information
    const region = getRegionFromIP(ipAddress);
    const devicePlatform = getDevicePlatform(userAgent);
    
    // Log the API call
    await prisma.apiCallLog.create({
      data: {
        endpoint,
        method,
        statusCode,
        responseTime,
        userId,
        appId,
        ipAddress,
        userAgent,
        region,
        devicePlatform
      }
    });
  } catch (error) {
    // Don't let API tracking errors affect the main request
    console.error('Error tracking API call from middleware:', error);
  }
}

export async function trackSystemUptime(serviceName: string, isUp: boolean, responseTime?: number, errorMessage?: string) {
  try {
    await prisma.systemUptime.create({
      data: {
        serviceName,
        isUp,
        responseTime,
        errorMessage
      }
    });
  } catch (error) {
    console.error('Error tracking system uptime:', error);
  }
}
