"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, UnauthorizedError } from "@/features/auth/session";
import { MAX_PHOTOS, MAX_TOTAL_BYTES, removePhoto, storePhoto, validatePhotoFile } from "@/features/uploads/storage";
import { logger } from "@/lib/logger";
import { deleteVehicle, findVehicle, saveVehicle, updateVehicleFeatured, updateVehicleStatus } from "./repository";
import { type FormState, type fuels, type transmissions, vehicleInputSchema, vehicleStatuses } from "./schema";

function invalidate(id: string) { revalidatePath("/"); revalidatePath("/admin/veiculos"); revalidatePath(`/veiculos/${id}`); }
async function cleanup(names: string[]) {
  await Promise.all(names.map((name) => removePhoto(name).catch(() => logger.warn("Could not remove an orphaned vehicle image"))));
}

export async function saveVehicleAction(_previous: FormState, form: FormData): Promise<FormState> {
  try { await requireAdmin(); }
  catch (error) { if (error instanceof UnauthorizedError) return { error: error.message }; throw error; }
  const parsed = vehicleInputSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Confira os campos indicados.", fields: z.flattenError(parsed.error).fieldErrors };
  const rawId = form.get("id");
  const id = typeof rawId === "string" && rawId ? rawId : undefined;
  if (id && !z.uuid().safeParse(id).success) return { error: "Veículo inválido." };
  const existing = id ? await findVehicle(id, false) : null;
  if (id && !existing) return { error: "Este veículo não está mais disponível." };
  const keep = [...new Set(form.getAll("keepPhotos").map(String))];
  if (keep.some((name) => !existing?.photos.includes(name))) return { error: "Seleção de fotos inválida." };
  const files = form.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);
  if (keep.length + files.length > MAX_PHOTOS) return { error: "Use no máximo 12 fotos por veículo." };
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) return { error: "O envio de fotos deve ter até 20 MB no total." };
  const uploaded: string[] = [];
  let vehicle;
  try {
    for (const file of files) validatePhotoFile(file);
    for (const file of files) uploaded.push(await storePhoto(file));
    let photos = [...keep, ...uploaded];
    const cover = form.get("cover");
    if (typeof cover === "string" && photos.includes(cover)) photos = [cover, ...photos.filter((name) => name !== cover)];
    vehicle = await saveVehicle(parsed.data, photos, id, existing?.photos);
    if (!vehicle) { await cleanup(uploaded); return { error: "Este veículo foi alterado ou removido. Atualize a página." }; }
  } catch (error) {
    await cleanup(uploaded);
    if (error instanceof Error && /imagem|foto|JPEG|WebP/.test(error.message)) return { error: error.message };
    logger.error({ code: "VEHICLE_SAVE_FAILED" }, "Vehicle could not be saved");
    return { error: "Não foi possível salvar. Seus dados não foram confirmados. Tente novamente." };
  }
  await cleanup(existing?.photos.filter((name) => !vehicle.photos.includes(name)) ?? []);
  invalidate(vehicle.id);
  redirect("/admin/veiculos?salvo=1");
}

export async function deleteVehicleAction(_previous: FormState, form: FormData): Promise<FormState> {
  try { await requireAdmin(); }
  catch (error) { if (error instanceof UnauthorizedError) return { error: error.message }; throw error; }
  const id = form.get("id");
  if (!z.uuid().safeParse(id).success || form.get("confirm") !== "yes") return { error: "Confirme a remoção do veículo." };
  try {
    const removed = await deleteVehicle(String(id));
    if (!removed) return { error: "Este veículo já foi removido." };
    await cleanup(removed.photos);
    invalidate(removed.id);
  } catch { logger.error({ code: "VEHICLE_DELETE_FAILED" }, "Vehicle could not be deleted"); return { error: "Não foi possível remover o veículo. Tente novamente." }; }
  redirect("/admin/veiculos?removido=1");
}

export async function updateVehicleStatusAction(form: FormData) {
  await requireAdmin();
  const id = form.get("id");
  const status = form.get("status");
  const parsedStatus = z.enum(vehicleStatuses).safeParse(status);
  if (!z.uuid().safeParse(id).success || !parsedStatus.success) return;
  try {
    const updated = await updateVehicleStatus(String(id), parsedStatus.data);
    if (updated) invalidate(updated.id);
  } catch {
    logger.error({ code: "VEHICLE_STATUS_UPDATE_FAILED" }, "Vehicle status could not be updated");
  }
}

export async function toggleVehicleFeaturedAction(form: FormData) {
  await requireAdmin();
  const id = form.get("id");
  const featured = form.get("featured") === "true";
  if (!z.uuid().safeParse(id).success) return;
  try {
    const updated = await updateVehicleFeatured(String(id), featured);
    if (updated) invalidate(updated.id);
  } catch {
    logger.error({ code: "VEHICLE_FEATURED_UPDATE_FAILED" }, "Vehicle featured flag could not be updated");
  }
}

export async function duplicateVehicleAction(form: FormData) {
  await requireAdmin();
  const id = form.get("id");
  if (!z.uuid().safeParse(id).success) return;
  try {
    const existing = await findVehicle(String(id), false);
    if (!existing) return;
    const created = await saveVehicle(
      {
        brand: existing.brand,
        model: existing.model,
        version: existing.version,
        manufactureYear: existing.manufactureYear,
        modelYear: existing.modelYear,
        mileage: existing.mileage,
        price: existing.priceCents,
        marketPrice: existing.marketPriceCents ?? 0,
        fipePrice: existing.fipePriceCents ?? 0,
        fuel: existing.fuel as (typeof fuels)[number],
        transmission: existing.transmission as (typeof transmissions)[number],
        color: existing.color,
        description: existing.description,
        status: "draft",
      },
      [],
    );
    if (created) invalidate(created.id);
  } catch {
    logger.error({ code: "VEHICLE_DUPLICATE_FAILED" }, "Vehicle could not be duplicated");
  }
}
