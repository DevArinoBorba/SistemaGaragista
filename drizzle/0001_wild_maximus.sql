CREATE TABLE "store_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"name" text DEFAULT 'Garagista' NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"cnpj" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"opening_hours" text DEFAULT '' NOT NULL,
	"logo_photo" text DEFAULT '' NOT NULL,
	"hero_photo" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_settings_singleton" CHECK ("store_settings"."id" = 'default'),
	CONSTRAINT "store_settings_name_valid" CHECK (length(trim("store_settings"."name")) > 0)
);
