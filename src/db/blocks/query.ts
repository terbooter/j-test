import { nanoid } from 'nanoid';
import { v7 as uuidv7 } from 'uuid';

import { TDatabaseConnection } from '../connection';

import {
  createBlockPrepared,
  deleteBlockChildsPrepared,
  deleteBlockPrepared,
  findByIdPrepared,
  findByLinkPrepared,
  findByParentPrepared,
  findByWorkspacePrepared,
  updateContentPrepared,
} from './prepared';
import { TBlock } from './schema';

export const createBlock = async (
  db: TDatabaseConnection,
  data: Omit<TBlock, 'id' | 'createdAt' | 'link' | 'updatedAt' | 'deletedAt'>
): Promise<TBlock | null> => {
  const now = new Date();
  const result = await createBlockPrepared(db).execute({
    ...data,
    id: uuidv7(),
    createdAt: now,
    updatedAt: now,
    link: nanoid(10),
  });
  return result[0] ?? null;
};

export const findByWorkspace = (
  db: TDatabaseConnection,
  cursor: { order: number; id: string } | null = null,
  limit: number = 10
): Promise<TBlock[]> => {
  return findByWorkspacePrepared(db).execute({
    cursorOrder: cursor?.order ?? -1,
    cursorId: cursor?.id ?? '00000000-0000-0000-0000-000000000000',
    limit,
  });
};

export const findByParent = (
  db: TDatabaseConnection,
  parentId: string,
  cursor: { order: number; id: string } | null = null,
  limit: number = 10
): Promise<TBlock[]> => {
  return findByParentPrepared(db).execute({
    parentId,
    cursorOrder: cursor?.order ?? -1,
    cursorId: cursor?.id ?? '00000000-0000-0000-0000-000000000000',
    limit,
  });
};

export const findById = async (
  db: TDatabaseConnection,
  id: string
): Promise<TBlock | null> => {
  const [block] = await findByIdPrepared(db).execute({
    id
  });
  return block ?? null;
};

export const findByLink = async (
  db: TDatabaseConnection,
  link: string
): Promise<TBlock | null> => {
  const [block] = await findByLinkPrepared(db).execute({
    link
  });
  return block ?? null;
};

export const deleteBlock = async (
  db: TDatabaseConnection,
  id: string
): Promise<number> => {
  const [result] = await deleteBlockPrepared(db).execute({
    id,
    deletedAt: new Date().toISOString(),
  });
  return result.id != null ? 1 : 0;
};


export const deleteBlockChilds = async (
  db: TDatabaseConnection,
  parent: string
): Promise<number> => {
  const result = await deleteBlockChildsPrepared(db).execute({
    parent,
    deletedAt: new Date().toISOString(),
  });
  return result.length;
};

export const updateContentBlock = async (
  db: TDatabaseConnection,
  id: string,
  data: Partial<Pick<TBlock, 'content'>>
): Promise<TBlock | null> => {
  const [updatedBlock] = await updateContentPrepared(db).execute({
    id,
    content: JSON.stringify(data.content),
    updatedAt: new Date().toISOString(),
  });
  return updatedBlock ?? null;
};