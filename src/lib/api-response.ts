/**
 * Standardized API Response Utilities
 *
 * Provides consistent response formatting across all API endpoints
 */

import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse, RateLimitInfo } from '@/types';
import { logError } from './logger';

/**
 * Creates a successful API response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Creates an error API response
 */
export function errorResponse(
  error: string | Error,
  status: number = 500,
  code?: string
): NextResponse<ApiResponse> {
  const message = typeof error === 'string' ? error : error.message;

  // Log error for monitoring
  if (status >= 500) {
    logError(typeof error === 'string' ? new Error(error) : error, {
      statusCode: status,
      code,
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code && { code }),
    },
    { status }
  );
}

/**
 * Creates a paginated API response
 */
export function paginatedResponse<T>(
  data: T,
  page: number,
  limit: number,
  total: number,
  status: number = 200
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status }
  );
}

/**
 * Creates a validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string> | string
): NextResponse<ApiResponse> {
  const message = typeof errors === 'string' ? errors : 'Validation failed';
  const details = typeof errors === 'object' ? errors : undefined;

  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status: 400 }
  );
}

/**
 * Creates an unauthorized error response
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ApiResponse> {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * Creates a forbidden error response
 */
export function forbiddenResponse(
  message: string = 'Forbidden'
): NextResponse<ApiResponse> {
  return errorResponse(message, 403, 'FORBIDDEN');
}

/**
 * Creates a not found error response
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND');
}

/**
 * Creates a rate limit exceeded response
 */
export function rateLimitResponse(
  rateLimitInfo: RateLimitInfo
): NextResponse<ApiResponse> {
  const response = NextResponse.json(
    {
      success: false,
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    { status: 429 }
  );

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString());
  response.headers.set('Retry-After', Math.ceil((rateLimitInfo.reset - Date.now()) / 1000).toString());

  return response;
}

/**
 * Adds rate limit headers to a response
 */
export function withRateLimitHeaders(
  response: NextResponse,
  rateLimitInfo: RateLimitInfo
): NextResponse {
  response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString());
  return response;
}

/**
 * Creates a server error response
 */
export function serverErrorResponse(
  error?: Error | string
): NextResponse<ApiResponse> {
  const message = error
    ? typeof error === 'string'
      ? error
      : error.message
    : 'Internal server error';

  return errorResponse(message, 500, 'INTERNAL_SERVER_ERROR');
}

/**
 * Wraps an async API handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiResponse>> {
  return handler().catch((error) => {
    console.error('API Error:', error);
    return serverErrorResponse(error);
  });
}

/**
 * Creates a method not allowed response
 */
export function methodNotAllowedResponse(
  allowedMethods: string[]
): NextResponse<ApiResponse> {
  const response = errorResponse(
    `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
    405,
    'METHOD_NOT_ALLOWED'
  );
  response.headers.set('Allow', allowedMethods.join(', '));
  return response;
}
