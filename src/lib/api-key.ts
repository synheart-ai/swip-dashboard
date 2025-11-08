/**
 * API Key Utilities
 *
 * Secure API key generation, hashing, and validation
 */

import { randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';

const API_KEY_PREFIX = 'swip_key_';
const API_KEY_LENGTH = 32; // 32 bytes = 64 hex characters
const BCRYPT_ROUNDS = 10;

/**
 * Generates a new secure API key
 * Format: swip_key_{64-char-hex-string}
 */
export function generateApiKey(): string {
  const randomPart = randomBytes(API_KEY_LENGTH).toString('hex');
  return `${API_KEY_PREFIX}${randomPart}`;
}

/**
 * Hashes an API key using bcrypt
 * This is slower but more secure than simple hashing
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, BCRYPT_ROUNDS);
}

/**
 * Verifies an API key against a hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(apiKey, hash);
}

/**
 * Creates a fast lookup hash for indexing
 * Uses SHA-256 for consistent, fast lookups
 * This is stored separately for quick database queries
 */
export function createLookupHash(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Extracts a preview of the API key for display (first 10 chars)
 */
export function getApiKeyPreview(apiKey: string): string {
  return apiKey.substring(0, 10) + '...';
}

/**
 * Validates API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    return false;
  }

  const keyPart = apiKey.substring(API_KEY_PREFIX.length);

  // Check length (should be 64 hex characters)
  if (keyPart.length !== API_KEY_LENGTH * 2) {
    return false;
  }

  // Check if it's valid hex
  return /^[0-9a-f]{64}$/i.test(keyPart);
}
