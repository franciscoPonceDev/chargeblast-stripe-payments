# Performance baseline (before Task 12 changes)

Commit `83373e0`, `npm run build` (Turbopack) then `next start`, Lighthouse CLI (default simulated throttling, mobile
and desktop presets), installed Chrome, headless. Median of 3 runs; raw runs in brackets. Test machine Lighthouse
`benchmarkIndex` was about 925-1040, which is slower than the reference device, so absolute mobile TBT is pessimistic.

## Route table

| Route | Route JS | First-load JS |
| --- | --- | --- |
| `/` (redirect) | 0 B | 117 kB |
| `/payments` (dynamic SSR) | 44.9 kB | **202 kB** |
| `/payments/[id]` (SSG) | 1.01 kB | **159 kB** |
| shared by all | | 124 kB |
| Middleware | 39.3 kB | |

## Lighthouse (median of 3)

| Page / preset | Perf | FCP = LCP | CLS | TBT | TTFB | Speed Index | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /payments mobile | 75 [77,75,75] | 934 ms | 0 | 1322 ms [1146,1322,1418] | 135 ms | 1787 ms | 514 KB |
| /payments desktop | 99 [99,98,99] | 313 ms | 0 | 116 ms | 89 ms | 705 ms | 568 KB |
| /payments/pi_... mobile | 87 [84,89,87] | 774 ms | 0 | 536 ms | 12 ms | 979 ms | 185 KB |
| /payments/pi_... desktop | 100 | 237 ms | 0 | 18 ms | 11 ms | 394 ms | 185 KB |

Raw JSON: `scratchpad/perf/B-*.json` (session scratchpad, not committed).

## Why /payments grew from about 185 kB to 202 kB

The 185 kB quoted at Task 10c does not reproduce. Rebuilding each commit with the same toolchain gives:

| Commit | /payments first load | shared |
| --- | --- | --- |
| `243b1c2` shareable URL state (10c) | 195 kB | 121 kB |
| `bf400ad` merge | 196 kB | 121 kB |
| `73f3e02` CSV export (lazy module) | 197 kB | 121 kB |
| `0c448fc` analytics layer + GTM consent | 203 kB | 125 kB |
| `ea06dc7` consent-gated PostHog fix (baseline) | 202 kB | 124 kB |

So the real growth since 10c is about +7 kB: about +2 kB for Edit columns and the Export button (CSV itself is lazy), and about
+6 kB from the analytics layer (typed events, consent store and hook; shared +4 kB because the consent hook and `track`
are used by the top bar, table and banner, page chunk +2 kB), less 1 kB from the later fix. The earlier 185 kB reading was
most likely taken before the URL-state wiring was in the build. `posthog-js` and `web-vitals` are not in any first-load chunk.

## Bundle composition (gzip, `/payments`)

| Chunk | gzip | Contents |
| --- | --- | --- |
| react-dom | 59 kB | React runtime |
| Next client | 21 kB + 17 kB + 7 kB + 5 kB + 6 kB | router, app bootstrap, flight client |
| Radix chunk | 40 kB | popover, tooltip, checkbox, floating-ui, focus scope, dismissable layer, lucide icons used |
| App chunk | 40 kB | PaymentsView, TanStack Table, filters, date-fns/tz, formatters, `react-svg-credit-card-payment-icons` (4 brands) |
| turbopack runtime | 4 kB | |

There is also a 39 kB `nomodule` polyfill chunk that modern browsers do not download or run.

## What the main thread was doing (4x CPU profile, unminified build)

* About 60 ms of the first render was `Intl.NumberFormat` construction (per currency, plus `toLocaleString` in the table footer, about 115 ms throttled).
* About 90 ms was `date-fns` + `TZDate` (`formatDateTime`, `formatDistanceStrict` for every row's tooltip, eagerly).
* The document was 315 KB, 142 KB of it inline card-brand SVG repeated per row (about 2,800 DOM nodes).
* Hydration of Radix tooltips and checkboxes per row and 25 prefetching `<Link>`s.
* Rendering the table twice: once at hydration and again when the full dataset landed.
