import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

export class UnauthorizedError extends Error {
  constructor() { super("Acesso administrativo necessário."); this.name = "UnauthorizedError"; }
}
export async function getAdmin() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  return session?.user.isAdmin ? session.user : null;
}
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
}
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
