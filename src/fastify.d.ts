import { OAuth2Namespace } from '@fastify/oauth2';
import { FastifyMiddleware } from 'fastify';

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface FastifyRequest {
    clientIp: string;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
    appleOAuth2: OAuth2Namespace;
    authenticate: FastifyMiddleware;
  }
}

declare module '@fastify/jwt' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface FastifyJWT {
    payload: IJWTPaylod;
    user: IJWTPaylod;
  }
}

interface IJWTPaylod {
  id: string;
  email?: string;
  name?: string;
  photo?: string;
  language?: string;
}

interface IReply {
  200: { success: boolean };
  302: { url: string };
  '4xx': { error: string };
}
