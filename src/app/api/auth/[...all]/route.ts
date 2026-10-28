import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/features/auth/auth";

export const runtime = "nodejs";
function allowed(request: Request, paths: string[]) { return paths.includes(new URL(request.url).pathname); }
export async function GET(request: Request) {
  if (!allowed(request, ["/api/auth/get-session", "/api/auth/ok"])) return new Response(null, { status: 404 });
  return toNextJsHandler(getAuth()).GET(request);
}
export async function POST(request: Request) {
  if (!allowed(request, ["/api/auth/sign-in/email", "/api/auth/sign-out"])) return new Response(null, { status: 404 });
  return toNextJsHandler(getAuth()).POST(request);
}
