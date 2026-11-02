import { NextResponse, type NextRequest } from "next/server";

/**
 * The admin panel has no public route. It is served only when the home page
 * is requested with the secret query parameter (ADMIN_QUERY_KEY=ADMIN_QUERY_VALUE).
 * Requests straight to /admin get a 404.
 *
 * This only hides the panel. Access is enforced by Google sign-in plus the
 * ADMIN_EMAIL allowlist, checked on the server for every admin request.
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/404", req.url), { status: 404 });
  }

  const key = process.env.ADMIN_QUERY_KEY || "sso";
  const value = process.env.ADMIN_QUERY_VALUE;
  if (pathname === "/" && value && searchParams.get(key) === value) {
    const res = NextResponse.rewrite(new URL("/admin", req.url));
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin", "/admin/:path*"],
};
