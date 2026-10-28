import { expect, it, vi } from "vitest";
import sharp from "sharp";
import { MAX_FILE_BYTES, readPhoto, reconcileOrphanPhotos, removePhoto, storePhoto } from "./storage";

vi.mock("server-only", () => ({}));

it("@spec:AC-010 rejeita tamanho excessivo, formato falso, dimensão degenerada, caminho manipulado e reconcilia órfãos", async () => {
  await expect(storePhoto(new File([new Uint8Array(MAX_FILE_BYTES + 1)], "large.png", { type: "image/png" }))).rejects.toThrow("8 MB");
  await expect(storePhoto(new File(["not a PNG"], "fake.png", { type: "image/png" }))).rejects.toThrow("imagem");
  await expect(storePhoto(new File(["<svg />"], "vector.svg", { type: "image/svg+xml" }))).rejects.toThrow("JPEG");
  const degenerate = await sharp({ create: { width: 4000, height: 1, channels: 3, background: "#365b49" } }).png().toBuffer();
  await expect(storePhoto(new File([new Uint8Array(degenerate)], "strip.png", { type: "image/png" }))).rejects.toThrow("imagem");
  expect(await readPhoto("../../.env.local")).toBeNull();
  expect(await readPhoto("------------------------------------.webp")).toBeNull();
  await expect(removePhoto("------------------------------------.webp")).resolves.toBeUndefined();

  const valid = await sharp({ create: { width: 120, height: 90, channels: 3, background: "#176243" } }).png().toBuffer();
  const kept = await storePhoto(new File([new Uint8Array(valid)], "kept.png", { type: "image/png" }));
  const orphan = await storePhoto(new File([new Uint8Array(valid)], "orphan.png", { type: "image/png" }));
  const removed = await reconcileOrphanPhotos([kept], { maxAgeMs: 0, candidates: [kept, orphan, "../unsafe.webp"] });
  expect(removed).toEqual([orphan]);
  expect(await readPhoto(orphan)).toBeNull();
  expect(await readPhoto(kept)).not.toBeNull();
  await removePhoto(kept);
});
