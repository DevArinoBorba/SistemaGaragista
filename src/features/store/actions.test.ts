import { randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import * as storage from "@/features/uploads/storage";
import { saveStoreSettingsAction } from "./actions";
import { getStoreSettings, saveStoreSettings } from "./repository";
import { defaultStoreSettings } from "./schema";

let sessionUser: { id: string; isAdmin: boolean } | null = null;
const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
const revalidatePathMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirectMock(url) }));
vi.mock("next/cache", () => ({ revalidatePath: (path: string, type?: string) => revalidatePathMock(path, type) }));
vi.mock("@/features/auth/auth", () => ({
  getAuth: () => ({
    api: { getSession: async () => (sessionUser ? { user: sessionUser } : null) },
  }),
}));
vi.mock("./repository", () => ({
  getStoreSettings: vi.fn(),
  saveStoreSettings: vi.fn(),
}));

afterEach(() => {
  sessionUser = null;
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

it("@spec:AC-013 bloqueia chamadas sem sessão administrativa e entradas inválidas antes de gravar dados ou fotos", async () => {
  const storeSpy = vi.spyOn(storage, "storePhoto").mockResolvedValue(`${randomUUID()}.webp`);
  const untrustedForm = new FormData();
  untrustedForm.set("name", "Loja Invasora");
  untrustedForm.set("logo", new File(["untrusted"], "logo.png", { type: "image/png" }));

  expect(await saveStoreSettingsAction({}, untrustedForm)).toEqual({
    error: "Acesso administrativo necessário.",
  });
  expect(getStoreSettings).not.toHaveBeenCalled();
  expect(saveStoreSettings).not.toHaveBeenCalled();
  expect(storeSpy).not.toHaveBeenCalled();

  sessionUser = { id: "admin-1", isAdmin: true };
  const invalidForm = new FormData();
  invalidForm.set("name", "   ");
  invalidForm.set("cnpj", "11.111.111/1111-11");
  const invalidResult = await saveStoreSettingsAction({}, invalidForm);
  expect(invalidResult.error).toBe("Confira os campos indicados.");
  expect(invalidResult.fields?.name).toBeDefined();
  expect(invalidResult.fields?.cnpj).toBeDefined();
  expect(getStoreSettings).not.toHaveBeenCalled();
  expect(saveStoreSettings).not.toHaveBeenCalled();
  expect(storeSpy).not.toHaveBeenCalled();
});

it("@spec:AC-011 @spec:AC-013 valida imagens antes do upload, limpa arquivos órfãos em conflito concorrente e substitui imagens antigas ao salvar", async () => {
  sessionUser = { id: "admin-1", isAdmin: true };
  const oldLogo = `${randomUUID()}.webp`;
  const oldHero = `${randomUUID()}.webp`;
  const newLogo = `${randomUUID()}.webp`;
  vi.mocked(getStoreSettings).mockResolvedValue({
    ...defaultStoreSettings,
    logoPhoto: oldLogo,
    heroPhoto: oldHero,
  });

  const storeSpy = vi.spyOn(storage, "storePhoto").mockResolvedValue(newLogo);
  const removeSpy = vi.spyOn(storage, "removePhoto").mockResolvedValue(undefined);

  const badImageForm = new FormData();
  badImageForm.set("name", "Garagista Prime");
  badImageForm.set("logo", new File(["ok"], "logo.jpg", { type: "image/jpeg" }));
  badImageForm.set("hero", new File(["<svg/>"], "hero.svg", { type: "image/svg+xml" }));
  const badImageResult = await saveStoreSettingsAction({}, badImageForm);
  expect(badImageResult.error).toContain("JPEG, PNG ou WebP");
  expect(storeSpy).not.toHaveBeenCalled();
  expect(saveStoreSettings).not.toHaveBeenCalled();

  const validForm = new FormData();
  validForm.set("name", "Garagista Prime");
  validForm.set("cnpj", "12.345.678/0001-95");
  validForm.set("whatsapp", "(11) 99876-5432");
  validForm.set("keepHero", "yes");
  validForm.set("logo", new File(["ok"], "logo.png", { type: "image/png" }));

  vi.mocked(saveStoreSettings).mockResolvedValueOnce(null);
  const conflictResult = await saveStoreSettingsAction({}, validForm);
  expect(conflictResult.error).toContain("alterados em outra aba");
  expect(removeSpy).toHaveBeenCalledWith(newLogo);
  expect(removeSpy).not.toHaveBeenCalledWith(oldLogo);
  removeSpy.mockClear();

  vi.mocked(saveStoreSettings).mockResolvedValueOnce({
    ...defaultStoreSettings,
    name: "Garagista Prime",
    cnpj: "12345678000195",
    whatsapp: "11998765432",
    logoPhoto: newLogo,
    heroPhoto: oldHero,
  });

  await expect(saveStoreSettingsAction({}, validForm)).rejects.toThrow("NEXT_REDIRECT:/admin/loja?salvo=1");
  expect(saveStoreSettings).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Garagista Prime",
      cnpj: "12345678000195",
      whatsapp: "11998765432",
    }),
    { logoPhoto: newLogo, heroPhoto: oldHero },
    { logoPhoto: oldLogo, heroPhoto: oldHero },
  );
  expect(removeSpy).toHaveBeenCalledWith(oldLogo);
  expect(removeSpy).not.toHaveBeenCalledWith(oldHero);
  expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
  expect(revalidatePathMock).toHaveBeenCalledWith("/admin/loja", undefined);
  expect(revalidatePathMock).toHaveBeenCalledWith("/admin/veiculos", undefined);
});
