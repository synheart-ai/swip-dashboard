/**
 * Centralized Type Definitions for SWIP Dashboard
 *
 * This file contains all shared types, interfaces, and enums used across the application.
 * Organized by domain for better maintainability.
 */

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response structure for all endpoints
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
}

export interface UserProfile extends User {
  apps: App[];
  apiKeys: ApiKey[];
}

// ============================================================================
// App Types
// ============================================================================

export interface App {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  owner?: User;
}

export interface AppWithStats extends App {
  totalSessions: number;
  averageScore: number;
  lastSessionAt?: Date;
}

export interface CreateAppInput {
  name: string;
}

export interface UpdateAppInput {
  name?: string;
}

// ============================================================================
// API Key Types
// ============================================================================

export interface ApiKey {
  id: string;
  key: string;
  appId: string;
  userId: string;
  revoked: boolean;
  lastUsed: Date | null;
  createdAt: Date;
  app?: App;
}

export interface CreateApiKeyInput {
  appId: string;
}

export interface ApiKeyDisplay extends Omit<ApiKey, 'key'> {
  keyPreview: string; // Only shows first 10 chars
}

// ============================================================================
// SWIP Session Types
// ============================================================================

export interface HRDataPoint {
  timestamp: number; // Unix timestamp in ms
  bpm: number;
}

export interface HRVMetrics {
  rmssd: number;
  sdnn: number;
  pnn50?: number;
  meanHR?: number;
  maxHR?: number;
  minHR?: number;
}

export type EmotionState =
  | 'calm'
  | 'focused'
  | 'stressed'
  | 'anxious'
  | 'happy'
  | 'sad'
  | 'neutral'
  | 'excited';

export interface SwipSession {
  id: string;
  appId: string;
  sessionId: string;
  swipScore: number;
  hrData: HRDataPoint[];
  hrvMetrics: HRVMetrics;
  emotion: EmotionState | null;
  timestamp: Date;
  app?: App;
}

export interface SwipSessionInput {
  sessionId: string;
  hrData: HRDataPoint[];
  hrvMetrics: HRVMetrics;
  emotion?: EmotionState;
}

// ============================================================================
// Leaderboard Types
// ============================================================================

export interface LeaderboardEntry {
  appId: string;
  appName: string;
  avgScore: number;
  totalSessions: number;
  window: string;
  rank: number;
  change?: number; // Change in rank from previous period
}

export interface LeaderboardSnapshot {
  id: string;
  appId: string;
  avgScore: number;
  sessionCount: number;
  window: string;
  createdAt: Date;
  app?: App;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user?: User;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

// ============================================================================
// Chart & Visualization Types
// ============================================================================

export interface ChartDataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
}

export interface SessionChartData {
  swipScores: ChartDataPoint[];
  heartRateData: ChartDataPoint[];
  hrvData: ChartDataPoint[];
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  order: SortOrder;
}

export interface FilterConfig {
  [key: string]: any;
}

export interface PaginationConfig {
  page: number;
  limit: number;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

// ============================================================================
// Validation Schemas (Zod types)
// ============================================================================

export interface SwipIngestPayload {
  sessionId: string;
  hrData: HRDataPoint[];
  hrvMetrics: HRVMetrics;
  emotion?: EmotionState;
}

// ============================================================================
// Environment Variables Types
// ============================================================================

export interface EnvironmentConfig {
  // Database
  DATABASE_URL: string;

  // Auth
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;

  // Redis
  REDIS_URL?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;

  // CORS
  ALLOWED_ORIGINS?: string;

  // Node
  NODE_ENV: 'development' | 'production' | 'test';
}
