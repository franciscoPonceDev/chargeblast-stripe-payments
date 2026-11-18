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
| `experiment_viewed` | Banner visible, once per session | `experiment`, `variant` |
| `web_vitals` | Each Core Web Vital reported | `name`, `value` (ms; CLS x1000), `rating`, `id` |

## GTM / GA4 setup

1. Create a GTM web container and set `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`. Without it nothing loads and no container id is committed.
2. Add a **Google tag** (GA4 configuration) with your measurement id, firing on All Pages.
3. For each event above, create a Custom Event trigger (trigger name = event name) and a **GA4 Event** tag with the same event name. Map params with Data Layer Variables (e.g. `filter`, `value_count`, `variant`).
4. Register custom dimensions in GA4 (event scope): `variant`, `experiment`, `filter`, `tab`. Register `value` as a metric for `web_vitals` if you want averages.
5. Consent Mode v2: defaults are set before the container loads (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` all `denied`, `wait_for_update: 500`). The "Analytics cookies" switch in the account menu sends `consent update` for `analytics_storage` and persists in `localStorage` (`consent.analytics.v1`). In GTM, keep the GA4 tags on built-in consent checks (`analytics_storage`).

## Server-side tagging

Set `NEXT_PUBLIC_GTM_SERVER_URL=https://sgtm.example.com` to load `gtm.js` from your sGTM endpoint (first-party domain) and set `transport_url` on Google tags. In the server container, add a GA4 client and a GA4 tag; this keeps collection first-party and lets you scrub or enrich events server-side.

## A/B experiment: `banner_cta`

`middleware.ts` assigns a sticky `ab_banner` cookie (`a` or `b`, 50/50, 90 days) on `/payments` and forwards it to the same request, so the server render shows the right copy without flicker. `a` = "Get started", `b` = "Explore Sigma".

Reading it in GA4: use `experiment_viewed` as the exposure (count users by the `variant` custom dimension) and `banner_cta_clicked` as the conversion; compare unique users with the click event divided by users with the exposure event per variant in an Exploration (free form, `variant` as the breakdown).

## PostHog (optional)

Set `NEXT_PUBLIC_POSTHOG_KEY` (and optionally `NEXT_PUBLIC_POSTHOG_HOST`). `posthog-js` is loaded with a dynamic import only when the key is set, and every `track` call is forwarded through the adapter registry (`registerAdapter`). It runs with in-memory persistence and is not tied to the consent switch.
