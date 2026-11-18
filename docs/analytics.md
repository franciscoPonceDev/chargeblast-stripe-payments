# Analytics and experimentation

All tracking goes through `track(name, params)` in `lib/analytics/events.ts`, which pushes `{ event, ...params }` to `window.dataLayer` (the GTM contract). It is a no-op on the server. Params are counts and enums only: no raw search text, emails, names or payment ids.

## Event dictionary

| Event | When | Params |
| --- | --- | --- |
| `filter_applied` | A filter (date, amount, currency, status, method) gets a non-default value | `filter`, `value_count` |
| `filter_cleared` | A filter (or search) returns to its default | `filter` |
| `search_performed` | Search text applied | `query_length` |
| `sort_changed` | A column header sort changes | `column`, `direction` |
| `page_changed` | Next/Previous or rows-per-page change | `page` (1-based), `page_size` |
| `export_csv` | CSV downloaded | `row_count` |
| `payment_id_copied` | Copy ID button used | none |
| `payment_opened` | Row or amount link opens payment details | none |
| `status_tab_selected` | Status tab changed | `tab` |
| `banner_cta_clicked` | Banner CTA clicked | `variant` |
| `banner_dismissed` | Banner dismissed | none |
| `experiment_viewed` | Banner rendered, once per session (fires on render, not on scroll-into-view) | `experiment`, `variant` |
| `web_vitals` | A Core Web Vital is reported (CLS, INP, LCP, FCP, TTFB only) | `name`, `value` (ms; CLS x1000), `rating`, `id` |

## GTM / GA4 setup

1. Create a GTM web container and set `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`. Without it nothing loads and no container id is committed.
2. Add a **Google tag** (GA4 configuration) with your measurement id, firing on All Pages.
3. For each event above, create a Custom Event trigger (trigger name = event name) and a **GA4 Event** tag with the same event name. Map params with Data Layer Variables (e.g. `filter`, `value_count`, `variant`).
4. Register custom dimensions in GA4 (event scope): `variant`, `experiment`, `filter`, `tab`. Register `value` as a metric for `web_vitals` if you want averages.
5. Consent Mode v2: defaults are set before the container loads (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` all `denied`, `wait_for_update: 500`). The "Analytics cookies" switch in the account menu sends `consent update` for `analytics_storage` and persists in `localStorage` (`consent.analytics.v1`). In GTM, keep the GA4 tags on built-in consent checks (`analytics_storage`).

Notes and limits:
- The consent-default script runs `beforeInteractive` (supported in the App Router root layout); the GTM loader runs `afterInteractive`.
- A stored grant is replayed as `consent update` right after the default on every page load.
- Withdrawing consent stops further storage but does **not** delete `_ga` cookies already set; clear them in GTM (or via a cookie-clearing tag) if you need that.
- The choice is synced across tabs through the `storage` event.
- The GTM `<noscript>` iframe fallback is intentionally not rendered (no-JS users get no analytics).
- In `next dev`, React strict mode and HMR can report Web Vitals more than once; judge numbers on a production build.

## Server-side tagging

Set `NEXT_PUBLIC_GTM_SERVER_URL=https://sgtm.example.com` to load `gtm.js` from that origin and to push `transport_url` and `server_container_url` (via `gtag('set', ...)`) before the container loads.

What is automated vs manual: the app only points the loader and those two settings at your endpoint. It does not provision anything. Your server container (or a Google tag gateway) must serve the loader at `/gtm.js` on that origin, and `server_container_url` / `transport_url` must also be set in the GA4 / Google tag configuration inside GTM, otherwise hits still go to Google. In the server container add a GA4 client and a GA4 tag; this keeps collection first-party and lets you scrub or enrich events.

## A/B experiment: `banner_cta`

`middleware.ts` assigns a sticky `ab_banner` cookie (`a` or `b`, 50/50, 90 days, `SameSite=Lax`, `HttpOnly`, `Secure` in production) on `/payments` and forwards it to the same request, so the server render shows the right copy without flicker. `a` = "Get started", `b` = "Explore Sigma".

The cookie is first-party and functional (it keeps the page copy stable), so it is set independently of analytics consent. Because it is `HttpOnly`, GTM and client scripts cannot read it; the variant reaches analytics through the `variant` param on `experiment_viewed` and `banner_cta_clicked`. Drop `httpOnly` if a GTM variable must read it.

Reading it in GA4: use `experiment_viewed` as the exposure (users by the `variant` custom dimension) and `banner_cta_clicked` as the conversion; in a free-form Exploration, break down by `variant` and compare unique users with the click event divided by unique users with the exposure event.

## PostHog (optional)

Set `NEXT_PUBLIC_POSTHOG_KEY` (and optionally `NEXT_PUBLIC_POSTHOG_HOST`). `posthog-js` is loaded with a dynamic import only when the key is set, and every `track` call is forwarded through the adapter registry (`registerAdapter`). It is consent-gated: initialised with `opt_out_capturing_by_default`, `autocapture: false`, `capture_pageview: false`, `disable_session_recording: true` and `persistence: 'memory'`, and opted in or out by the same "Analytics cookies" switch (including a stored grant at load). Nothing is captured before consent, and only the PII-free params above are ever sent.
