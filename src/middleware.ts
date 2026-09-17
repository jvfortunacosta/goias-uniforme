import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/((?!login).*)",
    "/api/admin/((?!login).*)",
  ],
};
