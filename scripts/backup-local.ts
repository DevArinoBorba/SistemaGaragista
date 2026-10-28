import { loadEnvConfig } from "@next/env";
import { access, copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

loadEnvConfig(process.cwd());

async function resolveRestoreDir(backupsRoot: string, explicitArg?: string) {
  if (explicitArg) return path.resolve(process.cwd(), explicitArg);
  const entries = (await readdir(backupsRoot).catch(() => [] as string[])).filter((name) => name.startsWith("backup-")).sort();
  const latest = entries.at(-1);
  if (!latest) throw new Error("No backup directory found in .local/backups.");
  return path.join(backupsRoot, latest);
}

async function main() {
  const restoreIdx = process.argv.indexOf("--restore");
  const isRestore = restoreIdx !== -1 || process.env.BACKUP_RESTORE === "1";
  const explicitDir = restoreIdx !== -1 ? process.argv[restoreIdx + 1] : undefined;
  const { getDb, closeDatabase } = await import("../src/db/index");
  const { storeSettings, vehicles } = await import("../src/db/schema");
  const { getStoreSettings } = await import("../src/features/store/repository");
  const { fuels, photoIdSchema, transmissions, vehicleStatuses } = await import("../src/features/vehicles/schema");
  const { uploadDirectory } = await import("../src/features/uploads/storage");
  const backupsRoot = path.join(process.cwd(), ".local", "backups");

  try {
    const db = getDb();
    if (isRestore) {
      const sourceDir = await resolveRestoreDir(backupsRoot, explicitDir);
      const manifestSchema = z.object({
        store: z.object({
          name: z.string().min(1).max(80),
          tagline: z.string().max(180),
          cnpj: z.string().max(18),
          whatsapp: z.string().max(20),
          phone: z.string().max(20),
          email: z.string().max(120),
          address: z.string().max(200),
          openingHours: z.string().max(120),
          logoPhoto: z.string(),
          heroPhoto: z.string(),
        }),
        vehicles: z.array(
          z.object({
            id: z.uuid(),
            brand: z.string().min(1).max(80),
            model: z.string().min(1).max(80),
            version: z.string().max(120),
            manufactureYear: z.number().int(),
            modelYear: z.number().int(),
            mileage: z.number().int().min(0),
            priceCents: z.number().int().min(0),
            fuel: z.enum(fuels),
            transmission: z.enum(transmissions),
            color: z.string().min(1).max(40),
            description: z.string().max(5000),
            status: z.enum(vehicleStatuses),
            photos: z.array(photoIdSchema).max(12),
          }),
        ),
        copiedPhotos: z.array(photoIdSchema),
      });
      const manifest = manifestSchema.parse(JSON.parse(await readFile(path.join(sourceDir, "manifest.json"), "utf8")));
      const sourceUploads = path.join(sourceDir, "uploads");
      for (const name of manifest.copiedPhotos) await access(path.join(sourceUploads, name));
      await mkdir(uploadDirectory, { recursive: true });
      for (const name of manifest.copiedPhotos) await copyFile(path.join(sourceUploads, name), path.join(uploadDirectory, name));
      await db.transaction(async (tx) => {
        const storeValues = { id: "default", ...manifest.store, updatedAt: new Date() };
        await tx.insert(storeSettings).values(storeValues).onConflictDoUpdate({ target: storeSettings.id, set: storeValues });
        for (const item of manifest.vehicles) {
          const row = { ...item, updatedAt: new Date() };
          await tx.insert(vehicles).values(row).onConflictDoUpdate({ target: vehicles.id, set: row });
        }
      });
      process.stdout.write(`Backup restored from ${path.relative(process.cwd(), sourceDir)} (${manifest.vehicles.length} vehicles, ${manifest.copiedPhotos.length} photos).\n`);
      return;
    }

    const [store, stock] = await Promise.all([getStoreSettings(), db.select().from(vehicles)]);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const targetDir = path.join(backupsRoot, `backup-${stamp}`);
    const targetUploads = path.join(targetDir, "uploads");
    await mkdir(targetUploads, { recursive: true, mode: 0o700 });
    const referenced = new Set<string>(
      [store.logoPhoto, store.heroPhoto, ...stock.flatMap((item) => item.photos)].filter((name) => photoIdSchema.safeParse(name).success),
    );
    const copiedPhotos: string[] = [];
    for (const name of referenced) {
      await copyFile(path.join(uploadDirectory, name), path.join(targetUploads, name))
        .then(() => copiedPhotos.push(name))
        .catch(() => undefined);
    }
    await writeFile(
      path.join(targetDir, "manifest.json"),
      JSON.stringify({ createdAt: new Date().toISOString(), store, vehicles: stock, copiedPhotos }, null, 2),
      { mode: 0o600 },
    );
    process.stdout.write(`Backup created in ${path.relative(process.cwd(), targetDir)} (${stock.length} vehicles, ${copiedPhotos.length} photos).\n`);
  } finally {
    await closeDatabase();
  }
}

main().catch(() => {
  process.stderr.write("Local backup/restore operation failed. Check database connectivity and .local/backups.\n");
  process.exitCode = 1;
});
