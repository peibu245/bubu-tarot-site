import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "bubu_admin_session_v2";
const ADMIN_PATH = "/studio-85810eea57bc0ee6";
const LOGIN_PATH = `${ADMIN_PATH}/login`;
const SESSION_SECONDS = 8 * 60 * 60;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET ?? "";
  if (value.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  return value;
}

function signature(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function publicUrl(path: string): string {
  const origin = (process.env.PUBLIC_ORIGIN ?? "").replace(/\/+$/, "");
  return origin ? `${origin}${path}` : path;
}

export function createAdminSession(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${signature(payload)}`;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

export async function isAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature || !/^\d+$/.test(payload)) return false;
  if (Number(payload) <= Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) redirect(publicUrl(LOGIN_PATH));
}

export function verifyAdminPassword(candidate: string): boolean {
  const configured = process.env.ADMIN_PASSWORD ?? "";
  if (configured.length < 12) throw new Error("ADMIN_PASSWORD must contain at least 12 characters");
  const expected = Buffer.from(configured);
  const supplied = Buffer.from(candidate);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function adminCookieName(): string {
  return ADMIN_COOKIE;
}

export function adminPath(): string {
  return ADMIN_PATH;
}

export function loginPath(): string {
  return LOGIN_PATH;
}
