import { sql } from 'drizzle-orm';
import {
  AnyPgColumn,
  char,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { TBlockContentType, TBlockType } from 'src/types/block';

export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').primaryKey(),
    parent: uuid('parent_id').references((): AnyPgColumn => blocks.id, {
      onDelete: 'cascade',
    }),
    link: char('link', { length: 10 }).notNull(),
    childs: integer('childs').default(0).notNull(),
    totalChilds: integer('totalChilds').default(0).notNull(),
    order: integer('order').default(0).notNull(),
    type: text('type').notNull().$type<TBlockType>(),
    content: jsonb('content').$type<TBlockContentType>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  blocks => [
    index('block_parent_idx')
      .on(
        blocks.parent,
        blocks.deletedAt,
        blocks.order,
        blocks.id
      )
      .where(sql`parent_id IS NOT NULL`),

    index('block_link_idx').on(blocks.link),
    index('block_deleted_idx').on(blocks.deletedAt),
  ]
);

export type TBlock = typeof blocks.$inferSelect;