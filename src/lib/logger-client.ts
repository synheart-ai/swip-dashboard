/**
 * Client-Safe Logger
 *
 * Logging utility for client-side code
 */

export function logError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', error.message, context, error.stack);
  } else {
    // In production, you might want to send to an error tracking service
    console.error('[ERROR]', error.message);
  }
}

export function logInfo(message: string, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[INFO]', message, context);
  }
}

export function logWarn(message: string, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[WARN]', message, context);
  }
}
