/**
 * Server-Side Logger Utility
 *
 * Uses winston for structured logging on the server
 * DO NOT import this in client components - use logger-client.ts instead
 */

import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'swip-dashboard' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file logging only if ENABLE_FILE_LOGGING is set
// Note: Vercel and other serverless platforms have read-only filesystems
// File logging is only useful for self-hosted deployments
if (process.env.ENABLE_FILE_LOGGING === 'true' && process.env.NODE_ENV === 'production') {
  try {
    logger.add(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      })
    );

    logger.add(
      new winston.transports.File({
        filename: 'logs/combined.log',
      })
    );
  } catch (error) {
    // Fail gracefully if file logging cannot be set up
    console.warn('File logging could not be enabled:', error);
  }
}

export function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

export function logInfo(message: string, context?: Record<string, any>) {
  logger.info({ message, ...context });
}

export function logWarn(message: string, context?: Record<string, any>) {
  logger.warn({ message, ...context });
}
