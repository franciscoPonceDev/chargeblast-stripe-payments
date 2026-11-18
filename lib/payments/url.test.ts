import { describe, expect, it } from "vitest";
import { DEFAULT_QUERY, type PaymentsQuery } from "./query";
import { isRealDay, parseQuery, serializeQuery } from "./url";

const rich: PaymentsQuery = {
  tab: "failed",
  search: "jane doe & co",
  statuses: ["failed", "blocked"],
  methods: ["wallet", "card"],
  currencies: ["eur", "usd"],
  date: { preset: "custom", from: "2026-10-01", to: "2026-10-31" },
  amount: { op: "between", min: 10, max: 20.5 },
  sort: [
    { id: "amount", desc: false },
    { id: "created", desc: true },
  ],
  page: 2,
  pageSize: 50,
};
const p = (s: string) => parseQuery(new URLSearchParams(s));

describe("payments URL state", () => {
  it("round-trips a rich query", () => {
    const sp = serializeQuery(rich);
    expect(parseQuery(new URLSearchParams(sp.toString()))).toEqual(rich);
  });
  it("round-trips each amount op and date preset", () => {
    for (const amount of [
      { op: "eq", value: 9.88 },
      { op: "gt", value: 100 },
      { op: "lt", value: 50 },
    ] as const) {
      expect(p(serializeQuery({ ...DEFAULT_QUERY, amount }).toString()).amount).toEqual(amount);
    }
    for (const preset of ["today", "7d", "30d"] as const) {
      expect(p(serializeQuery({ ...DEFAULT_QUERY, date: { preset } }).toString()).date).toEqual({ preset });
    }
  });
  it("omits defaults", () => {
    expect(serializeQuery(DEFAULT_QUERY).toString()).toBe("");
    expect(p("")).toEqual(DEFAULT_QUERY);
  });
  it("uses compact readable params", () => {
    const s = serializeQuery(rich);
    expect(s.get("amount")).toBe("between:10-20.5");
    expect(s.get("sort")).toBe("amount.asc,created.desc");
    expect(s.get("status")).toBe("failed,blocked");
    expect(s.get("page")).toBe("3");
    expect(s.get("size")).toBe("50");
    expect(s.get("date")).toBe("custom");
  });
  it("converts page between 1-based URL and 0-based state", () => {
    expect(p("page=1").page).toBe(0);
    expect(p("page=4").page).toBe(3);
    expect(serializeQuery({ ...DEFAULT_QUERY, page: 0 }).has("page")).toBe(false);
    expect(serializeQuery({ ...DEFAULT_QUERY, page: 3 }).get("page")).toBe("4");
  });
  it("keeps multi-value order and drops duplicates", () => {
    expect(p("status=failed,succeeded,failed").statuses).toEqual(["failed", "succeeded"]);
    expect(p("currency=jpy,usd,eur").currencies).toEqual(["jpy", "usd", "eur"]);
    expect(p("sort=status.desc,amount.asc,status.asc").sort).toEqual([
      { id: "status", desc: true },
      { id: "amount", desc: false },
    ]);
  });
  it.each([
    "tab=bogus",
    "status=nope",
    "method=cheque",
    "currency=xyz",
    "date=yesterday",
    "date=custom",
    "date=custom&from=2026-13-45&to=garbage",
    "from=2026-10-01&to=2026-10-02",
    "amount=gt:abc",
    "amount=between:5",
    "amount=eq:-3",
    "amount=huge",
    "sort=foo.desc",
    "sort=created.sideways",
    "sort=",
    "page=0",
    "page=-2",
    "page=abc",
    "page=1.5",
    "size=30",
    "size=abc",
    "unknown=1&another=x",
  ])("falls back to defaults for invalid %s", (qs) => {
    expect(p(qs)).toEqual(DEFAULT_QUERY);
  });
  it("keeps valid parts when others are invalid", () => {
    expect(p("status=failed,nope&tab=bogus&size=50")).toEqual({
      ...DEFAULT_QUERY,
      statuses: ["failed"],
      pageSize: 50,
    });
    expect(p("date=custom&from=2026-10-01&to=x").date).toEqual({ preset: "custom", from: "2026-10-01", to: null });
  });
  it("accepts Next-style record params (first value of arrays)", () => {
    expect(parseQuery({ tab: ["failed", "all"], size: "100", q: undefined })).toEqual({
      ...DEFAULT_QUERY,
      tab: "failed",
      pageSize: 100,
    });
  });
  it("validates calendar days without depending on the timezone", () => {
    for (const d of ["2026-10-01", "2024-02-29", "2026-12-31", "2026-01-01"]) expect(isRealDay(d)).toBe(true);
    for (const d of ["2026-02-29", "2026-13-01", "2026-00-10", "2026-04-31", "26-01-01", "2026-1-1", "x"]) expect(isRealDay(d)).toBe(false);
    const tz = process.env.TZ;
    try {
      for (const z of ["Asia/Tokyo", "Pacific/Kiritimati", "America/Los_Angeles"]) {
        process.env.TZ = z;
        expect(p("date=custom&from=2026-10-01&to=2026-10-02").date).toEqual({ preset: "custom", from: "2026-10-01", to: "2026-10-02" });
      }
    } finally {
      process.env.TZ = tz;
    }
  });
  it("normalises reversed ranges", () => {
    expect(p("amount=between:20-10").amount).toEqual({ op: "between", min: 10, max: 20 });
    expect(p("date=custom&from=2026-10-31&to=2026-10-01").date).toEqual({ preset: "custom", from: "2026-10-01", to: "2026-10-31" });
  });
  it("rejects loose numeric forms and caps search length", () => {
    for (const qs of ["size=5e1", "size=+50", "size=50.0", "page=1e1", "page=+2"]) expect(p(qs)).toEqual(DEFAULT_QUERY);
    const long = "x".repeat(500);
    expect(serializeQuery({ ...DEFAULT_QUERY, search: long }).get("q")).toHaveLength(200);
    expect(p(`q=${long}`).search).toHaveLength(200);
  });
  it("round-trips special characters in search", () => {
    const search = "a+b@x.com & ü";
    const qs = serializeQuery({ ...DEFAULT_QUERY, search }).toString();
    expect(p(qs).search).toBe(search);
  });
});
