import { FastifyReply, FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

import { TBlock } from '../../../db/schema';

import { BlockListSchema } from './_schema';

export const ListHandler = async (
  request: FastifyRequest<{
    Querystring: FromSchema<typeof BlockListSchema.querystring>;
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {

  const blockService = request.server.diContainer.cradle.blockService;

  let blocks: TBlock[];
  if (request.query.parent === undefined) {
    blocks = await blockService.getByWorkspace(
      request.query.cursor
    );
  } else {
    const parent = await blockService.getByLink(
      request.query.parent
    );
    if (parent === null) {
      return reply
        .status(200)
        .send({ data: [], meta: { nextCursor: null, prevCursor: null } });
    }
    blocks = await blockService.getByParent(
      parent.id,
      request.query.cursor
    );
  }

  if (blocks.length === 0) {
    return reply
      .status(200)
      .send({ data: [], meta: { nextCursor: null, prevCursor: null } });
  }

  const lastBlock = blocks[blocks.length - 1];
  const firstBlock = blocks[0];

  return reply.send({
    data: blocks,
    meta: {
      nextCursor:
        lastBlock !== undefined ? blockService.createCursor(lastBlock) : null,
      prevCursor:
        request.query.cursor != null &&
        request.query.cursor !== '' &&
        firstBlock !== undefined
          ? blockService.createCursor(firstBlock)
          : null,
    },
  });
};
