import { ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { drizzle, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '../config';
import { createChildLogger } from '../utils/logger';

import * as schema from './schema';

const logger = createChildLogger('database');

const isDevelopment = env.APP_ENV === 'development';

const queryClient = postgres(env.DB_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  debug: isDevelopment,
  ...(isDevelopment && {
    onnotice: (notice): void => logger.debug({ notice }, 'Database notice'),
  }),
});

export type TDatabaseConnection =
  | ReturnType<typeof drizzle<typeof schema>>
  | PgTransaction<
      PostgresJsQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >;

export const initDb = async (): Promise<TDatabaseConnection> => {
  try {
    const database = drizzle(queryClient, {
      schema,
      logger: isDevelopment,
    });

    // Проверяем соединение
    await queryClient`SELECT 1`;
    logger.info('Database connected successfully');

    return database;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to database');
    throw new Error('Database connection failed');
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await queryClient.end();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error({ error }, 'Error closing database connection');
  }
};
