/**
 * PostgreSQL Database Connection
 * Connection pooling with pg library
 */

import pg from 'pg';
import config from '../../core/config/index.js';
import logger, { logQuery } from '../../core/utils/logger.js';

const { Pool } = pg;

/**
 * Database pool instance
 */
let pool: pg.Pool | null = null;

/**
 * Get database pool instance (singleton)
 */
export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      min: config.database.poolMin,
      max: config.database.poolMax,
      idleTimeoutMillis: config.database.poolIdle,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      logger.error('Unexpected database pool error', err);
    });

    pool.on('connect', () => {
      logger.debug('New database connection established');
    });

    logger.info('Database connection pool created', {
      metadata: {
        host: config.database.host,
        database: config.database.database,
        minConnections: config.database.poolMin,
        maxConnections: config.database.poolMax,
      },
    });
  }

  return pool;
}

/**
 * Execute a query with logging
 */
export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<pg.QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(sql, params);
    const duration = Date.now() - start;
    logQuery(sql, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Database query error', error as Error, {
      metadata: { query: sql, duration, params: params.length },
    });
    throw error;
  }
}

/**
 * Execute a query within a transaction
 */
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', error as Error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a query with serializable isolation level
 * Used for critical operations like order creation
 */
export async function serializableTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Serializable transaction rolled back', error as Error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get a client from the pool for manual control
 */
export async function getClient(): Promise<pg.PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection pool closed');
  }
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT 1');
    return result.rowCount === 1;
  } catch (error) {
    logger.error('Database health check failed', error as Error);
    return false;
  }
}

export default {
  getPool,
  query,
  transaction,
  serializableTransaction,
  getClient,
  closePool,
  checkDatabaseHealth,
};
