import { NextResponse } from "next/server";

const securityHeaders = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Content-Security-Policy": "base-uri 'self'; frame-ancestors 'self'; object-src 'none'",
};

export function middleware() {
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) response.headers.set(key, value);
  return response;
}

export const config = {
  matcher: "/:path*",
};
