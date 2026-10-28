import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { storeSettings } from "@/db/schema";
import { defaultStoreSettings, type StoreInput } from "./schema";

export async function getStoreSettings() {
  const [row] = await getDb().select().from(storeSettings).where(eq(storeSettings.id, "default")).limit(1);
  return row ?? defaultStoreSettings;
}

export async function saveStoreSettings(
  input: StoreInput,
  assets: { logoPhoto: string; heroPhoto: string },
  expectedAssets?: { logoPhoto: string; heroPhoto: string },
): Promise<typeof storeSettings.$inferSelect | null> {
  const values = { id: "default", ...input, ...assets, updatedAt: new Date() };
  const [saved] = await getDb()
    .insert(storeSettings)
    .values(values)
    .onConflictDoUpdate({
      target: storeSettings.id,
      set: values,
      setWhere: expectedAssets
        ? and(eq(storeSettings.logoPhoto, expectedAssets.logoPhoto), eq(storeSettings.heroPhoto, expectedAssets.heroPhoto))
        : undefined,
    })
    .returning();
  return saved ?? null;
}
