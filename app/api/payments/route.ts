import { ALL_PAYMENTS } from "@/lib/payments/data";

export const dynamic = "force-static";

export function GET() {
  // Trade-off: content-hash ?v= URL + s-maxage/swr cache hard at the CDN; max-age=0 keeps browsers revalidating.
  return Response.json(ALL_PAYMENTS, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400" },
  });
}
