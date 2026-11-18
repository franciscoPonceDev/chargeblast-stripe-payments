# Performance results (Task 12)

Same method before and after: `npm run build` then `next start`, Lighthouse CLI (simulated throttling), installed Chrome
headless, median of 3 runs. Before = `83373e0`, after = branch head. Mobile numbers are pessimistic: the test machine's
Lighthouse `benchmarkIndex` was about 925-1040 (below the reference device), and mobile TBT is dominated by React hydration
under 4x CPU slowdown. Baseline details are in [baseline.md](./baseline.md).

## Before / after

| Metric | Before | After |
| --- | --- | --- |
| First-load JS `/payments` | 202 kB | **196 kB** |
| First-load JS `/payments/[id]` | 159 kB | 159 kB |
| First-load JS shared | 124 kB | 124 kB |
| `/payments` HTML document (raw) | 315 KB (142 KB inline SVG) | 287 KB |
| `/payments` transfer (Lighthouse total) | 514 KB mobile | 467 KB |
| **/payments mobile** Performance | 75 | **78** |
| LCP (= FCP) | 934 ms | 1098 ms |
| CLS | 0 | 0 |
| TBT | 1322 ms | 993 ms |
| TTFB | 135 ms | 115 ms |
| **/payments desktop** Performance | 99 | **100** |
| LCP | 313 ms | 291 ms |
| CLS | 0 | 0.002 |
| TBT | 116 ms | 74 ms |
| TTFB | 89 ms | 141 ms |
| **/payments/[id] mobile** Performance | 87 | 85 |
| LCP | 774 ms | 844 ms |
| CLS | 0 | 0 |
| TBT | 536 ms | 605 ms |
| TTFB | 12 ms | 15 ms |
| **/payments/[id] desktop** Performance | 100 | 100 |
| LCP | 237 ms | 248 ms |
| TBT | 18 ms | 14 ms |

Per-run values (after): list mobile perf [76,78,81], TBT [1141,993,810], LCP [997,1098,1208]; list desktop perf [100,100,100], TBT [74,71,75];
details mobile perf [84,89,85], TBT [661,436,605]; details desktop perf [100,100,100]. Run-to-run spread on mobile is
about 300 ms of TBT, so the mobile TBT and LCP deltas are within noise except the list-page TBT trend (all three "after" runs are at or below
the "before" median). The details page is statically rendered and unchanged apart from the new response headers
(about 0.5 KB per response, which accounts for its +8 KB transfer), so its small differences are noise.

## Targets

| Target | Result |
| --- | --- |
| Performance >= 95 mobile | **Not met** (78 list, 85 details). Even the details page (static, 159 kB, 1 row group) scores 85-89 here: with 4x CPU throttle the React + Next runtime alone (about 100 kB gzip, 124 kB shared) costs about 500 ms TBT on this machine. |
| Performance >= 95 desktop | Met (100 / 100) |
| LCP < 1.5 s | Met on every page (list mobile 1.1 s) |
| CLS < 0.02 | Met (0 to 0.002; see below) |
| TBT < 150 ms | Met on desktop (74 ms); not met on mobile (see above) |

## What changed and what it was worth

* **Card brand sprite (server-rendered once)**: per-row inline SVG replaced by `<use>` references to one hidden sprite rendered by the
  Server Component page. Document 315 KB to 287 KB, about 1,500 fewer SVG nodes in the tree, `react-svg-credit-card-payment-icons` leaves the client bundle (first load 203 to 195 kB at that commit).
  Visual check: screenshots identical except for the random A/B banner copy.
* **No `Intl` on the render path**: `formatAmount`, `formatDateTime` and the footer's `toLocaleString` are now plain string building (unit tests compare
  against `Intl` and `date-fns` for every currency and across year boundaries). In the 4x CPU profile this removed about 115 ms (footer) + about 100 ms (amounts and dates) of main-thread time.
* **Lazy relative-time tooltip content**, **hover-only prefetch** of detail routes (25-100 viewport prefetches removed from first load), and
  **stable server result identity** when the full dataset lands (no second table render when the page did not change).
* **Zero CLS for saved table settings**: with saved hidden columns + wrap, CLS was 0.033 (desktop) and 0.012 (mobile); it is now 0. A tiny pre-paint script
  turns saved settings into a `<style>` so the first paint has the final layout; `useTableSettings` removes it after React applies the same settings.
  The Export failure message is now out of flow so it cannot shift neighbours. Banner dismiss is user-initiated (excluded from CLS by the metric; measured 0.035 with input, 0 without).
  The default view still has an occasional 0.001-0.006 shift from the browser sizing an auto-layout table while the document is still streaming in.
* **Security headers** (CSP, Referrer-Policy, nosniff, Permissions-Policy, production-only HSTS) on all routes; no console CSP violations with and without a fake GTM id.

## Tried and not kept

* `content-visibility: auto` on `tbody tr`: no measurable effect (4 runs each, 100 rows, 4x CPU: 1.5-2.6 s either way). Chrome does not apply containment to table rows. Not added.
* Splitting filter popover bodies, Edit columns and account menu into lazy chunks: the bodies are about 3 kB gzip in total, so the saving does not justify an extra request and an
  async gap on first open. Not added. The meaningful lazy boundaries (CSV export, web-vitals, posthog-js, GTM `next/script`) were already in place and verified out of every first-load chunk.
* `useDeferredValue` for search: the client query over 600 rows is sub-millisecond and search input is already debounced; no jank observed.

## Reproduce

```
npm run build && npx next start -p 3200
npx lighthouse http://localhost:3200/payments --output=json --chrome-flags="--headless=new"            # mobile
npx lighthouse http://localhost:3200/payments --preset=desktop --output=json --chrome-flags="--headless=new"
```

## Re-check after the final review fixes (2026-11-18)

The final review moved the shared tooltip provider and screen-reader announcer into the root layout. Fresh `npm run build` and `npm run lhci` (desktop, 3 runs each) on `d36155e`:

| Metric | Value |
| --- | --- |
| First-load JS `/payments` | 198 kB |
| First-load JS `/payments/[id]` | 161 kB |
| First-load JS shared | 146 kB (provider code moved from page chunks into the shared chunk) |
| `/payments` desktop Performance | 98, 98, 100 (LCP 274-313 ms, CLS 0-0.004, TBT 59-125 ms) |
| Details desktop Performance | 100, 100, 100 (LCP 230-246 ms, CLS 0, TBT 22-43 ms) |
| Accessibility / Best practices | 100 / 100 on every run |
