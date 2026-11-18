import { ALL_PAYMENTS } from "@/lib/payments/data";

export const dynamic = "force-static";

export function GET() {
  // WHY: static route ignores ?v=, so the content-hash query only busts browser/CDN caches when data changes; max-age=0 keeps browsers revalidating.
  return Response.json(ALL_PAYMENTS, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400" },
  });
}
