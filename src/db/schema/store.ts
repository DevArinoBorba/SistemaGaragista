import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const storeSettings = pgTable("store_settings", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull().default("Garagista"),
  tagline: text("tagline").notNull().default(""),
  cnpj: text("cnpj").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  address: text("address").notNull().default(""),
  openingHours: text("opening_hours").notNull().default(""),
  logoPhoto: text("logo_photo").notNull().default(""),
  heroPhoto: text("hero_photo").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  facebookUrl: text("facebook_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  tiktokUrl: text("tiktok_url").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  check("store_settings_singleton", sql`${t.id} = 'default'`),
  check("store_settings_name_valid", sql`length(trim(${t.name})) > 0`),
]);

export type StoreSettings = typeof storeSettings.$inferSelect;
