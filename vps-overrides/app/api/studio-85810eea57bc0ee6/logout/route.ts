import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, loginPath, publicUrl } from "../../../vps-auth";

export async function GET() {
  const response = NextResponse.redirect(new URL(publicUrl(loginPath())), 303);
  response.cookies.set(adminCookieName(), "", { ...adminCookieOptions(), maxAge: 0 });
  return response;
}
