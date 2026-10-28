import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { photoIdSchema } from "@/features/vehicles/schema";

export const uploadDirectory = path.join(process.cwd(), ".local", "uploads");
export const MAX_PHOTOS = 12;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const MAX_DIMENSION = 16_383;

function isSafePhotoName(name: string) {
  return (
    photoIdSchema.safeParse(name).success &&
    path.basename(name) === name &&
    path.dirname(path.resolve(uploadDirectory, name)) === path.resolve(uploadDirectory)
  );
}

export function validatePhotoFile(file: File) {
  if (!file.size || file.size > MAX_FILE_BYTES || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Envie uma imagem JPEG, PNG ou WebP de até 8 MB.");
  }
}

export async function storePhoto(file: File) {
  validatePhotoFile(file);
  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { limitInputPixels: 25_000_000, animated: false });
  let output: Buffer;
  try {
    const metadata = await image.metadata();
    const { format, pages = 1, width = 0, height = 0 } = metadata;
    const scale = Math.min(1, 1920 / Math.max(width, height, 1));
    if (
      !["jpeg", "png", "webp"].includes(format ?? "") ||
      pages > 1 ||
      width < 1 ||
      height < 1 ||
      width > MAX_DIMENSION ||
      height > MAX_DIMENSION ||
      Math.round(Math.min(width, height) * scale) < 1
    ) {
      throw new Error("Unsupported image");
    }
    output = await image.rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 92 }).toBuffer();
  } catch {
    throw new Error("Não foi possível ler a imagem. Use uma foto JPEG, PNG ou WebP válida.");
  }
  const name = `${randomUUID()}.webp`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, name), output, { flag: "wx" });
  return name;
}

export async function removePhoto(name: string) {
  if (!isSafePhotoName(name)) return;
  await unlink(path.join(uploadDirectory, name)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

export async function readPhoto(name: string) {
  if (!isSafePhotoName(name)) return null;
  try {
    return await readFile(path.join(uploadDirectory, name));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function reconcileOrphanPhotos(
  referencedNames: Iterable<string>,
  options?: { maxAgeMs?: number; candidates?: Iterable<string> },
) {
  const keep = new Set(referencedNames);
  const maxAgeMs = options?.maxAgeMs ?? 15 * 60 * 1000;
  const entries = options?.candidates ? [...options.candidates] : await readdir(uploadDirectory).catch(() => [] as string[]);
  const now = Date.now();
  const removed: string[] = [];
  for (const name of entries) {
    if (!isSafePhotoName(name) || keep.has(name)) continue;
    if (maxAgeMs > 0) {
      const info = await stat(path.join(uploadDirectory, name)).catch(() => null);
      if (!info || now - info.mtimeMs < maxAgeMs) continue;
    }
    await removePhoto(name);
    removed.push(name);
  }
  return removed;
}
