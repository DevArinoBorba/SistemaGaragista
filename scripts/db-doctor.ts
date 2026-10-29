import { loadEnvConfig } from "@next/env";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

async function main() {
  const fixOrphans = process.argv.includes("--fix-orphans");
  const featureSample = process.argv.includes("--feature-sample");
  const logoFlagIdx = process.argv.indexOf("--set-logo");
  const logoPathArg = logoFlagIdx !== -1 ? process.argv[logoFlagIdx + 1] : undefined;
  const { getDb, closeDatabase } = await import("../src/db/index");
  const { vehicles } = await import("../src/db/schema");
  const { getStoreSettings, saveStoreSettings } = await import("../src/features/store/repository");
  const { listVehicles, updateVehicleFeatured } = await import("../src/features/vehicles/repository");
  const { photoIdSchema } = await import("../src/features/vehicles/schema");
  const { reconcileOrphanPhotos, removePhoto, storePhoto, uploadDirectory } = await import("../src/features/uploads/storage");
  try {
    if (featureSample) {
      const published = (await listVehicles(true, 1, "", 6)).slice(0, 6);
      for (const item of published) await updateVehicleFeatured(item.id, true);
    }
    if (logoPathArg) {
      const current = await getStoreSettings();
      const buffer = await readFile(logoPathArg);
      const ext = path.extname(logoPathArg).toLowerCase();
      const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
      const newLogo = await storePhoto(new File([buffer], path.basename(logoPathArg), { type: mime }));
      await saveStoreSettings(
        {
          name: current.name,
          tagline: current.tagline,
          cnpj: current.cnpj,
          whatsapp: current.whatsapp,
          phone: current.phone,
          email: current.email,
          address: current.address,
          openingHours: current.openingHours,
          instagramUrl: current.instagramUrl,
          facebookUrl: current.facebookUrl,
          youtubeUrl: current.youtubeUrl,
          tiktokUrl: current.tiktokUrl,
        },
        { logoPhoto: newLogo, heroPhoto: current.heroPhoto },
      );
      if (current.logoPhoto && current.logoPhoto !== newLogo) await removePhoto(current.logoPhoto);
    }
    const db = getDb();
    const [store, stock, diskEntries] = await Promise.all([
      getStoreSettings(),
      db.select().from(vehicles),
      readdir(uploadDirectory).catch(() => [] as string[]),
    ]);
    const referenced = new Set<string>(
      [store.logoPhoto, store.heroPhoto, ...stock.flatMap((item) => item.photos)].filter((name) => photoIdSchema.safeParse(name).success),
    );
    const missing: string[] = [];
    for (const name of referenced) {
      const ok = await access(path.join(uploadDirectory, name)).then(() => true).catch(() => false);
      if (!ok) missing.push(name);
    }
    const diskPhotos = diskEntries.filter((name) => photoIdSchema.safeParse(name).success);
    const orphans = diskPhotos.filter((name) => !referenced.has(name));
    if (fixOrphans && orphans.length > 0) {
      await reconcileOrphanPhotos(referenced, { maxAgeMs: 0 });
    }
    process.stdout.write(
      `DB Doctor OK: store="${store.name}", vehicles=${stock.length}, referencedPhotos=${referenced.size}, missingPhotos=${missing.length}, orphanPhotos=${orphans.length}${fixOrphans ? " (cleaned)" : ""}.\n`,
    );
    if (missing.length > 0) process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

main().catch(() => {
  process.stderr.write("DB Doctor check failed. Verify database service and .env.local configuration.\n");
  process.exitCode = 1;
});
