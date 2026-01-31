-- Создаём таблицу users
CREATE TABLE IF NOT EXISTS "users" (
                                       "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" varchar(50) NOT NULL UNIQUE,
    "email" varchar(255) NOT NULL UNIQUE,
    "password_hash" text NOT NULL,
    "token_version" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
    );
--> statement-breakpoint

-- Шаг 1: Добавляем user_id как nullable
ALTER TABLE "blocks" ADD COLUMN "user_id" uuid;
--> statement-breakpoint

-- Вставляем пользователей
INSERT INTO "users" ("username", "email", "password_hash")
VALUES
    ('admin', 'admin@example.com', '$2b$10$.twYxTpt9qfc.b87q/rc7euNYKzSTaI9UxwccO8H6z.MK9oAMSKcm'),
    ('user2', 'user2@example.com', '$2b$10$.twYxTpt9qfc.b87q/rc7euNYKzSTaI9UxwccO8H6z.MK9oAMSKcm'),
    ('user3', 'user3@example.com', '$2b$10$.twYxTpt9qfc.b87q/rc7euNYKzSTaI9UxwccO8H6z.MK9oAMSKcm')
    ON CONFLICT ("username") DO NOTHING;
--> statement-breakpoint

-- Шаг 2: Привязываем существующие блоки к admin
UPDATE "blocks"
SET "user_id" = (SELECT "id" FROM "users" WHERE "username" = 'admin')
WHERE "user_id" IS NULL;
--> statement-breakpoint

-- Шаг 3: Делаем колонку обязательной
ALTER TABLE "blocks" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint

-- Добавляем внешний ключ
ALTER TABLE "blocks"
    ADD CONSTRAINT "blocks_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
--> statement-breakpoint

-- Добавляем индекс
CREATE INDEX IF NOT EXISTS "block_user_idx" ON "blocks" ("user_id");