import { createContainer, asClass, asFunction, asValue } from 'awilix';

import { closeDatabase, initDb, TDatabaseConnection } from './db/connection';
import { BlockService } from './services/block';

const diContainer = createContainer({
  injectionMode: 'CLASSIC',
});

diContainer.register({
  db: asFunction(initDb)
    .singleton()
    .disposer(() => closeDatabase()),
  container: asValue(diContainer),
  blockService: asClass(BlockService),
});

declare module '@fastify/awilix' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Cradle {
    db: TDatabaseConnection;
    blockService: BlockService;
  }
}

export { diContainer };
