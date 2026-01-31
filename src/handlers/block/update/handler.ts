import { FastifyReply, FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

import { BlockValidationError } from '../../../services/block';
import { TBlockContentType } from '../../../types/block';

import { BlockUpdateSchema } from './_schema';

export const UpdateHandler = async (
  request: FastifyRequest<{
    Params: FromSchema<typeof BlockUpdateSchema.params>;
    Body: FromSchema<typeof BlockUpdateSchema.body>;
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const blockService = request.server.diContainer.cradle.blockService;
  try {
    const block = await blockService.getByLink(request.params.link);
    if (block === null) {
      return reply.status(404).send({ error: 'not_found' });
    }

    const updatedBlock = await blockService.updateContent(block, {
      content: request.body.content as TBlockContentType,
    });

    if (updatedBlock === null || updatedBlock === undefined) {
      return reply
        .status(500)
        .send({ error: 'server_error', message: 'Failed to update block' });
    }

    return reply.send({ data: updatedBlock });
  } catch (error) {
    request.server.log.error(error);
    if (error instanceof BlockValidationError) {
      return reply.status(400).send({
        error: error.code,
        message: error.message,
      });
    }

    return reply
      .status(500)
      .send({ error: 'server_error', message: 'Failed to update block' });
  }
};
