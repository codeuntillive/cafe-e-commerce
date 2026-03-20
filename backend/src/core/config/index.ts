/**
 * Application Configuration
 * Centralized configuration management with environment variable validation
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Environment type
 */
type Environment = 'development' | 'test' | 'production';

/**
 * Database configuration interface
 */
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  poolMin: number;
  poolMax: number;
  poolIdle: number;
}

/**
 * Redis configuration interface
 */
interface RedisConfig {
  host: string;
  port: number;
  password: string | null;
  db: number;
  keyPrefix: string;
}

/**
 * JWT configuration interface
 */
interface JWTConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  issuer: string;
}

/**
 * Server configuration interface
 */
interface ServerConfig {
  port: number;
  host: string;
  environment: Environment;
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

/**
 * Payment gateway configuration
 */
interface PaymentConfig {
  stripeSecretKey: string | null;
  stripeWebhookSecret: string | null;
  razorpayKeyId: string | null;
  razorpayKeySecret: string | null;
}

/**
 * Application configuration interface
 */
interface AppConfig {
  env: Environment;
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JWTConfig;
  payment: PaymentConfig;
}

/**
 * Get required environment variable (throws if missing)
 */
function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get environment variable with default value
 */
function getEnvVar(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value !== undefined && value !== '' ? value : defaultValue;
}

/**
 * Get optional environment variable (can be null)
 */
function getOptionalEnvVar(key: string): string | null {
  const value = process.env[key];
  return value !== undefined && value !== '' ? value : null;
}

/**
 * Get numeric environment variable
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const stringValue = process.env[key];
  if (stringValue === undefined || stringValue === '') {
    return defaultValue;
  }
  const value = parseInt(stringValue, 10);
  if (isNaN(value)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return value;
}

/**
 * Get boolean environment variable
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const stringValue = process.env[key];
  if (stringValue === undefined || stringValue === '') {
    return defaultValue;
  }
  return stringValue.toLowerCase() === 'true';
}

/**
 * Parse CORS origins from environment
 */
function parseCorsOrigins(origins: string): string[] {
  return origins.split(',').map(origin => origin.trim()).filter(Boolean);
}

/**
 * Get current environment
 */
function getEnvironment(): Environment {
  const env = getEnvVar('NODE_ENV', 'development');
  if (env === 'test' || env === 'production') {
    return env;
  }
  return 'development';
}

/**
 * Application configuration object
 */
export const config: AppConfig = {
  env: getEnvironment(),
  
  server: {
    port: getEnvNumber('PORT', 3000),
    host: getEnvVar('HOST', '0.0.0.0'),
    environment: getEnvironment(),
    corsOrigins: parseCorsOrigins(getEnvVar('CORS_ORIGINS', 'http://localhost:5173')),
    rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 60000),
    rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvNumber('DB_PORT', 5432),
    database: getEnvVar('DB_NAME', 'restaurant_qr'),
    user: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD', 'postgres'),
    ssl: getEnvBoolean('DB_SSL', false),
    poolMin: getEnvNumber('DB_POOL_MIN', 2),
    poolMax: getEnvNumber('DB_POOL_MAX', 10),
    poolIdle: getEnvNumber('DB_POOL_IDLE', 10000),
  },

  redis: {
    host: getEnvVar('REDIS_HOST', 'localhost'),
    port: getEnvNumber('REDIS_PORT', 6379),
    password: getOptionalEnvVar('REDIS_PASSWORD'),
    db: getEnvNumber('REDIS_DB', 0),
    keyPrefix: getEnvVar('REDIS_KEY_PREFIX', 'qr:'),
  },

  jwt: {
    accessTokenSecret: getEnvVar('JWT_ACCESS_SECRET', 'your-access-secret-key-change-in-production'),
    refreshTokenSecret: getEnvVar('JWT_REFRESH_SECRET', 'your-refresh-secret-key-change-in-production'),
    accessTokenExpiry: getEnvVar('JWT_ACCESS_EXPIRY', '15m'),
    refreshTokenExpiry: getEnvVar('JWT_REFRESH_EXPIRY', '7d'),
    issuer: getEnvVar('JWT_ISSUER', 'restaurant-qr-system'),
  },

  payment: {
    stripeSecretKey: getOptionalEnvVar('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: getOptionalEnvVar('STRIPE_WEBHOOK_SECRET'),
    razorpayKeyId: getOptionalEnvVar('RAZORPAY_KEY_ID'),
    razorpayKeySecret: getOptionalEnvVar('RAZORPAY_KEY_SECRET'),
  },
};

/**
 * Check if running in development mode
 */
export const isDevelopment = config.env === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = config.env === 'production';

/**
 * Check if running in test mode
 */
export const isTest = config.env === 'test';

export default config;
