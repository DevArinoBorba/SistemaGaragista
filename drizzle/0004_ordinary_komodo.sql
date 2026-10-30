ALTER TABLE "vehicles" ADD COLUMN "market_price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "fipe_price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_market_price_valid" CHECK ("vehicles"."market_price_cents" >= 0);--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_fipe_price_valid" CHECK ("vehicles"."fipe_price_cents" >= 0);