import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { env } from '../config';
import { createChildLogger } from '../utils/logger';

const logger = createChildLogger('migrations');

export const runMigrations = async (): Promise<void> => {
  const migrationClient = postgres(env.DB_URL, {
    max: 1,
    idle_timeout: 0,
    connect_timeout: 10,
  });
  try {
    const migrationDatabase = drizzle(migrationClient, {});

    logger.info('Running migrations...');
    await migrate(migrationDatabase, { migrationsFolder: './migrations' });
    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error({ error }, 'Migration failed');
    throw error;
  } finally {
    await migrationClient.end();
  }
};
