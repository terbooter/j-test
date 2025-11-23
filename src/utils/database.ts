import { TDatabaseConnection } from '../db/connection';

const preparedStatements = new Map();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyPrepare = (query: (db: TDatabaseConnection) => any) => {
  return (db: TDatabaseConnection): ReturnType<typeof query> => {
    const queryName = query.name;
    if (!queryName) {
      throw new Error(
        'lazyPrepare can only be used with named functions or variables.'
      );
    }
    if (preparedStatements.has(queryName) === false) {
      preparedStatements.set(queryName, query(db).prepare(queryName));
    }
    return preparedStatements.get(queryName);
  };
};
