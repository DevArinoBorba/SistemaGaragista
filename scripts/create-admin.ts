import { loadEnvConfig } from "@next/env";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

loadEnvConfig(process.cwd());

async function main() {
  const rotate = process.argv.includes("--rotate") || process.env.ADMIN_ROTATE === "1";
  const { getDb, closeDatabase } = await import("../src/db/index");
  const { user, account, session } = await import("../src/db/schema");
  try {
    const db = getDb();
    const [existing] = await db.select().from(user).where(eq(user.isAdmin, true)).limit(1);
    const password = z.string().min(4).max(128).parse(process.env.ADMIN_PASSWORD || randomBytes(20).toString("base64url"));
    const hash = await hashPassword(password);
    await mkdir(".local", { recursive: true });

    if (rotate) {
      if (!existing) throw new Error("No administrator account exists to rotate.");
      const nextEmail = process.env.ADMIN_EMAIL ? z.email().parse(process.env.ADMIN_EMAIL).toLowerCase() : existing.email;
      const nextName = process.env.ADMIN_NAME?.trim() || existing.name;
      await db.transaction(async (tx) => {
        if (nextEmail !== existing.email || nextName !== existing.name) {
          await tx
            .update(user)
            .set({ email: nextEmail, name: nextName, updatedAt: new Date() })
            .where(eq(user.id, existing.id));
        }
        await tx
          .update(account)
          .set({ password: hash, updatedAt: new Date() })
          .where(and(eq(account.userId, existing.id), eq(account.providerId, "credential")));
        await tx.delete(session).where(eq(session.userId, existing.id));
        await writeFile(".local/first-access.json", JSON.stringify({ email: nextEmail, password }, null, 2), { mode: 0o600 });
      });
      process.stdout.write("Administrator credentials rotated and active sessions revoked.\n");
      return;
    }

    if (existing) throw new Error("An account already exists. No credentials were changed.");
    const email = z.email().parse(process.env.ADMIN_EMAIL || "admin@garagista.local").toLowerCase();
    const name = process.env.ADMIN_NAME?.trim() || "Administrador";
    const id = randomUUID();
    await db.transaction(async (tx) => {
      await tx.insert(user).values({ id, name, email, emailVerified: true, isAdmin: true });
      await tx.insert(account).values({ id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: hash });
      await writeFile(".local/first-access.json", JSON.stringify({ email, password }, null, 2), { mode: 0o600, flag: "wx" });
    });
    process.stdout.write("Administrator created. Read .local/first-access.json privately; it is ignored by Git.\n");
  } finally {
    await closeDatabase();
  }
}

main().catch(() => {
  process.stderr.write("Administrator operation failed. Check the private configuration and account state.\n");
  process.exitCode = 1;
});
