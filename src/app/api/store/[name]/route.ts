import { getStoreSettings } from "@/features/store/repository";
import { readPhoto } from "@/features/uploads/storage";
import { photoIdSchema } from "@/features/vehicles/schema";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!photoIdSchema.safeParse(name).success) return new Response(null, { status: 404 });
  try {
    const store = await getStoreSettings();
    if (name !== store.logoPhoto && name !== store.heroPhoto) return new Response(null, { status: 404 });
    const bytes = await readPhoto(name);
    if (!bytes) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    logger.error({ code: "STORE_ASSET_READ_FAILED" }, "Store image could not be read");
    return new Response(null, { status: 500 });
  }
}
