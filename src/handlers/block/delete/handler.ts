import { FastifyReply, FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

import { BlockDeleteSchema } from './_schema';

export const DeleteHandler = async (
  request: FastifyRequest<{
    Params: FromSchema<typeof BlockDeleteSchema.params>;
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const blockService = request.server.diContainer.cradle.blockService;
  try {
    const block = await blockService.getByLink(
      request.params.link
    );
    if (block === null || block === undefined) {
      return reply.status(404).send({ error: 'not_found' });
    }

    const deleted = await blockService.delete(block);
    if (deleted === true) {
      return reply.status(200).send();
    }

    return reply.status(500).send({ error: 'server_error' });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'server_error' });
  }
};
