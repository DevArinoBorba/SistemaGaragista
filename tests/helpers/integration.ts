import { randomBytes, randomUUID } from "node:crypto";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { chromium, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { hashPassword } from "better-auth/crypto";
import * as schema from "../../src/db/schema";

export class Integration {
  pool!: Pool;
  db!: ReturnType<typeof drizzle<typeof schema>>;
  control!: Pool;
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  child?: ChildProcess;
  databaseName = `garagista_test_${randomBytes(8).toString("hex")}`;
  base = "";
  leaseId = "";
  email = "test-admin@garagista.invalid";
  password = randomBytes(24).toString("hex");
  private checker = path.join(process.env.USERPROFILE!, ".maestri", "Find-FreePort.ps1");
  logs = "";
  async start() {
    process.loadEnvFile(path.join(process.cwd(), ".env.local"));
    await mkdir(".local/qa", { recursive: true });
    await readFile(path.join(process.env.USERPROFILE!, ".maestri", "PORT_POLICY.md"), "utf8");
    const config = JSON.parse(await readFile(".local/postgres-config.json", "utf8"));
    const url = new URL(process.env.DATABASE_URL!);
    if (url.hostname !== "127.0.0.1" || url.username !== config.user || url.password !== config.password || url.pathname !== "/garagista") throw new Error("Integration tests require the owned local database, not an external destination.");
    this.control = new Pool({ connectionString: url.href, max: 1 });
    await this.control.query(`CREATE DATABASE "${this.databaseName}"`);
    url.pathname = this.databaseName;
    this.pool = new Pool({ connectionString: url.href, max: 3 });
    this.db = drizzle(this.pool, { schema });
    await migrate(this.db, { migrationsFolder: "drizzle" });
    const id = randomUUID();
    await this.db.insert(schema.user).values({ id, name: "Test administrator", email: this.email, emailVerified: true, isAdmin: true });
    await this.db.insert(schema.account).values({ id: randomUUID(), userId: id, accountId: id, providerId: "credential", password: await hashPassword(this.password) });
    const lease = JSON.parse(execFileSync("powershell.exe", ["-NoProfile", "-File", this.checker, "-Preferred", "3100", "-Service", "garagista-integration", "-Project", process.cwd()], { encoding: "utf8" }));
    this.leaseId = lease.leaseId;
    this.base = `http://127.0.0.1:${lease.port}`;
    this.child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(lease.port)], {
      env: { ...process.env, NODE_ENV: "production", DATABASE_URL: url.href, BETTER_AUTH_URL: this.base, BETTER_AUTH_SECRET: randomBytes(48).toString("hex") }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    });
    this.child.stdout?.on("data", (chunk) => { this.logs = (this.logs + chunk).slice(-10000); });
    this.child.stderr?.on("data", (chunk) => { this.logs = (this.logs + chunk).slice(-10000); });
    for (let i = 0; i < 100; i++) {
      if (this.child.exitCode !== null) throw new Error(`Test server exited: ${this.logs}`);
      try { const response = await fetch(this.base); if (response.status === 200 && (await response.text()).includes("Seu próximo carro")) break; } catch {}
      if (i === 99) throw new Error(`Test server did not become ready: ${this.logs}`);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    await mkdir(".local/qa", { recursive: true });
    await writeFile(".local/qa/integration-service.json", JSON.stringify({ port: lease.port, pid: this.child.pid, database: this.databaseName, active: true }));
    this.browser = await chromium.launch({ channel: "chrome", headless: true });
    this.context = await this.browser.newContext({ baseURL: this.base, viewport: { width: 1440, height: 1000 } });
    this.page = await this.context.newPage();
  }
  async login() {
    await this.page.goto(`${this.base}/admin/login`);
    await this.page.getByLabel("E-mail", { exact: true }).fill(this.email);
    await this.page.getByLabel("Senha", { exact: true }).fill(this.password);
    await this.page.getByRole("button", { name: "Entrar no painel" }).click();
    await expect(this.page).toHaveURL(/\/admin\/veiculos$/);
  }
  async fillVehicle(model = "Polo teste") {
    await this.page.getByLabel("Marca", { exact: true }).fill("Volkswagen");
    await this.page.getByLabel("Modelo", { exact: true }).fill(model);
    await this.page.getByLabel("Versão", { exact: false }).fill("TSI");
    await this.page.getByLabel("Cor", { exact: true }).fill("Prata");
    await this.page.getByLabel("Ano de fabricação", { exact: true }).fill("2022");
    await this.page.getByLabel("Ano-modelo", { exact: true }).fill("2023");
    await this.page.getByLabel("Quilometragem (km)", { exact: true }).fill("25000");
    await this.page.getByLabel("Preço (R$)", { exact: true }).fill("75900,29");
    await this.page.getByLabel("Combustível", { exact: true }).selectOption("Flex");
    await this.page.getByLabel("Câmbio", { exact: true }).selectOption("Automático");
  }
  async stop() {
    await mkdir(".local/qa", { recursive: true });
    await writeFile(".local/qa/integration-server.log", this.logs);
    await this.browser?.close();
    if (this.child && this.child.exitCode === null) {
      const closed = new Promise((resolve) => this.child!.once("close", resolve));
      this.child.kill();
      await Promise.race([closed, new Promise((resolve) => setTimeout(resolve, 5000))]);
    }
    if (this.pool) {
      const { removePhoto } = await import("../../src/features/uploads/storage");
      const rows = await this.db.select({ photos: schema.vehicles.photos }).from(schema.vehicles);
      await Promise.all(rows.flatMap((row) => row.photos).map((photo) => removePhoto(photo)));
      await this.pool.end();
    }
    if (this.control) {
      if (!/^garagista_test_[a-f0-9]{16}$/.test(this.databaseName)) throw new Error("Unsafe test database name");
      await this.control.query(`DROP DATABASE IF EXISTS "${this.databaseName}" WITH (FORCE)`);
      await this.control.end();
    }
    if (this.leaseId) execFileSync("powershell.exe", ["-NoProfile", "-File", this.checker, "-ReleaseLeaseId", this.leaseId]);
    await writeFile(".local/qa/integration-service.json", JSON.stringify({ active: false }));
  }
}
