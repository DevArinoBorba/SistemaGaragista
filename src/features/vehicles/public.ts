import "server-only";
import { z } from "zod";
import { getAuthBaseUrl } from "@/lib/env";
import { findVehicle, listVehicles, type VehicleListFilters } from "./repository";

export async function getCatalog(query = "", page = 1, filters?: VehicleListFilters) {
  const rows = await listVehicles(true, page, query, 12, filters);
  return { vehicles: rows.slice(0, 12), hasNext: rows.length > 12 };
}

export async function getFeaturedVehicles() {
  const rows = await listVehicles(true, 1, "", 12, { featured: true });
  return rows.slice(0, 12);
}

export async function getPublicVehicle(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  return findVehicle(id);
}

export async function getRelatedVehicles(currentId: string) {
  const rows = await listVehicles(true, 1, "", 9);
  return rows.filter((item) => item.id !== currentId).slice(0, 8);
}

export function getPublicSiteUrl() {
  try {
    return new URL(getAuthBaseUrl()).origin;
  } catch {
    return "http://127.0.0.1:3000";
  }
}

export async function getPublishedSitemapVehicles() {
  const rows = await listVehicles(true, 1, "", 100);
  return rows.slice(0, 100);
}
