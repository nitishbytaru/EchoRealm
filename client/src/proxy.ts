import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("echo-token")?.value;
  const { pathname } = request.nextUrl;

  // Define public paths (landing page / login)
  const isPublicPath = pathname === "/";

  // Define paths that require authentication
  const isProtectedPath =
    pathname.startsWith("/shout") ||
    pathname.startsWith("/links") ||
    pathname.startsWith("/mumbles") ||
    pathname.startsWith("/profile");

  if (isProtectedPath && !token) {
    // If trying to access protected route without token, redirect to landing page
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isPublicPath && token) {
    // If logged in and trying to access landing page, redirect to main feed
    return NextResponse.redirect(new URL("/shout", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/shout/:path*",
    "/links/:path*",
    "/mumbles/:path*",
    "/profile/:path*",
  ],
};
