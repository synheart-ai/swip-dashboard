/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup to prevent runtime errors.
 */

import { logError, logInfo } from './logger';

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  errors: string[];
}

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
] as const;

/**
 * Optional environment variables (warn if missing)
 */
const OPTIONAL_ENV_VARS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'REDIS_URL',
  'REDIS_HOST',
  'ALLOWED_ORIGINS',
] as const;

/**
 * Validates all required environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const errors: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL) {
    try {
      new URL(process.env.DATABASE_URL);
    } catch (error) {
      errors.push('DATABASE_URL is not a valid URL');
    }
  }

  // Validate NEXTAUTH_URL format
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch (error) {
      errors.push('NEXTAUTH_URL is not a valid URL');
    }
  }

  // Check Redis configuration
  const hasRedisUrl = !!process.env.REDIS_URL;
  const hasRedisHost = !!process.env.REDIS_HOST;

  if (!hasRedisUrl && !hasRedisHost) {
    logInfo('No Redis configuration found. Rate limiting will be disabled.');
  }

  // Warn about missing optional OAuth providers
  const hasGoogle =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  const hasGithub =
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;

  if (!hasGoogle) {
    logInfo('Google OAuth not configured. Google login will be unavailable.');
  }

  if (!hasGithub) {
    logInfo('GitHub OAuth not configured. GitHub login will be unavailable.');
  }

  if (!hasGoogle && !hasGithub) {
    errors.push(
      'At least one OAuth provider (Google or GitHub) must be configured'
    );
  }

  const valid = errors.length === 0;

  return {
    valid,
    missing,
    errors,
  };
}

/**
 * Validates environment and exits process if validation fails
 * Should be called at application startup
 */
export function validateEnvironmentOrExit(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach((error) => {
      console.error(`  - ${error}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');

    logError(new Error('Environment validation failed'), {
      missing: result.missing,
      errors: result.errors,
    });

    // In production, exit the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  } else {
    logInfo('✅ Environment validation passed');
  }
}

/**
 * Gets an environment variable with a fallback value
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Gets an environment variable as a number
 */
export function getEnvNumber(key: string, fallback?: number): number {
  const value = process.env[key];
  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return num;
}

/**
 * Gets an environment variable as a boolean
 */
export function getEnvBoolean(key: string, fallback?: boolean): boolean {
  const value = process.env[key];
  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Checks if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
