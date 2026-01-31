import { fastifyAwilixPlugin } from '@fastify/awilix';
import {
  fastify,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { diContainer } from './container';
import { runMigrations } from './db/migrations';
import { createChildLogger, loggerOptions } from './utils/logger';

export interface IServerConfig {
  host: string;
  port: number;
  handlers: Array<(fastify: FastifyInstance) => void>;
  middlewares: Array<FastifyPluginAsync>;
}

export const createServer = async (
  config: IServerConfig
): Promise<{
  server: FastifyInstance;
  start: () => Promise<void>;
}> => {
  const serverLogger = createChildLogger('server');
  const server = fastify({
    logger: loggerOptions,
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
  });

  server.register(fastifyAwilixPlugin, {
    container: diContainer,
    disposeOnClose: true,
    strictBooleanEnforced: true,
  });

  for (const middleware of config.middlewares) {
    await server.register(middleware as FastifyPluginCallback);
  }

  for (const handler of config.handlers) {
    await server.register(handler as FastifyPluginCallback);
  }

  server.get('/health', (_: FastifyRequest, reply: FastifyReply) => {
    reply.send({ status: 'ok' });
  });

  server.get('/debug/routes', async () => {
    return server.printRoutes({ commonPrefix: false });
  });

  return {
    server,
    start: async (): Promise<void> => {
      try {
        serverLogger.info('Running database migrations...');
        await runMigrations();
        serverLogger.info('Database migrations completed successfully');

        await server.listen({ port: config.port, host: config.host });
        serverLogger.info(`Server started on ${config.host}:${config.port}`);
        if (process.send) {
          process.send('ready');
        }
      } catch (error) {
        serverLogger.error({ error }, 'Failed to start server');
        process.exit(1);
      }
    },
  };
};
