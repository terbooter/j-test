import { env } from './config';
import { BlockHandlers } from './handlers/block';
import { createServer } from './server';

const build = (): ReturnType<typeof createServer> => {
  return createServer({
    host: env.HOST,
    port: Number(env.PORT),
    handlers: [
      BlockHandlers,
    ],
    middlewares: [],
  });
};

const main = async (): Promise<void> => {
  const { start } = await build();
  await start();
};

void main();

export { build, main };
