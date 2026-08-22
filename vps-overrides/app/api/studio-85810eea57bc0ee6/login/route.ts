import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, adminPath, createAdminSession, loginPath, publicUrl, verifyAdminPassword } from "../../../vps-auth";

type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;

async function clientKey(): Promise<string> {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function redirectTo(_request: Request, path: string) {
  return NextResponse.redirect(new URL(publicUrl(path)), 303);
}

export async function POST(request: Request) {
  const key = await clientKey();
  const now = Date.now();
  const current = attempts.get(key);
  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return redirectTo(request, `${loginPath()}?error=locked`);
  }

  const form = await request.formData();
  const password = typeof form.get("password") === "string" ? String(form.get("password")) : "";
  if (!verifyAdminPassword(password)) {
    const next = !current || current.resetAt <= now ? { count: 1, resetAt: now + WINDOW_MS } : { ...current, count: current.count + 1 };
    attempts.set(key, next);
    return redirectTo(request, `${loginPath()}?error=invalid`);
  }

  attempts.delete(key);
  const response = redirectTo(request, adminPath());
  response.cookies.set(adminCookieName(), createAdminSession(), adminCookieOptions());
  return response;
}
