import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const vehicleStatus = pgEnum("vehicle_status", ["draft", "published", "sold"]);
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  version: text("version").notNull().default(""),
  manufactureYear: integer("manufacture_year").notNull(),
  modelYear: integer("model_year").notNull(),
  mileage: integer("mileage").notNull(),
  priceCents: integer("price_cents").notNull(),
  marketPriceCents: integer("market_price_cents").notNull().default(0),
  fipePriceCents: integer("fipe_price_cents").notNull().default(0),
  fuel: text("fuel").notNull(),
  transmission: text("transmission").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull().default(""),
  status: vehicleStatus("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  photos: text("photos").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("vehicles_public_created_idx").on(t.createdAt).where(sql`${t.status} = 'published'`),
  check("vehicles_price_valid", sql`${t.priceCents} >= 0`),
  check("vehicles_market_price_valid", sql`${t.marketPriceCents} >= 0`),
  check("vehicles_fipe_price_valid", sql`${t.fipePriceCents} >= 0`),
  check("vehicles_mileage_valid", sql`${t.mileage} >= 0`),
  check("vehicles_years_valid", sql`${t.manufactureYear} BETWEEN 1886 AND 2200 AND ${t.modelYear} BETWEEN ${t.manufactureYear} AND ${t.manufactureYear} + 1`),
  check("vehicles_names_valid", sql`length(trim(${t.brand})) > 0 AND length(trim(${t.model})) > 0`),
  check("vehicles_photo_limit", sql`cardinality(${t.photos}) <= 12`),
]);

export type Vehicle = typeof vehicles.$inferSelect;
