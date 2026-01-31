import { FastifyInstance } from 'fastify';

import { BlockCreateSchema, CreateHandler } from './create';
import { BlockDeleteSchema, DeleteHandler } from './delete';
import { GetByLinkHandler, BlockGetByLinkSchema } from './get-by-link';
import { ListHandler, BlockListSchema } from './list';
import { BlockUpdateSchema, UpdateHandler } from './update';
import { AuthLoginSchema } from '../auth/_schema';
import { AuthHandler } from '../auth';

export const BlockHandlers = (fastify: FastifyInstance): void => {
  fastify.register(
    (fastify, _opts, done) => {
      fastify.get('/block', {
        schema: BlockListSchema,
        handler: ListHandler,
      });
      fastify.post('/block', {
        schema: BlockCreateSchema,
        handler: CreateHandler,
      });

      fastify.get('/block/:link', {
        schema: BlockGetByLinkSchema,
        handler: GetByLinkHandler,
      });
      fastify.put('/block/:link', {
        schema: BlockUpdateSchema,
        handler: UpdateHandler,
      });
      fastify.delete('/block/:link', {
        schema: BlockDeleteSchema,
        handler: DeleteHandler,
      });
      fastify.post('/auth', {
        schema: AuthLoginSchema,
        handler: AuthHandler,
      });

      done();
    },
    {
      prefix: '/v1',
    }
  );
};
