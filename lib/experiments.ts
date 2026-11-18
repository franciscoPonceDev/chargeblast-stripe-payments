export type Variant = "a" | "b";

export const BANNER_EXPERIMENT = "banner_cta";
export const BANNER_COOKIE = "ab_banner";
export const BANNER_CTA: Record<Variant, string> = { a: "Get started", b: "Explore Sigma" };

/** Maps a uniform random in [0, 1) to a 50/50 variant. */
export function assignVariant(random: number): Variant {
  return random < 0.5 ? "a" : "b";
}

export function parseVariant(value: string | undefined | null): Variant | null {
  return value === "a" || value === "b" ? value : null;
}
