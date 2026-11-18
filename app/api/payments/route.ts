import { ALL_PAYMENTS } from "@/lib/payments/data";

export const dynamic = "force-static";

export function GET() {
  return Response.json(ALL_PAYMENTS, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
