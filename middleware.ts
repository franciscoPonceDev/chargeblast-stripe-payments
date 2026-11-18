import { NextResponse, type NextRequest } from "next/server";
import { assignVariant, BANNER_COOKIE, parseVariant } from "@/lib/experiments";

export function middleware(req: NextRequest) {
  if (parseVariant(req.cookies.get(BANNER_COOKIE)?.value)) return NextResponse.next();
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const variant = assignVariant(buf[0] / 2 ** 32);
  // Forward the cookie on this request too, so the server render of the very first visit uses the same variant.
  // Any invalid existing pair is stripped first so the assigned value is the only one the page can read.
  const headers = new Headers(req.headers);
  const rest = (headers.get("cookie") ?? "")
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c && !c.startsWith(`${BANNER_COOKIE}=`));
  headers.set("cookie", [...rest, `${BANNER_COOKIE}=${variant}`].join("; "));
  const res = NextResponse.next({ request: { headers } });
  // httpOnly: only the server reads it (SSR copy), so scripts and GTM cannot. Secure in production.
  res.cookies.set(BANNER_COOKIE, variant, {
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export const config = { matcher: ["/payments", "/payments/:path*"] };
