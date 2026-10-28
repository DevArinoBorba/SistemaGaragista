import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { saveVehicleAction, deleteVehicleAction, updateVehicleStatusAction, toggleVehicleFeaturedAction, duplicateVehicleAction } from "./actions";
import { saveVehicle, deleteVehicle, findVehicle, updateVehicleStatus, updateVehicleFeatured } from "./repository";
import * as storage from "@/features/uploads/storage";
import { validInput } from "./validation.test";

let sessionUser: { id: string; isAdmin: boolean } | null = null;
const revalidatePathMock = vi.fn();
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: (path: string) => revalidatePathMock(path) }));
vi.mock("@/features/auth/auth", () => ({ getAuth: () => ({ api: { getSession: async () => (sessionUser ? { user: sessionUser } : null) } }) }));
vi.mock("./repository", () => ({ saveVehicle: vi.fn(), deleteVehicle: vi.fn(), findVehicle: vi.fn(), updateVehicleStatus: vi.fn(), updateVehicleFeatured: vi.fn() }));

afterEach(() => {
  sessionUser = null;
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

it("@spec:AC-005 protege salvar, remover, alterar situação, duplicar e arquivos antes de ler os dados de uma chamada direta", async () => {
  const form = new FormData();
  form.set("photos", new File(["untrusted"], "payload.png", { type: "image/png" }));
  expect(await saveVehicleAction({}, form)).toEqual({ error: "Acesso administrativo necessário." });
  expect(await deleteVehicleAction({}, form)).toEqual({ error: "Acesso administrativo necessário." });
  await expect(updateVehicleStatusAction(form)).rejects.toThrow("Acesso administrativo necessário.");
  await expect(toggleVehicleFeaturedAction(form)).rejects.toThrow("Acesso administrativo necessário.");
  await expect(duplicateVehicleAction(form)).rejects.toThrow("Acesso administrativo necessário.");
  expect(saveVehicle).not.toHaveBeenCalled();
  expect(deleteVehicle).not.toHaveBeenCalled();
  expect(findVehicle).not.toHaveBeenCalled();
  expect(updateVehicleStatus).not.toHaveBeenCalled();
  expect(updateVehicleFeatured).not.toHaveBeenCalled();
});

it("valida todos os arquivos do lote antes de processar fotos, limpa uploads em conflito, atualiza situação e duplica rascunho", async () => {
  sessionUser = { id: "admin-1", isAdmin: true };
  const storeSpy = vi.spyOn(storage, "storePhoto").mockResolvedValue(`${randomUUID()}.webp`);
  const removeSpy = vi.spyOn(storage, "removePhoto").mockResolvedValue(undefined);
  const badBatch = new FormData();
  for (const [key, value] of Object.entries(validInput)) badBatch.set(key, String(value));
  badBatch.append("photos", new File(["ok"], "first.jpg", { type: "image/jpeg" }));
  badBatch.append("photos", new File(["<svg/>"], "second.svg", { type: "image/svg+xml" }));
  const badResult = await saveVehicleAction({}, badBatch);
  expect(badResult.error).toContain("JPEG, PNG ou WebP");
  expect(storeSpy).not.toHaveBeenCalled();

  const existingId = randomUUID();
  const previousPhoto = `${randomUUID()}.webp`;
  vi.mocked(findVehicle).mockResolvedValueOnce({ id: existingId, photos: [previousPhoto] } as Awaited<ReturnType<typeof findVehicle>>);
  vi.mocked(saveVehicle).mockResolvedValueOnce(null);
  const conflictForm = new FormData();
  for (const [key, value] of Object.entries(validInput)) conflictForm.set(key, String(value));
  conflictForm.set("id", existingId);
  conflictForm.append("keepPhotos", previousPhoto);
  conflictForm.append("photos", new File(["ok"], "valid.jpg", { type: "image/jpeg" }));
  const conflictResult = await saveVehicleAction({}, conflictForm);
  expect(conflictResult.error).toContain("alterado ou removido");
  expect(storeSpy).toHaveBeenCalledOnce();
  expect(removeSpy).toHaveBeenCalledOnce();

  vi.mocked(updateVehicleStatus).mockResolvedValueOnce({ id: existingId } as Awaited<ReturnType<typeof updateVehicleStatus>>);
  const statusForm = new FormData();
  statusForm.set("id", existingId);
  statusForm.set("status", "sold");
  await updateVehicleStatusAction(statusForm);
  expect(updateVehicleStatus).toHaveBeenCalledWith(existingId, "sold");
  expect(revalidatePathMock).toHaveBeenCalledWith(`/veiculos/${existingId}`);

  vi.mocked(updateVehicleFeatured).mockResolvedValueOnce({ id: existingId } as Awaited<ReturnType<typeof updateVehicleFeatured>>);
  const featForm = new FormData();
  featForm.set("id", existingId);
  featForm.set("featured", "true");
  await toggleVehicleFeaturedAction(featForm);
  expect(updateVehicleFeatured).toHaveBeenCalledWith(existingId, true);

  const copyId = randomUUID();
  vi.mocked(findVehicle).mockResolvedValueOnce({
    id: existingId,
    brand: "Fiat",
    model: "Argo",
    version: "Drive",
    manufactureYear: 2022,
    modelYear: 2023,
    mileage: 25000,
    priceCents: 7590010,
    fuel: "Flex",
    transmission: "Manual",
    color: "Prata",
    description: "",
    status: "published",
    photos: [previousPhoto],
  } as Awaited<ReturnType<typeof findVehicle>>);
  vi.mocked(saveVehicle).mockResolvedValueOnce({ id: copyId } as Awaited<ReturnType<typeof saveVehicle>>);
  const dupForm = new FormData();
  dupForm.set("id", existingId);
  await duplicateVehicleAction(dupForm);
  expect(saveVehicle).toHaveBeenCalledWith(expect.objectContaining({ brand: "Fiat", model: "Argo", status: "draft" }), []);
});
