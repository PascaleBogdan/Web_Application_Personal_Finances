CREATE TABLE IF NOT EXISTS "scheduled_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"payee" text NOT NULL,
	"notes" text,
	"scheduled_date" timestamp NOT NULL,
	"repeat_interval" integer,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"category_id" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scheduled_transactions" ADD CONSTRAINT "scheduled_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scheduled_transactions" ADD CONSTRAINT "scheduled_transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
