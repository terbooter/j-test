// handlers/auth/handler.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
// import { AuthService } from '../../../services/auth'; // ← импорт сервиса

import { AuthLoginSchema } from './_schema'; // ← убедитесь, что схема называется так

export const AuthHandler = async (
  request: FastifyRequest<{ Body: FromSchema<typeof AuthLoginSchema.body> }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  // Получаем authService из DI-контейнера Awilix
  const authService = request.server.diContainer.cradle.authService;

  const { username, password } = request.body;

  try {
    // Вызываем метод login
    const { token, user } = await authService.login(username, password);
    return reply.send({ token, user });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(401).send({ error: 'unauthorized' });
  }
};
