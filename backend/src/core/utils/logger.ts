/**
 * Winston Logger Configuration
 * Structured JSON logging for production, pretty-printed for development
 */

import winston from 'winston';
import config from '../config/index.js';

/**
 * Log levels
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Log level based on environment
 */
const level = (): string => {
  const env = config.env;
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

/**
 * Custom format for development (colorized, pretty-printed)
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.metadata ? ` ${JSON.stringify(info.metadata)}` : ''}`
  )
);

/**
 * Custom format for production (JSON structured logs)
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create the logger instance
 */
const logger = winston.createLogger({
  level: level(),
  levels,
  format: config.env === 'production' ? productionFormat : developmentFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      stderrLevels: ['error', 'warn'],
    }),
  ],
  exitOnError: false,
});

/**
 * Add file transport in production
 */
if (config.env === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Log context interface for structured logging
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  restaurantId?: string;
  tableId?: string;
  orderId?: string;
  [key: string]: unknown;
}

/**
 * Create a child logger with context
 */
export function createLogger(context: LogContext): winston.Logger {
  return logger.child({ metadata: context });
}

/**
 * Log HTTP request
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  context?: LogContext
): void {
  logger.http('HTTP Request', {
    metadata: {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      ...context,
    },
  });
}

/**
 * Log error with stack trace
 */
export function logError(message: string, error: Error, context?: LogContext): void {
  logger.error(message, {
    metadata: {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    },
  });
}

/**
 * Log database query
 */
export function logQuery(query: string, duration: number, context?: LogContext): void {
  logger.debug('Database Query', {
    metadata: {
      query,
      duration: `${duration}ms`,
      ...context,
    },
  });
}

/**
 * Log cache operation
 */
export function logCache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, context?: LogContext): void {
  logger.debug(`Cache ${operation.toUpperCase()}`, {
    metadata: {
      operation,
      key,
      ...context,
    },
  });
}

/**
 * Log order event
 */
export function logOrderEvent(event: string, orderId: string, context?: LogContext): void {
  logger.info(`Order Event: ${event}`, {
    metadata: {
      orderId,
      event,
      ...context,
    },
  });
}

/**
 * Log payment event
 */
export function logPaymentEvent(event: string, paymentId: string, context?: LogContext): void {
  logger.info(`Payment Event: ${event}`, {
    metadata: {
      paymentId,
      event,
      ...context,
    },
  });
}

export default logger;
