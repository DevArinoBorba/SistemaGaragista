import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

async function main() {
  const rawArg = process.argv[2];
  if (!rawArg) {
    throw new Error("Informe o caminho do arquivo CSV. Ex.: pnpm vehicles:import-csv estoque.csv");
  }
  const filePath = path.resolve(process.cwd(), rawArg);
  const content = (await readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const { getDb, closeDatabase } = await import("../src/db/index");
  const { vehicles } = await import("../src/db/schema");
  const { parseCsvVehicleRow } = await import("../src/features/vehicles/schema");

  try {
    const startIndex = lines[0] && /^"?(id|marca)"?,/i.test(lines[0]) ? 1 : 0;
    const dataLines = lines.slice(startIndex);
    if (dataLines.length === 0) {
      throw new Error("Nenhuma linha de veículo encontrada no CSV.");
    }

    const rows = dataLines.map((line, idx) => {
      const parsed = parseCsvVehicleRow(line);
      if (!parsed.success) {
        throw new Error(`Linha ${startIndex + idx + 1} inválida no CSV.`);
      }
      const { price, ...rest } = parsed.data;
      return { ...rest, priceCents: price, status: "draft" as const, photos: [] as string[] };
    });

    const db = getDb();
    await db.transaction(async (tx) => {
      await tx.insert(vehicles).values(rows);
    });

    process.stdout.write(`CSV Import OK: ${rows.length} rascunho(s) importado(s) de ${path.basename(filePath)}.\n`);
  } finally {
    await closeDatabase();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : "Falha ao importar CSV.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
