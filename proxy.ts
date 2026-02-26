import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, USER_COOKIE, isAuthorizedCookie } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml")
  ) {
    return NextResponse.next();
  }

  const authValue = req.cookies.get(AUTH_COOKIE)?.value;
  const userValue = req.cookies.get(USER_COOKIE)?.value;
  if (!isAuthorizedCookie(authValue, userValue)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
