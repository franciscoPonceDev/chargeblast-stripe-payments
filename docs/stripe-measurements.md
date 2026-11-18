# Stripe Dashboard Payments (test/sandbox) - measured values

Source: `docs/stripe-capture/stripe-capture-default.json` (viewport 1440x767, dpr 1, 1551 nodes).
All rects are `x,y,w,h` in px. Colors converted to hex. `@a` = alpha.
Notes on the capture:
- Root/`html` font-size is not in the dump (nodes start at body). Base text is 14px / 20px (inferred: every unstyled text node has line-height 20px; 12px text is set explicitly on 68 nodes; no node sets 14px except one Developers button).
- Body text color `#1a2c44` (set on node 3, the app root). Table body is detached from the tree in the dump, so its unset text = same inherited `#1a2c44`, weight 400, 14px/20px.
- Layout scrollbar: content width 1425 (main), 15px scrollbar on right of the 1440 viewport.
- This capture DIFFERS from the task brief in places (documented honestly below): no "New" chip banner; banner is a Stripe Billing promo; no status "cards" (they are pill tabs); no row of Date/Amount/Currency/... filter pills (single "Filter" button); no left bar border other than a 1px divider; tabs include "Standalone 3DS", no Collected fees/Transfers. "Create payment" is a WHITE outlined button here, not primary-colored.

## 0. Fonts and shared tokens

| Token | Value |
|---|---|
| Sans stack (root, set once) | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` |
| Mono stack (ID chip only) | `"Source Code Pro", Menlo, Monaco, monospace` |
| Base | 14px / 20px, weight 400, letter-spacing normal (never set), color `#1a2c44` |
| Small | 12px (table header, badges, ID chip, sidebar section titles, footer text, workspace name); line-height 20px in th/ID, 16px in badges/footer/workspace |
| Medium weight | 600 for everything "bold-ish" (tabs, buttons, th, amounts); 700 only for h1 and th element (text span resolves to 600) |
| Page bg | `#ffffff` (body/main/sidebar/table all white) |

Colors (hex, usage):

| Hex | Where |
|---|---|
| `#1a2c44` | default text, h1, active tab text + underline bg, status-pill text, sidebar item text, topbar icons, "All" pill border |
| `#273951` | button text/icons (Export, Analyze, Create payment, Filter, Table settings, row action icons) |
| `#3c4f69` | secondary text: inactive section tabs, th text, USD/EUR currency code, ID chip text, banner text, footer text, search placeholder, sidebar section title ("Shortcuts"), kbd "/" |
| `#50617a` | "Uncaptured" badge text |
| `#87909f` | Workbench bar text (13px) |
| `#7d8ba4` | sidebar collapse handle bars |
| `#533afd` | brand/primary: "Start now" link, active sidebar item (text+icon), "Switch to live account" bg, topbar "Create" circle bg |
| `#675dff` | lighter brand: banner close icon, sandbox info icon |
| `#0e3359` | sandbox banner bar bg |
| `#ffffff` | sandbox text, buttons/pills/inputs bg |
| `#f4f7fa` | banner bg, search bg, Uncaptured badge bg, ID chip bg, Setup-guide pill bg, toolbar bottom border, workspace avatar bg |
| `#ecf1f6` | hairlines: row/header bottom (inset shadow), sidebar divider, pill borders, footer top border, row-action separators, kbd chip bg |
| `#d4dee9` | button ring (1px shadow), tab-bar bottom border, checkbox ring, Uncaptured badge border, col-resize handle |
| `#eafcdd` / `#a8f170` / `#217005` | Succeeded badge bg / border / text |
| `#000000@0.12` + `#30313d@0.08` | checkbox shadows |

Buttons use ring-shadows, not borders: `box-shadow: 0 0 0 0 #0000, 0 0 0 1px <ring>, 0 0 0 0 #0000, 0 0 0 0 #0000`.

## 1. Global shell

| Item | Measurement |
|---|---|
| Viewport | 1440x767 |
| Sandbox banner (fixed, top) | rect 0,0,1425,44; bg `#0e3359`; padding 0 20px; text `#ffffff`; "Sandbox" 600 at x20,y12; info icon 16px at 83,14 color `#675dff`; message centered text at x425.7 (573.7 wide); "Switch to live account" button 1250.8,8,154.2x28: bg `#533afd`, radius 6, padding 4/8, ring `#533afd`, text white 600; decorative 12px corner svgs at 0,44 and 1413,44 |
| Left sidebar | x0, y44, w240, h723 (to 767); bg `#ffffff`; right divider 1px `#ecf1f6` at x239 (separate div, 1x723); no border-box border |
| Sidebar content padding | 20px left/right; top block 60px high (44-104) |
| Account switcher | button 14,52,212x44, radius 8, padding 6, gap 8, margin -6 horizontal; avatar 24x24 at 20,62, bg `#f4f7fa`, radius 4, letter "T" 12px/16 600 `#3c4f69`; name "Test sandbox" 12px/16 600 `#1a2c44` at 52,58; sub "Test" 12px/16 400 `#1a2c44` at 52,74; chevron 8px at 206,70 |
| Nav lists | nav 0,124,240x643, padding 0 20px 48px, gap between sections 28px; items 200x30 at x20, stacked with 0 gap (y 124,154,184,214,244 ...), radius 6, inner gap 6, icon 24x24 box (svg 16px at x24) text at x52, 14px/20 400 `#1a2c44` |
| Active nav item "Transactions" | text 600 `#533afd`, icon `#533afd`; no background change in dump |
| Section titles ("Shortcuts" y302, "Products" y416) | 200x26, 12px/20 `#3c4f69`, weight 400; pin buttons 12px at x212 (opacity 0 until hover; manage button 28x28 opacity 0) |
| Product rows (Treasury, Payments, Billing, Reporting, Apps, More) | 200x30 each, y 442,472,502,532,562,592; chevron svg 8px at x206 |
| Sidebar bottom | section 20,687,200x32 ("Developer links"), 650 block 200x56 |
| Top bar | container 0,44,1440x60; inner row y56 h36; padding-left 280, padding-right 40 (content x280..1385); no bg, no bottom border (white on white) |
| Search | wrapper 280,56,360x36 (ref width 600 container); bg `#f4f7fa`; radius 8; no border; icon 12px at 292,67.5 color `#1a2c44`; placeholder "Search" at x312,y64, 14/20 400 `#3c4f69`; input 332x39 padding 10/4/10/32; kbd chip 20x20 at 612,64 bg `#ecf1f6` radius 4 (opacity 0 until focus), "/" 13px 600 `#3c4f69` |
| Right actions | gap 24: Help circle 32x32 at 1090.4,58 (icon 16px `#1a2c44`); Notifications 32x32 at 1130.4; Settings link 32x32 at 1170.4; Create 36x36 circle at 1210.4,56 bg `#533afd` with 12px white plus; "Setup guide" pill 1262.4,56,122.6x36 bg `#f4f7fa`, radius pill, padding 8/8/8/12, text 14/20 400 `#1a2c44`, 20px progress ring (25%) at 1357,64 |
| Bottom Workbench bar | fixed 0,719,1425x48, 13px `#87909f`, top rule 1px at y766; "Developers" link 14px; icon buttons 32x32 at x1205,1245,1285,1325,1381 (weight 500) y727.5 |

## 2. Main content / title / header buttons

| Item | Measurement |
|---|---|
| main | 0,104,1425x1284; padding-left 280, padding-right 40; margin-top 104 |
| Content column | x280 to x1385, width 1105px |
| Content inner wrapper | padding-top 8, padding-bottom 48 |
| Header block | 280,120,1105x77; margin-top 8, margin-bottom 16; title row 36px high, gap 16 |
| Top bar bottom (y104) to title top (y120) | 16px (8 wrapper pad + 8 margin) |
| h1 "Transactions" | 280,120,163.5x36; 28px / 36px; weight 700; `#1a2c44`; letter-spacing normal |
| Button group | 1178.5,124,206.5x28 (right aligned to x1385); gap 8; vertically offset +4 from title |
| Buttons (all three same style) | height 28 (min-height 28), padding 4/8, gap 6, bg `#ffffff`, radius 6, ring `0 0 0 1px #d4dee9`, no drop shadow, text 14/20 600 `#273951`, nowrap |
| Export | 1178.5,124,28x28 icon-only (aria "Export"), svg 12x12 `#273951` |
| Analyze | 1214.5,124,28x28 icon-only (aria "Analyze"), svg 12x12 |
| Create payment | 1250.5,124,134.5x28, 12px icon at x1258.5 + text "Create payment" (text 600) |
| Title bottom to tabs | tabs wrapper y160 (title bottom 156 + margin-top 4) |

## 3. Section tabs

| Item | Measurement |
|---|---|
| Tab bar | 280,160,1105x37; bottom border 1px `#d4dee9` at y196 (full width) |
| Tablist | 280,160,425x36; tab height 36 |
| Tab | padding 8/12, nowrap, font 14/20 600; first tab margin-left -12 (text x aligned to x280), last margin-right -12 |
| Active (Payments) | text `#1a2c44`; underline 61x2 at 280,195 (absolute div) bg `#1a2c44` (spans text width, not padding) |
| Inactive | text `#3c4f69` |
| Text rects | Payments 280,168 w61.3; Payouts 365.3 w49.7; Top-ups 439 w51.4; Standalone 3DS 514.5 w100.4; All activity 638.9 w66.1 |
| Tab rects (x,w) | Payments 268/85.3 (incl margin), Payouts 353.3/73.7, Top-ups 427/75.4, Standalone 3DS 502.5/124.4, All activity 626.9/90.1 |
| Gap between tabs | 0 (padding 12+12 = 24px between texts) |
| Tabs bottom to next block | next block y213 (16 gap after tab bar y197) |

Labels: `Payments`, `Payouts`, `Top-ups`, `Standalone 3DS`, `All activity`.

## 4. Banner (promo)

| Item | Measurement |
|---|---|
| Rect | 280,213,1105x60 (wrapper margin-bottom 16 -> table section starts y305 incl. 4px pad) |
| Style | `<aside role=note>` padding 16, bg `#f4f7fa`, radius 8, no border/shadow (outer link has ring 0 0 0 1px transparent) |
| Inner row | 296,229,1073x28, gap 32, space-between |
| Icon | 16x16 at 296,235.3 color `#1a2c44` |
| Message | x328,y233.3 w610; 14/20 400 `#3c4f69`; gap icon->text 16 |
| Link "Start now" | 1278.5,233 w58.5; 14/20 (weight 400 as captured) `#533afd`, nowrap |
| Dismiss | button 1349,229,28x28; padding 8, margin-right -8, radius 6; 12px x icon `#675dff` |
| "New" chip | NOT PRESENT in capture |

Text: "Stripe Billing makes it easier and faster for customers to automatically pay you" (continuation truncated in capture, begins "...pay you"), link "Start now", button aria "Close".

## 5. Status pills (not cards) + list controls

| Item | Measurement |
|---|---|
| Sticky list-controls wrapper | 280,301,1105x99, padding-top 4, margin-top -4, bg `#ffffff` |
| Toolbar | 280,305,1105x55; padding-bottom 16; bottom border 1px `#f4f7fa`; gap 8 |
| Pill list | 280,305,602.9x38; items wrapped in divs with margin-right 8 |
| Pill (inactive) | height 38; padding 8/12; border 1px solid `#ecf1f6`; radius 8; bg `#ffffff`; text 14/20 600 `#1a2c44` |
| Pill (selected "All") | padding 7/11; border 2px solid `#1a2c44`; radius 8; bg `#ffffff`; text 600 `#1a2c44`; no shadow |
| Pill rects (x,w) | All 280/42.7; Succeeded 330.7/94.1; Refunded 432.9/87.3; Disputed 528.1/83.2; Failed 619.3/63.1; Uncaptured 690.4/100.5; Blocked 798.9/76 ; all y305 h38; gap 8 |
| Text x | pill x + 13 (selected) / + 13 (others: 12 pad + 1 border) |
| "More views" button | 882.9,305,38x38; padding 8/12; border 1px `#ecf1f6`; radius 8; 12px icon `#273951` |
| Filter button | 1257,306,84x36; padding 0 14; gap 6; bg white; border 1px `#ecf1f6`; radius 8; text 600 `#273951`; 16px icon at x1272 |
| Table settings | 1349,306,36x36; border 1px `#ecf1f6`; radius 8; 16px icon |
| Gap Filter->settings | 8 |
| Date/Amount/Currency/Status/Payment method/More filters pills, Export, Edit columns | NOT PRESENT in default capture (only "Filter" + "Table settings"; Export is the 28px icon button in header) |

Labels: `All`, `Succeeded`, `Refunded`, `Disputed`, `Failed`, `Uncaptured`, `Blocked`, `Filter`, aria `More views`, `Table settings`, `List controls`.

## 6. Table

Table container 280,360 (below toolbar), width 1105 visible, inner scroll width 1726 (cols end x2006).

| Item | Measurement |
|---|---|
| Header row | tr 280,360,1726x40; bg `#ffffff`; th height 40 |
| th | padding 10/16; text 12/20 600 `#3c4f69`, no uppercase, no letter-spacing; bottom hairline = inset shadow `0 -1px 0 0 #ecf1f6` (1px `#ecf1f6`); also outer ring shadow transparent |
| Sort/label button | 20px high, radius 4, inline; amount column right-aligned, sort icon sits left of label |
| Body row | tr height 44 (rows y400,444,488 ... 44 pitch, 20 rows -> 880); td padding 4 vertical + inner span padding 8/16 (36 inner) |
| Row divider | inset shadow `0 -1px 0 0 #ecf1f6` on each td (1px `#ecf1f6`) |
| Row bg | `#ffffff` |
| Cell text | 14/20 400 `#1a2c44` unless noted; nowrap |
| Date format | `Nov 17, 2026, 11:14 PM` |

Columns in order (x, w, align, pad L/R):

| # | Column | x | w | Align | Cell content |
|---|---|---|---|---|---|
| 0 | select | 280 | 40 | center | checkbox 14x14 at x293 (td sticky) |
| 1 | Amount | 320 | 131 | right | 16px side padding; amount + code |
| 2 | Status | 451 | 120 | left | badge |
| 3 | Payment method | 571 | 149 | left | card icon + dots + last4 |
| 4 | Wallet | 720 | 112 | left | "—" |
| 5 | Date | 832 | 190 | left | date text |
| 6 | Description | 1022 | 168 | left | "Subscription update" |
| 7 | Customer name | 1190 | 142 | left | "—" |
| 8 | Customer email | 1332 | 236 | left | email |
| 9 | ID | 1568 | 398 | left | mono chip |
| 10 | actions | 1966 (sticky: 1345) | 40 | left | hover action group |

(all th/td in cols 1-9 padding 16 left and right; checkbox col padding 16 around 14px box.)

| Cell detail | Measurement |
|---|---|
| Checkbox | 14x14; bg `#ffffff`; radius 4; ring `0 0 0 1px #d4dee9`; shadows `0 1px 1px #000000@0.12`, `0 2px 5px #30313d@0.08`; x293, centered vertically (y+14 in 44 row) |
| Amount | right aligned, tabular-nums; amount text 14px 600 (color inherits `#1a2c44`); currency code 14px 400 `#3c4f69` (uppercase as given e.g. USD) in 32px box at x403; amount right edge x399 -> 4px gap to code; code right edge x435 (16 pad) |
| Amount examples | `$49.99`, `€29.00`, `£21.98`, `$14.50`, `€189.99`, `R$49.99`, `$249.00` with codes `USD EUR GBP BRL` |
| Status badge | inline span; padding 1/6; border 1px; radius 4; font 12px / 16px (weight 400 as captured; no icon in badge); height ~20 (rect h20: 16 + 2 pad... row 20); gap 4; text only |
| Badge Succeeded | bg `#eafcdd`, border `#a8f170`, text `#217005`; w71.2 |
| Badge Uncaptured | bg `#f4f7fa`, border `#d4dee9`, text `#50617a`; w76.1 |
| Badge Failed/Canceled/Blocked/Refunded | not present in data rows (only Succeeded x18, Uncaptured x2) |
| Payment method | card icon 16x16 at x587 (radius 2; svg inside), gap 8, text `•••• 4242` 14/20 400 `#1a2c44` (dots are U+2022 x4 + space) at x611; cards: Visa 4242/5556, Amex 8431, Mastercard 4444 |
| Wallet / Customer name | `—` (em dash) 14px `#1a2c44` |
| Date | `#1a2c44` 14px 400 |
| Description | `Subscription update` `#1a2c44` |
| Email | `#1a2c44`, e.g. `liam.miller155@icloud.com` |
| ID chip | button 210.1x26 at x1584,y+9; padding 2/4/2/6; gap 4; bg `#f4f7fa`; border 1px `#ecf1f6`; radius 6; text 12px `"Source Code Pro"` `#3c4f69` (middle-truncated with "…" for long ids); copy icon 12px `#3c4f69` in 16x16 box at right |
| Row hover actions | absolute group 88x30 right-aligned ending x1377 (y+7), bg white, border 1px `#ecf1f6`, radius 6, opacity 0 (hover only); three 28x28 buttons (padding 4/8, min-h 24; icons 12px `#273951`) separated by 1px x 28 dividers `#ecf1f6`: Refund payment, Send receipt, More actions ("…") |
| Right sticky mask | 8px-wide white spans at x280 and x1377 (sticky edge fills) |
| Whole-row link | absolute `a` 100000px wide per row |

Header labels: `Amount`, `Status`, `Payment method`, `Wallet`, `Date`, `Description`, `Customer name`, `Customer email`, `ID` (aria: `Select all rows`; rows: `Select row pi_...`).
Empty state: none in capture (20 rows populated).

## 7. Footer / pagination

| Item | Measurement |
|---|---|
| Nav bar | 280,674,1105x45 (sticky bottom of viewport); padding 8/0; border-top 1px `#ecf1f6`; bg `#ffffff`; gap 8 |
| Distance from table | sticky; table continues behind (20 rows end y1280) - bar pinned at viewport bottom |
| Previous | 280,683,28x28; padding 4/8; radius 6; bg white; cursor default (disabled); 8px chevron svg at 290,693; color in dump `#273951` (disabled shown via cursor/opacity not captured) |
| Next | 308,683,28x28; same, cursor pointer |
| Gap Previous/Next | 0 (adjacent: 280+28=308) |
| Count text | button 344,683,109.4x28, padding 4/8, radius 6; text "1–20 of 45 results" 12px/16 `#3c4f69` weight 400 (en dash U+2013) |

## 8. Every visible label string (by region)

- Sandbox bar: `Sandbox`, `You're testing in a sandbox. Changes you make here don't affect real customers o...` (truncated in capture), `Switch to live account`
- Sidebar: `Test sandbox`, `Test`, `Home`, `Balances`, `Transactions`, `Customers`, `Product catalog`, `Shortcuts`, `API keys`, `Connect`, `Products`, `Treasury`, `Payments`, `Billing`, `Reporting`, `Apps`, `More`, aria `Pin API keys`, `Pin Connect`, `Manage shortcuts`, `Toggle navigation menu`
- Top bar: `Search` (placeholder), `/`, `Help`, `Notifications`, `Settings`, `Create`, `Setup guide` (25%)
- Page: `Transactions`; buttons `Export`, `Analyze`, `Create payment`
- Tabs: `Payments`, `Payouts`, `Top-ups`, `Standalone 3DS`, `All activity`
- Banner: `Stripe Billing makes it easier and faster for customers to automatically pay you...`, `Start now`, `Close`
- Pills: `All`, `Succeeded`, `Refunded`, `Disputed`, `Failed`, `Uncaptured`, `Blocked`, `More views`, `Filter`, `Table settings`
- Table headers: see section 6; row actions `Refund payment`, `Send receipt`, `More actions`; icon alt `Visa icon`, `Amex icon`, `Mastercard icon`
- Footer: `Previous page`, `Next page`, `1–20 of 45 results`
- Workbench bar: `Developers`, `Inspect`, `Health`, `API activity`, `Event deliveries`, `Open Workbench`, `Show Workbench`

## 9. Vertical rhythm summary (y positions)

| y | Element |
|---|---|
| 0-44 | sandbox bar |
| 44-104 | top bar zone (search row y56-92) |
| 104 | main top; +8 pad +8 margin -> h1 y120-156 |
| 160-196 | tabs, underline y195-197, divider y196 |
| 213-273 | banner (60) |
| 273-305 | 16 gap + 16 pad |
| 305-343 | status pills (38) ; filter button y306-342 |
| 360 | toolbar bottom (55 + 16 pad incl. hairline) = table top |
| 360-400 | table header (40) |
| 400-1280 | 20 rows x 44 |
| 674-719 | sticky footer bar |
| 719-767 | Workbench bar (48) |

## Popover panels (measured)

Source: `stripe-capture-filter-menu.json`, `stripe-capture-table-settings.json`. Both panels are absolute children of node 1355 (portal root), shell = outer div (role=dialog in filter) > panel div.

| Item | Filter menu | Table settings |
|---|---|---|
| Panel rect | 1021,348,320x347 | 1118,346,267x349 |
| Alignment to trigger | right edge 1341 = Filter button right edge (1257+84); top 348 = button bottom 342 + 6 (button ring-gap ~4-6) | right edge 1385 = settings button right edge; top 346 = button bottom 342 + 4 |
| Gap trigger -> panel | 6px | 4px |
| bg / border / radius | `#ffffff` / 1px solid `#d4dee9` / 8px | same |
| box-shadow (exact) | `rgba(0,0,0,0) 0 0 0 0, rgba(0,0,0,0) 0 0 0 1px, rgba(0,0,0,0) 0 0 0 0, rgba(0,0,0,0.12) 0 5px 15px 0, rgba(48,49,61,0.08) 0 15px 35px 0` | same |
| Panel height | 347 (content clipped; items list continues to y~969, so panel is capped ~ viewport-limited and scrolls; no overflow/max-height prop captured: use `max-height: calc(100vh - 72px)` = 695 bottom, overflow-y auto) | 349, inner content 868 tall (clipped the same way, bottom 695) |
| Inner padding | 12px all sides (inner stack 294 wide, gap 12 between title and list) | 8px top/bottom only; sections pad 16px horizontal |
| Title | "Filter": 14/20 weight 600 `#1a2c44`, at x1034,y361 (no divider, no own padding) | "Table settings": 14/20 600 `#1a2c44`; header block padding 4/16/12/16, bottom border 1px `#d4dee9`; text at 1135,359 |
| Dividers | none | 1px `#d4dee9` under title block and under Wrap-cells block (full panel width, no margin) |
| List container | ul 1022,393,318 wide, margin 0 -12px (items bleed to panel edge); no gap between li | n/a |
| Menu item (li) | 303x32 (ul 318, li 303 as captured), padding 6/12, radius 4, inner `a` 279x20 gap 8; text 14/20 400 `#1a2c44`, nowrap; pitch 32 | n/a |
| Hover / focus bg | not captured (use `#f4f7fa`, radius 4 from li) | n/a |
| Item labels (order) | Date and time, Amount, Currency, Status, Payment method, Agentic transactions, Customer ID, Invoice, Decline reason, Email, Card brand, Last 4 digits, Dispute amount, Disputed on, Dispute reason, Evidence due by, Evidence submitted at, Metadata | n/a |
| Wrap cells row | n/a | block 1119,392,250x45: padding 8/16, bottom border 1px `#d4dee9`; row 218x28 padding 4/0; label 14/20 weight 400 `#1a2c44` ("Wrap cells", label is sr-only 8px abs, visible text div 63.7 wide at 1135,404) |
| Switch (off) | n/a | input role=switch 34x18 at 1319,405.1; radius pill; bg `#ecf1f6`; shadow `rgba(16,17,26,0.16) 0 1px 1px 0, #d4dee9 0 0 0 1px`; right-aligned to x1353 (16 pad). Thumb not captured (pseudo-element); use 14px white circle, 2px inset |
| Columns section | n/a | block padding-top 8, 16 horizontal; label "Columns" 12/20 weight 700 `#3c4f69`, at 1135,445 |
| Checkbox row | n/a | row 218x32 (pad 6/0, gap 4), pitch 32; inner padding-left 4; checkbox 14x14 at x1139, radius 4; label 14/20 400 `#1a2c44` at x1153 (8px padding-left) |
| Checkbox checked | n/a | bg `#675dff`, shadow `#675dff 0 0 0 1px, rgba(0,0,0,.12) 0 1px 1px, rgba(48,49,61,.08) 0 2px 5px`; check svg 14x14 overlay (white check, svg color `#1a2c44` token, glyph white). Unchecked: bg `#ffffff`, ring `#d4dee9` (same as table checkbox) |
| Columns labels | n/a | Amount, Status, Payment method, Wallet, Date, Description, Customer name, Customer email, ID (checked, 9) then unchecked: Agent, Billing email, Customer ID, Decline reason, Dispute amount, Dispute reason, Disputed on, Evidence due by, Evidence submitted at, Invoice, Managed Payments, Receipt email, Refunded date |
| Footer | n/a | block 1119,1169,250x38, padding-top 14, 8 horizontal; "Reset to default" button 234x24 (padding 4/8, gap 4, 12/16 600 `#273951`, bg white, ring `#d4dee9`) |

Triggers (open/focus state):
- "Filter" button 1257,306,84x36 and "Table settings" 1349,306,36x36 keep their normal style (white bg, 1px `#ecf1f6` border, radius 8, text/icon `#273951`) plus a focus ring in the capture where each one is the focused/open trigger: `box-shadow: 0 0 0 0 transparent, 0 0 0 1px transparent, 0 0 0 4px rgba(1,150,237,0.36), 0 0 0 0 transparent` (4px `#0196ed` at 0.36 alpha). Border color stays `#ecf1f6`; no color/bg change on open.

## Row hover (measured, stripe-capture-row-hover.json)

| Item | Value |
|---|---|
| Hovered row `tr` background | #f4f7fa (row 44px tall) |
| Row checkbox | 14×14, white bg, radius 4px, ring `0 0 0 1px #d4dee9`, shadow `rgba(0,0,0,.12) 0 1px 1px, rgba(48,49,61,.08) 0 2px 5px` |
| Hover action group (right edge, vertically centred: y+8) | three joined 28×28 icon buttons — aria "Refund payment", "Send receipt", "More actions"; 1px #d4dee9 borders, outer corners radius 6px (left of first, right of last), icon color #273951, padding 4/8 |
| Date tooltip | none in this Stripe version |
