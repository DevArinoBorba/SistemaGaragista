import "server-only";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { getAuthBaseUrl, getAuthSecret } from "@/lib/env";

let instance: ReturnType<typeof createAuth> | undefined;
function createAuth() {
  const secret = getAuthSecret();
  const baseURL = getAuthBaseUrl();
  const origin = new URL(baseURL).origin;
  return betterAuth({
    appName: "Garagista",
    secret,
    baseURL,
    trustedOrigins: [origin],
    advanced: {
      useSecureCookies: baseURL.startsWith("https://"),
      defaultCookieAttributes: { sameSite: "lax", httpOnly: true },
    },
    database: drizzleAdapter(getDb(), { provider: "pg", schema, transaction: true }),
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12, maxPasswordLength: 128 },
    user: { additionalFields: { isAdmin: { type: "boolean", defaultValue: false, input: false } } },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 60, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 60, customRules: { "/sign-in/email": { window: 60, max: 5 } } },
  });
}
export function getAuth() {
  return (instance ??= createAuth());
}
