import EmbeddedPostgres from "embedded-postgres";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const local = path.join(root, ".local");
mkdirSync(local, { recursive: true });
const policyRoot = path.join(process.env.USERPROFILE, ".maestri");
readFileSync(path.join(policyRoot, "PORT_POLICY.md"), "utf8");
const checker = path.join(policyRoot, "Find-FreePort.ps1");
const servicePath = path.join(local, "database-service.json");
const pidPath = path.join(local, "postgres-data", "postmaster.pid");
if (existsSync(pidPath)) {
  const pid = Number.parseInt(readFileSync(pidPath, "utf8").split(/\r?\n/)[0] ?? "", 10);
  let running = false;
  if (Number.isInteger(pid) && pid > 0) {
    try { process.kill(pid, 0); running = true; } catch { unlinkSync(pidPath); }
  }
  if (running) throw new Error(`Garagista PostgreSQL is already running (PID ${pid}).`);
}
const configPath = path.join(local, "postgres-config.json");
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : { user: "garagista_local", password: randomBytes(32).toString("hex") };
const envPath = path.join(root, ".env.local");
let envText = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const existingUrl = /^DATABASE_URL=(.+)$/m.exec(envText)?.[1];
if (existingUrl && !existingUrl.includes(`//${config.user}:${config.password}@127.0.0.1:`)) {
  throw new Error("Existing database configuration is not owned by this launcher; it was preserved.");
}
writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 });
const lease = JSON.parse(execFileSync("powershell.exe", ["-NoProfile", "-File", checker, "-Preferred", String(config.port ?? 5432), "-Service", "garagista-postgres", "-Project", root], { encoding: "utf8" }));
const port = lease.port;
const postgres = new EmbeddedPostgres({
  databaseDir: path.join(local, "postgres-data"), user: config.user, password: config.password,
  port, persistent: true, authMethod: "scram-sha-256", createPostgresUser: false,
  postgresFlags: ["-h", "127.0.0.1"], initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {}, onError: () => {},
});
try {
  if (!existsSync(path.join(local, "postgres-data", "PG_VERSION"))) await postgres.initialise();
  await postgres.start();
  const client = postgres.getPgClient("postgres", "127.0.0.1");
  await client.connect();
  if (!(await client.query("SELECT 1 FROM pg_database WHERE datname = $1", ["garagista"])).rowCount) await client.query('CREATE DATABASE "garagista"');
  await client.end();
  const url = `postgresql://${config.user}:${config.password}@127.0.0.1:${port}/garagista`;
  envText = envText.replace(/^DATABASE_URL=.*(?:\r?\n|$)/m, "").trimEnd();
  envText = `${envText ? `${envText}\n` : ""}DATABASE_URL=${url}\n`;
  if (!/^BETTER_AUTH_SECRET=/m.test(envText)) envText += `BETTER_AUTH_SECRET=${randomBytes(48).toString("hex")}\n`;
  writeFileSync(envPath, envText, { mode: 0o600 });
  writeFileSync(configPath, JSON.stringify({ ...config, port }), { mode: 0o600 });
  writeFileSync(servicePath, JSON.stringify({ service: "garagista-postgres", port, launcherPid: process.pid, postgresPid: postgres.process?.pid, leaseId: lease.leaseId, active: true }));
  process.stdout.write(`Garagista PostgreSQL ready on 127.0.0.1:${port}. Configuration saved privately.\n`);
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    await postgres.stop();
    execFileSync("powershell.exe", ["-NoProfile", "-File", checker, "-ReleaseLeaseId", lease.leaseId]);
    writeFileSync(servicePath, JSON.stringify({ service: "garagista-postgres", port, active: false }));
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 60_000);
} catch {
  await postgres.stop().catch(() => {});
  execFileSync("powershell.exe", ["-NoProfile", "-File", checker, "-ReleaseLeaseId", lease.leaseId]);
  process.stderr.write("Local PostgreSQL startup failed. Existing data was preserved.\n");
  process.exitCode = 1;
}
