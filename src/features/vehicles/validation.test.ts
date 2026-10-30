import { describe, expect, it } from "vitest";
import { catalogFilterSchema, escapeCsvCell, formatComparisonPrice, isRecentVehicle, parseCsvVehicleRow, priceToInput, resolveComparisonPrices, serializeJsonLd, vehicleInputSchema } from "./schema";

export const validInput = { brand: "Fiat", model: "Argo", version: "Drive", manufactureYear: 2022, modelYear: 2023, mileage: 25000, price: "75900,10", fuel: "Flex", transmission: "Manual", color: "Prata", description: "", status: "published" };
describe("Vehicle validation", () => {
  it("@spec:AC-007 rejeita dados inválidos, converte centavos sem arredondamento binário e sanitiza filtros/JSON-LD/CSV", () => {
    for (const patch of [{ brand: " " }, { model: "" }, { mileage: -1 }, { price: "-1" }, { manufactureYear: 1200 }, { modelYear: 2020 }]) {
      expect(vehicleInputSchema.safeParse({ ...validInput, ...patch }).success).toBe(false);
    }
    expect(vehicleInputSchema.parse(validInput).price).toBe(7590010);
    expect(vehicleInputSchema.parse({ ...validInput, marketPrice: "78500,00", fipePrice: "79200,00" })).toMatchObject({
      marketPrice: 7850000,
      fipePrice: 7920000,
    });
    expect(formatComparisonPrice(13790000)).toContain("137.900");
    expect(resolveComparisonPrices({ priceCents: 13790000, marketPriceCents: 14322000, fipePriceCents: 14439800 })).toEqual({
      announcedPriceCents: 13790000,
      marketPriceCents: 14322000,
      fipePriceCents: 14439800,
    });
    expect(vehicleInputSchema.parse({ ...validInput, price: "0,29" }).price).toBe(29);
    expect(priceToInput(7590010)).toBe("75900,10");
    expect(catalogFilterSchema.parse({ q: "  Polo ", cambio: "Automático", combustivel: "invalido", precoMax: "80000", anoMin: "2021", ordem: "menor-preco", pagina: "2" })).toEqual({
      q: "Polo",
      cambio: "Automático",
      combustivel: undefined,
      precoMax: 8000000,
      anoMin: 2021,
      ordem: "menor-preco",
      pagina: 2,
    });
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
    expect(escapeCsvCell("=CMD()")).toBe("\"'=CMD()\"");
    const csvRow = [
      "00000000-0000-4000-8000-000000000001",
      "Volkswagen",
      "Polo",
      "TSI",
      2022,
      2023,
      25000,
      "75900,10",
      "Flex",
      "Automático",
      "Prata",
      "Publicado",
    ]
      .map(escapeCsvCell)
      .join(",");
    const parsedCsv = parseCsvVehicleRow(csvRow);
    expect(parsedCsv.success).toBe(true);
    expect(parseCsvVehicleRow('"",""').success).toBe(false);
    const refNow = Date.parse("2026-10-28T12:00:00Z");
    expect(isRecentVehicle(new Date("2026-10-25T12:00:00Z"), refNow)).toBe(true);
    expect(isRecentVehicle(new Date("2026-10-10T12:00:00Z"), refNow)).toBe(false);
  });
});
