import 'dotenv/config';

type TEnv = {
  APP_ENV: string;
  HOST: string;
  PORT: string | number;
  DB_URL: string;
};

function getRequiredEnvVar(name: string): string {
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[name];
  return value !== undefined && value !== '' ? value : defaultValue;
}

function getOptionalEnvVarNumber(name: string, defaultValue: number): number {
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[name];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const env: TEnv = {
  APP_ENV: 'local',
  HOST: '0.0.0.0',
  PORT: getOptionalEnvVarNumber('PORT', 8080),
  DB_URL: `postgres://${getRequiredEnvVar('DB_USER')}:${getRequiredEnvVar('DB_PASS')}@${getRequiredEnvVar('DB_HOST')}:${getOptionalEnvVarNumber('DB_PORT', 5432)}/${getRequiredEnvVar('DB_NAME')}`,
};
