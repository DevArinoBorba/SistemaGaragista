import { z } from "zod";
import { findVehicle } from "@/features/vehicles/repository";
import { photoIdSchema } from "@/features/vehicles/schema";
import { getAdmin } from "@/features/auth/session";
import { readPhoto } from "@/features/uploads/storage";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: RouteContext<"/api/photos/[vehicleId]/[name]">) {
  const { vehicleId, name } = await params;
  if (!z.uuid().safeParse(vehicleId).success || !photoIdSchema.safeParse(name).success) return new Response(null, { status: 404 });
  try {
    const vehicle = await findVehicle(vehicleId, false);
    if (!vehicle || !vehicle.photos.includes(name)) return new Response(null, { status: 404 });
    if (vehicle.status !== "published" && !(await getAdmin())) return new Response(null, { status: 404 });
    const bytes = await readPhoto(name);
    if (!bytes) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    logger.error({ code: "PHOTO_READ_FAILED" }, "Vehicle photo could not be read");
    return new Response(null, { status: 500 });
  }
}
