import { and, asc, eq, gt, isNull, or, sql } from 'drizzle-orm';

import { TDatabaseConnection } from '../connection';
import { createLazyPrepare } from '../utils';

import { blocks } from './schema';

export const findByWorkspacePrepared = createLazyPrepare(
  (db: TDatabaseConnection) =>
    db
      .select()
      .from(blocks)
      .where(
        and(
          isNull(blocks.parent),
          isNull(blocks.deletedAt),
          or(
            gt(blocks.order, sql.placeholder('cursorOrder')),
            and(
              eq(blocks.order, sql.placeholder('cursorOrder')),
              gt(blocks.id, sql.placeholder('cursorId'))
            )
          )
        )
      )
      .orderBy(asc(blocks.order), asc(blocks.id))
      .limit(sql.placeholder('limit'))
);

export const findByParentPrepared = createLazyPrepare(
  (db: TDatabaseConnection) =>
    db
      .select()
      .from(blocks)
      .where(
        and(
          eq(blocks.parent, sql.placeholder('parentId')),
          isNull(blocks.deletedAt),
          or(
            gt(blocks.order, sql.placeholder('cursorOrder')),
            and(
              eq(blocks.order, sql.placeholder('cursorOrder')),
              gt(blocks.id, sql.placeholder('cursorId'))
            )
          )
        )
      )
      .orderBy(asc(blocks.order), asc(blocks.id))
      .limit(sql.placeholder('limit'))
);

export const findByIdPrepared = createLazyPrepare((db: TDatabaseConnection) =>
  db
    .select()
    .from(blocks)
    .where(and(eq(blocks.id, sql.placeholder('id')), isNull(blocks.deletedAt)))
    .limit(1)
);

export const findByLinkPrepared = createLazyPrepare((db: TDatabaseConnection) =>
  db
    .select()
    .from(blocks)
    .where(
      and(eq(blocks.link, sql.placeholder('link')), isNull(blocks.deletedAt))
    )
    .limit(1)
);

export const createBlockPrepared = createLazyPrepare(
  (db: TDatabaseConnection) =>
    db
      .insert(blocks)
      .values({
        id: sql.placeholder('id'),
        parent: sql.placeholder('parent'),
        link: sql.placeholder('link'),
        childs: sql.placeholder('childs'),
        order: sql.placeholder('order'),
        type: sql.placeholder('type'),
        content: sql.placeholder('content'),
        createdAt: sql.placeholder('createdAt'),
        updatedAt: sql.placeholder('updatedAt'),
      })
      .returning()
);

export const deleteBlockPrepared = createLazyPrepare(
  (db: TDatabaseConnection) =>
    db
      .update(blocks)
      .set({ deletedAt: sql`${sql.placeholder('deletedAt')}` })
      .where(and(eq(blocks.id, sql.placeholder('id'))))
      .returning({ id: blocks.id, parent: blocks.parent })
);

export const deleteBlockChildsPrepared = createLazyPrepare(
  (db: TDatabaseConnection) =>
    db
      .update(blocks)
      .set({ deletedAt: sql`${sql.placeholder('deletedAt')}` })
      .where(eq(blocks.parent, sql.placeholder('parent')))
      .returning({ id: blocks.id })
);

export const updateContentPrepared = createLazyPrepare(
  (db: TDatabaseConnection) =>
    db
      .update(blocks)
      .set({
        content: sql`${sql.placeholder('content')}`,
        updatedAt: sql`${sql.placeholder('updatedAt')}`,
      })
      .where(eq(blocks.id, sql.placeholder('id')))
      .returning()
);
