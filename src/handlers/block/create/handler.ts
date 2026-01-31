import { FastifyReply, FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

import { BlockValidationError } from '../../../services/block';
import { TBlockContentType, TBlockType } from '../../../types/block';

import { BlockCreateSchema } from './_schema';

export const CreateHandler = async (
  request: FastifyRequest<{ Body: FromSchema<typeof BlockCreateSchema.body> }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const blockService = request.server.diContainer.cradle.blockService;

  let parent = null;
  if (request.body.parent != null && request.body.parent !== '') {
    const parentBlock = await blockService.getByLink(request.body.parent);
    if (parentBlock === null || parentBlock === undefined) {
      return reply.status(404).send({ error: 'not_found' });
    }
    parent = parentBlock.id;
  }
  try {
    const block = await blockService.create({
      parent: parent,
      order: request.body.order ?? 0,
      type: request.body.type as TBlockType,
      content: request.body.content as TBlockContentType,
    });

    if (block === null || block === undefined) {
      request.server.log.error('Failed to create block');
      return reply.status(500).send({ error: 'server_error' });
    }

    if (parent) {
      await blockService.updateCounters(parent);
    }

    return reply.status(201).send({ data: block });
  } catch (error) {
    if (error instanceof BlockValidationError) {
      return reply.status(400).send({
        error: error.code,
        message: error.message,
      });
    }
    request.server.log.error(error);
    return reply.status(500).send({ error: 'server_error' });
  }
};
