import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") return NextResponse.next();
  if (request.auth?.user) return NextResponse.next();
  if (pathname.startsWith("/api/admin")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
});

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
