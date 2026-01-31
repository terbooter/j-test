import { FastifyReply, FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

import { BlockGetByLinkSchema } from './_schema';

export const GetByLinkHandler = async (
  request: FastifyRequest<{
    Params: FromSchema<typeof BlockGetByLinkSchema.params>;
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const blockService = request.server.diContainer.cradle.blockService;

  try {
    const block = await blockService.getByLink(request.params.link);

    if (block === null) {
      return reply.status(404).send({ error: 'not_found' });
    }

    return reply.send({ data: block });
  } catch (error) {
    request.server.log.error(error);
    return reply
      .status(500)
      .send({ error: 'server_error', message: 'Failed to get block' });
  }
};
