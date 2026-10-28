import "server-only";
import { and, asc, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { vehicles } from "@/db/schema";
import type { CatalogSort, fuels, transmissions, VehicleInput, vehicleStatuses } from "./schema";

export type VehicleListFilters = {
  transmission?: (typeof transmissions)[number];
  fuel?: (typeof fuels)[number];
  maxPriceCents?: number;
  minYear?: number;
  status?: (typeof vehicleStatuses)[number];
  featured?: boolean;
  sort?: CatalogSort;
};

export async function listVehicles(publishedOnly = true, page = 1, query = "", pageSize = 24, filters?: VehicleListFilters) {
  const safePage = Math.max(1, Math.trunc(Number.isFinite(page) ? page : 1));
  const safePageSize = Math.min(100, Math.max(1, Math.trunc(Number.isFinite(pageSize) ? pageSize : 24)));
  const pattern = `%${query.trim().slice(0, 100).replace(/[\\%_]/g, "\\$&")}%`;
  const order =
    filters?.sort === "menor-preco"
      ? [asc(vehicles.priceCents), desc(vehicles.createdAt), desc(vehicles.id)]
      : filters?.sort === "menor-km"
        ? [asc(vehicles.mileage), desc(vehicles.createdAt), desc(vehicles.id)]
        : [desc(vehicles.createdAt), desc(vehicles.id)];
  return getDb()
    .select()
    .from(vehicles)
    .where(
      and(
        publishedOnly ? eq(vehicles.status, "published") : filters?.status ? eq(vehicles.status, filters.status) : undefined,
        query.trim() ? or(ilike(vehicles.brand, pattern), ilike(vehicles.model, pattern), ilike(vehicles.version, pattern)) : undefined,
        filters?.transmission ? eq(vehicles.transmission, filters.transmission) : undefined,
        filters?.fuel ? eq(vehicles.fuel, filters.fuel) : undefined,
        filters?.maxPriceCents ? lte(vehicles.priceCents, filters.maxPriceCents) : undefined,
        filters?.minYear ? gte(vehicles.modelYear, filters.minYear) : undefined,
        filters?.featured !== undefined ? eq(vehicles.featured, filters.featured) : undefined,
      ),
    )
    .orderBy(...order)
    .offset((safePage - 1) * safePageSize)
    .limit(safePageSize + 1);
}
export async function getStockSummary() {
  const rows = await getDb().select({ status: vehicles.status, total: count() }).from(vehicles).groupBy(vehicles.status);
  const summary = { total: 0, published: 0, draft: 0, sold: 0 };
  for (const row of rows) {
    summary[row.status] = Number(row.total);
    summary.total += Number(row.total);
  }
  return summary;
}
export async function findVehicle(id: string, publishedOnly = true) {
  if (!z.uuid().safeParse(id).success) return null;
  const [vehicle] = await getDb().select().from(vehicles).where(and(eq(vehicles.id, id), publishedOnly ? eq(vehicles.status, "published") : undefined)).limit(1);
  return vehicle ?? null;
}
export async function saveVehicle(input: VehicleInput, photos: string[], id?: string, expectedPhotos?: string[]) {
  if (id !== undefined && !z.uuid().safeParse(id).success) return null;
  const { price, ...fields } = input;
  const data = { ...fields, priceCents: price, photos, updatedAt: new Date() };
  const db = getDb();
  const rows = id
    ? await db.update(vehicles).set(data).where(and(eq(vehicles.id, id), expectedPhotos ? eq(vehicles.photos, expectedPhotos) : undefined)).returning()
    : await db.insert(vehicles).values(data).returning();
  return rows[0] ?? null;
}
export async function deleteVehicle(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const db = getDb();
  return (await db.delete(vehicles).where(eq(vehicles.id, id)).returning())[0] ?? null;
}
export async function updateVehicleStatus(id: string, status: (typeof vehicleStatuses)[number]) {
  if (!z.uuid().safeParse(id).success) return null;
  const [updated] = await getDb().update(vehicles).set({ status, updatedAt: new Date() }).where(eq(vehicles.id, id)).returning();
  return updated ?? null;
}
export async function updateVehicleFeatured(id: string, featured: boolean) {
  if (!z.uuid().safeParse(id).success) return null;
  const [updated] = await getDb().update(vehicles).set({ featured, updatedAt: new Date() }).where(eq(vehicles.id, id)).returning();
  return updated ?? null;
}
