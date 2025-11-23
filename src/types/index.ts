import pino from 'pino';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type TLogger = pino.Logger;
