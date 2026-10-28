import { z } from "zod";

export const statusLabels = { draft: "Rascunho", published: "Publicado", sold: "Vendido" } as const;
export const vehicleStatuses = ["draft", "published", "sold"] as const;
export const fuels = ["Flex", "Gasolina", "Diesel", "Etanol", "Elétrico", "Híbrido", "GNV"] as const;
export const transmissions = ["Manual", "Automático", "Automatizado", "CVT"] as const;
export const catalogSortValues = ["recentes", "menor-preco", "menor-km"] as const;
export type CatalogSort = (typeof catalogSortValues)[number];
export const photoIdSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i);
const required = (label: string, max = 80) => z.string().trim().min(1, `${label} é obrigatório.`).max(max, `Use até ${max} caracteres.`);
const year = z.coerce.number().int("Informe um ano inteiro.").min(1886, "Informe um ano válido.").max(new Date().getFullYear() + 1, "O ano não pode ultrapassar o próximo ano.");

export const vehicleInputSchema = z.object({
  brand: required("Marca"),
  model: required("Modelo"),
  version: z.string().trim().max(120).default(""),
  manufactureYear: year,
  modelYear: year,
  mileage: z.coerce.number().int("Informe quilômetros inteiros.").min(0, "A quilometragem não pode ser negativa.").max(9_999_999),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,8}(?:[.,]\d{1,2})?$/, "Informe o preço sem separador de milhar. Ex.: 75900,00.")
    .transform((value) => {
      const [whole, fraction = ""] = value.replace(",", ".").split(".");
      return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    })
    .refine((value) => value <= 2_000_000_000, "O preço ultrapassa o limite permitido."),
  fuel: z.enum(fuels, { error: "Selecione o combustível." }),
  transmission: z.enum(transmissions, { error: "Selecione o câmbio." }),
  color: required("Cor", 40),
  description: z.string().trim().max(5000).default(""),
  status: z.enum(vehicleStatuses),
}).refine((data) => data.modelYear >= data.manufactureYear && data.modelYear <= data.manufactureYear + 1, {
  path: ["modelYear"],
  message: "O ano-modelo deve ser igual ao de fabricação ou o ano seguinte.",
});

export const catalogFilterSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  cambio: z.enum(transmissions).optional().catch(undefined),
  combustivel: z.enum(fuels).optional().catch(undefined),
  precoMax: z.string().regex(/^\d{1,8}$/).transform((value) => Number(value) * 100).optional().catch(undefined),
  anoMin: z.string().regex(/^\d{4}$/).transform((value) => Number(value)).optional().catch(undefined),
  ordem: z.enum(catalogSortValues).catch("recentes"),
  pagina: z.string().regex(/^\d{1,5}$/).transform((value) => Math.max(1, Number(value))).catch(1),
});

export type VehicleInput = z.infer<typeof vehicleInputSchema>;
export type CatalogFilters = z.infer<typeof catalogFilterSchema>;
export type FormState = { error?: string; fields?: Record<string, string[]> };
export function priceToInput(cents: number) {
  return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}`;
}
export const formatPrice = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
export const formatMileage = (km: number) => `${new Intl.NumberFormat("pt-BR").format(km)} km`;
export function pageNumber(value: unknown) {
  return typeof value === "string" && /^\d{1,5}$/.test(value) ? Math.max(1, Number(value)) : 1;
}
export function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
export function isRecentVehicle(createdAt: Date | string, now = Date.now()) {
  const time = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  return Number.isFinite(time) && now - time >= -60_000 && now - time <= 7 * 24 * 60 * 60 * 1000;
}
export function escapeCsvCell(value: string | number) {
  const raw = String(value);
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function parseCsvVehicleRow(line: string) {
  const cells = [...line.trim().matchAll(/"((?:[^"]|"")*)"|([^,]+)/g)].map((match) =>
    (match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2] ?? "").replace(/^'(?=[=+\-@])/, ""),
  );
  const offset = cells.length >= 12 ? 1 : 0;
  const [brand = "", model = "", version = "", manufactureYear = "", modelYear = "", mileage = "", price = "", fuel = "", transmission = "", color = ""] = cells.slice(offset);
  return vehicleInputSchema.safeParse({
    brand,
    model,
    version,
    manufactureYear,
    modelYear,
    mileage,
    price,
    fuel,
    transmission,
    color,
    description: "",
    status: "draft",
  });
}
