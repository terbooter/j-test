import { createHash } from 'crypto';

import { Column, SQL, sql } from 'drizzle-orm';

import { TDatabaseConnection } from './connection';

const preparedStatements = new WeakMap();

const generatePreparedStatementName = (query: Function): string => {
  const queryString = query.toString();
  const hash = createHash('md5').update(queryString).digest('hex');
  return `prepared_${hash.substring(0, 16)}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyPrepare = (query: (db: TDatabaseConnection) => any) => {
  return (db: TDatabaseConnection): ReturnType<typeof query> => {
    if (preparedStatements.has(query) === false) {
      const queryName = generatePreparedStatementName(query);
      preparedStatements.set(query, query(db).prepare(queryName));
    }
    return preparedStatements.get(query);
  };
};

export const i18n = (col: Column, lang: string): SQL<string> => {
  return sql<string>`${col}->>${lang}`;
};
