import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "fde_token";

const publicPaths = ["/login", "/register", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/screenshot") ||
    pathname.startsWith("/favicon") ||
    /\.(svg|png|jpg|jpeg|gif|ico|css|js|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Only check cookie presence — actual JWT verification happens in API routes.
  // jsonwebtoken relies on Node.js crypto, which is unavailable in Edge runtime.
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|public/|screenshot/).*)"
};
