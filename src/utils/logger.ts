import pino from 'pino';

import { env } from '../config';

const isDevelopment = env.APP_ENV === 'local' || env.APP_ENV === 'development';

const baseConfig: pino.LoggerOptions = {
  level: isDevelopment ? 'debug' : 'info',
  formatters: {
    level: (label): { level: string } => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const developmentConfig: pino.LoggerOptions = {
  ...baseConfig,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
};
export const loggerOptions = isDevelopment ? developmentConfig : baseConfig;
export const logger = pino(isDevelopment ? developmentConfig : baseConfig);

export const createChildLogger = (name: string): pino.Logger => {
  return logger.child({ module: name });
};
