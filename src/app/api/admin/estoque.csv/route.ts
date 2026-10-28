import { getAdmin } from "@/features/auth/session";
import { listVehicles } from "@/features/vehicles/repository";
import { escapeCsvCell, priceToInput, statusLabels } from "@/features/vehicles/schema";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdmin())) return new Response(null, { status: 401 });
  try {
    const rows = (await listVehicles(false, 1, "", 100)).slice(0, 100);
    const header = ["ID", "Marca", "Modelo", "Versão", "Ano Fabricação", "Ano Modelo", "Quilometragem", "Preço (R$)", "Combustível", "Câmbio", "Cor", "Situação"].map(escapeCsvCell).join(",");
    const lines = rows.map((item) =>
      [
        item.id,
        item.brand,
        item.model,
        item.version,
        item.manufactureYear,
        item.modelYear,
        item.mileage,
        priceToInput(item.priceCents),
        item.fuel,
        item.transmission,
        item.color,
        statusLabels[item.status],
      ]
        .map(escapeCsvCell)
        .join(","),
    );
    return new Response([header, ...lines].join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="estoque-garagista.csv"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    logger.error({ code: "CSV_EXPORT_FAILED" }, "Stock CSV could not be exported");
    return new Response(null, { status: 500 });
  }
}
