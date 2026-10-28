import { getAdmin } from "@/features/auth/session";
import { getStoreSettings } from "@/features/store/repository";
import { listVehicles } from "@/features/vehicles/repository";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdmin())) return new Response(null, { status: 401 });
  try {
    const [store, rows] = await Promise.all([getStoreSettings(), listVehicles(false, 1, "", 100)]);
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        store: {
          name: store.name,
          tagline: store.tagline,
          cnpj: store.cnpj,
          whatsapp: store.whatsapp,
          phone: store.phone,
          email: store.email,
          address: store.address,
          openingHours: store.openingHours,
          logoPhoto: store.logoPhoto,
          heroPhoto: store.heroPhoto,
        },
        vehicles: rows.slice(0, 100),
      },
      null,
      2,
    );
    return new Response(payload, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="backup-garagista.json"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    logger.error({ code: "JSON_BACKUP_EXPORT_FAILED" }, "Store JSON backup could not be exported");
    return new Response(null, { status: 500 });
  }
}
