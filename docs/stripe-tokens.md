# Design tokens

Source of truth: `app/globals.css` (`@theme`). Current values are provisional; the "Measured" column is filled in during the fidelity pass.

| Token | Current value | Measured |
| --- | --- | --- |
| `--color-text-primary` | `#353a44` | #1a2c44 (default text, h1, active tab) |
| `--color-text-secondary` | `#596171` | #3c4f69 (th text, inactive tabs, currency code, ID chip, banner/footer text) |
| `--color-text-muted` | `#687385` | #50617a ("Uncaptured" badge text; muted icons) |
| `--color-border` | `#d8dee4` | #d4dee9 (button ring, tab-bar bottom, checkbox ring, popover border) |
| `--color-border-row` | `#ebeef1` | #ecf1f6 (row/header hairlines, pill/chip borders) |
| `--color-surface` | `#ffffff` | #ffffff |
| `--color-brand` | `#635bff` | kept #635bff (PDF); live is #533afd (controller ruling) |
| `--color-brand-hover` | `#5851e0` | no hover state measured; kept |
| `--color-on-brand` | `#ffffff` | white |
| `--color-brand-ring` | `rgb(99 91 255 / 0.4)` | removed (replaced by `--shadow-focus`) |
| `--color-bg-hover` | `#f5f6f8` | #f4f7fa (row hover bg, menu item hover) |
| `--color-badge-success-bg` | `#d1fab3` | #eafcdd (Succeeded badge bg (border #a8f170, text #217005)) |
| `--color-badge-success-fg` | `#217005` | #217005 |
| `--color-badge-danger-bg` | `#ffe7f2` | not in live capture; PDF-only (kept, border added) |
| `--color-badge-danger-fg` | `#b3093c` | not in live capture; kept |
| `--color-badge-neutral-bg` | `#ebeef1` | #f4f7fa (Uncaptured badge bg (border #d4dee9)) |
| `--color-badge-neutral-fg` | `#545969` | #50617a (Uncaptured badge text) |
| `--color-badge-warning-bg` | `#fcedb9` | not in live capture; unused |
| `--color-badge-warning-fg` | `#a82c00` | not in live capture; unused |
| `--radius-sm` | `4px` | 4px (checkbox, badge, th sort button) |
| `--radius-md` | `6px` | 6px (buttons, ID chip, tooltip, action group) |
| `--radius-lg` | `8px` | 8px (pills, status cards, popover, banner, search) |
| `--shadow-button` | `0 1px 1px rgb(0 0 0 / 0.08)` | removed (buttons use `--shadow-ring` (0 0 0 1px #d4dee9)) |
| `--shadow-popover` | `0 7px 14px rgb(48 49 61 / 0.08), 0 3px 6px rgb(0 0 0 / 0.12)` | 0 5px 15px rgba(0,0,0,.12), 0 15px 35px rgba(48,49,61,.08) (+ transparent ring layers) (filter/table-settings panel) |
| `--text-base` / line-height | `14px` / `20px` | 14px/20px, color #1a2c44 |
| `--text-xs` / line-height | `12px` / `16px` | 12px; th uses 20px line-height, badges/footer 16px |
| `--text-table` / line-height | `14px` / `20px` | table body cells 14px/20px (th 12px/20px via caption size) |
| `--size-control-sm` | `24px` | footer/row "..." button box |
| `--size-control-md` | `28px` | 28px (button height) |
| `--size-checkbox` | `14px` | 14px (checkbox) |
| `--color-mark-link` | `#00d66f` | placeholder Link chip (no open-license Link mark exists) |
| `--text-mark` / line-height | `8px` / `10px` | brand/wallet chip text |
| `--color-bg-subtle` | `#f6f8fa` | #f4f7fa (banner bg) |
| `--space-page-x` | `40px` | page horizontal padding |
| `--space-page-top` | `24px` | 16px (top bar bottom to title top) |
| `--size-topbar` | `56px` | 60px (top bar zone (search row 36px)) |
| `--text-h1` / line-height | `28px` / `36px` | page title |
| `--size-search-max` | `360px` | top bar search max width |
| `--space-section` | `16px` | vertical gap between page sections |
| `--space-page-bottom` | `24px` | page bottom padding |
| `--text-caption` / line-height | `12px` / `16px` | small labels (chips) |
| `--color-badge-success-border` | `#a8f170` | Succeeded badge border (new) |
| `--color-badge-danger-border` | `#ffc2dc` | derived (not measured), matches danger bg family |
| `--color-badge-neutral-border` | `#d4dee9` | Uncaptured badge border (new) |
| `--color-brand-subtle` | `#675dff` | banner close icon (new) |
| `--color-control` | `#273951` | button text/icons, row action icons (new) |
| `--shadow-ring` | `0 0 0 1px #d4dee9` | button ring (new) |
| `--shadow-checkbox` | `0 0 0 1px #d4dee9, 0 1px 1px rgba(0,0,0,.12), 0 2px 5px rgba(48,49,61,.08)` | checkbox (new) |
| `--shadow-checkbox-checked` | same with brand ring | checked checkbox (new) |
| `--shadow-focus` | `0 0 0 4px rgba(1,150,237,.36)` | focus ring everywhere (new, global `:focus-visible`) |
| `--font-sans` | system stack | measured root stack (new) |
| `--font-mono` | `"Source Code Pro", Menlo, Monaco, monospace` | ID chip (new) |
| `--size-sidebar` | `240px` | 240px (left sidebar width) |
| `--size-nav-item` | `30px` | 30px (sidebar item height) |
| `--space-sidebar-x` | `20px` | 20px (sidebar content padding) |
| `--space-sidebar-gap` | `28px` | 28px (gap between nav sections) |
| `--color-sidebar-border` | `#ecf1f6` | #ecf1f6 (sidebar right divider) |
| `--color-sidebar-active-bg` | `#f4f7fa` | subtle active nav bg (PDF shows tint) |
| `--color-sidebar-avatar-bg` | `#635bff` | brand tile for demo account avatar |
| `--color-scrim` | `rgb(26 44 68 / 0.4)` | mobile drawer backdrop |
| `--size-topbar-btn` | `28px` | top bar icon button |
| `--size-create-btn` | `24px` | round brand "+" button |
| `--color-mark-apple` / `-fg` | `#000` / `#fff` | Apple Pay chip (black, white glyph) |
