import { NextRequest } from 'next/server';
import { logger } from './logger';

/**
 * Validates the SWIP App internal API key
 * This key is used exclusively by the SWIP App for data ingestion
 * 
 * @param req - Next.js request object
 * @returns boolean - true if valid, false otherwise
 */
export async function validateSwipInternalKey(req: NextRequest): Promise<boolean> {
  const key = req.headers.get('x-swip-internal-key');
  const expectedKey = process.env.SWIP_INTERNAL_API_KEY;

  // Check if key is provided
  if (!key) {
    logger.warn('SWIP internal key missing from request', {
      path: req.nextUrl.pathname,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    });
    return false;
  }

  // Check if environment variable is set
  if (!expectedKey) {
    logger.error('SWIP_INTERNAL_API_KEY not configured in environment variables');
    return false;
  }

  // Validate key (constant-time comparison to prevent timing attacks)
  const isValid = timingSafeEqual(key, expectedKey);

  if (!isValid) {
    logger.warn('Invalid SWIP internal key attempt', {
      path: req.nextUrl.pathname,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      keyPrefix: key.substring(0, 10) + '...',
    });
  }

  return isValid;
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * Compares two strings in constant time
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Get the SWIP internal API key from environment
 * Used for testing and validation
 */
export function getSwipInternalKey(): string | undefined {
  return process.env.SWIP_INTERNAL_API_KEY;
}

/**
 * Check if SWIP internal key is configured
 */
export function isSwipKeyConfigured(): boolean {
  return !!process.env.SWIP_INTERNAL_API_KEY && process.env.SWIP_INTERNAL_API_KEY.length >= 32;
}

