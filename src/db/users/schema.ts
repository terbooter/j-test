// src/db/users/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  tokenVersion: integer('token_version').default(0).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
