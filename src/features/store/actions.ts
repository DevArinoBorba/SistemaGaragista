"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, UnauthorizedError } from "@/features/auth/session";
import { MAX_TOTAL_BYTES, removePhoto, storePhoto, validatePhotoFile } from "@/features/uploads/storage";
import { logger } from "@/lib/logger";
import { getStoreSettings, saveStoreSettings } from "./repository";
import { type StoreFormState, storeInputSchema } from "./schema";

async function cleanup(names: string[]) {
  await Promise.all(
    names.map((name) => removePhoto(name).catch(() => logger.warn("Could not remove an orphaned store image"))),
  );
}

export async function saveStoreSettingsAction(_previous: StoreFormState, form: FormData): Promise<StoreFormState> {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { error: error.message };
    throw error;
  }

  const parsed = storeInputSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { error: "Confira os campos indicados.", fields: z.flattenError(parsed.error).fieldErrors };
  }

  const current = await getStoreSettings();
  const rawLogo = form.get("logo");
  const logoFile = rawLogo instanceof File && rawLogo.size > 0 ? rawLogo : null;
  const rawHero = form.get("hero");
  const heroFile = rawHero instanceof File && rawHero.size > 0 ? rawHero : null;
  const files = [logoFile, heroFile].filter((file): file is File => file !== null);

  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) {
    return { error: "O envio de fotos deve ter até 20 MB no total." };
  }

  const uploaded: string[] = [];
  let logoPhoto = form.get("keepLogo") === "yes" ? current.logoPhoto : "";
  let heroPhoto = form.get("keepHero") === "yes" ? current.heroPhoto : "";

  try {
    for (const file of files) validatePhotoFile(file);
    if (logoFile) {
      logoPhoto = await storePhoto(logoFile);
      uploaded.push(logoPhoto);
    }
    if (heroFile) {
      heroPhoto = await storePhoto(heroFile);
      uploaded.push(heroPhoto);
    }
    const saved = await saveStoreSettings(
      parsed.data,
      { logoPhoto, heroPhoto },
      { logoPhoto: current.logoPhoto, heroPhoto: current.heroPhoto },
    );
    if (!saved) {
      await cleanup(uploaded);
      return { error: "Os dados da loja foram alterados em outra aba. Atualize a página e tente novamente." };
    }
  } catch (error) {
    await cleanup(uploaded);
    if (error instanceof Error && /imagem|foto|JPEG|WebP/.test(error.message)) return { error: error.message };
    logger.error({ code: "STORE_SAVE_FAILED" }, "Store settings could not be saved");
    return { error: "Não foi possível salvar os dados da loja. Tente novamente." };
  }

  const obsolete = [current.logoPhoto, current.heroPhoto].filter(
    (name) => Boolean(name) && name !== logoPhoto && name !== heroPhoto,
  );
  await cleanup(obsolete);
  revalidatePath("/", "layout");
  revalidatePath("/admin/loja");
  revalidatePath("/admin/veiculos");
  redirect("/admin/loja?salvo=1");
}
