CREATE TABLE "blocks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"parent_id" uuid,
	"link" char(10) NOT NULL,
	"childs" integer DEFAULT 0 NOT NULL,
	"totalChilds" integer DEFAULT 0 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"type" text NOT NULL,
	"content" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_parent_id_blocks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "block_parent_idx" ON "blocks" USING btree ("parent_id","deleted_at","order","id") WHERE parent_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX "block_link_idx" ON "blocks" USING btree ("link");--> statement-breakpoint
CREATE INDEX "block_deleted_idx" ON "blocks" USING btree ("deleted_at");