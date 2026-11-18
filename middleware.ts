import { NextResponse, type NextRequest } from "next/server";
import { assignVariant, BANNER_COOKIE, parseVariant } from "@/lib/experiments";

export function middleware(req: NextRequest) {
  if (parseVariant(req.cookies.get(BANNER_COOKIE)?.value)) return NextResponse.next();
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const variant = assignVariant(buf[0] / 2 ** 32);
  // Forward the cookie on this request too, so the server render of the very first visit uses the same variant.
  const headers = new Headers(req.headers);
  const existing = headers.get("cookie");
  headers.set("cookie", `${existing ? `${existing}; ` : ""}${BANNER_COOKIE}=${variant}`);
  const res = NextResponse.next({ request: { headers } });
  res.cookies.set(BANNER_COOKIE, variant, { maxAge: 60 * 60 * 24 * 90, sameSite: "lax", path: "/" });
  return res;
}

export const config = { matcher: ["/payments", "/payments/:path*"] };
