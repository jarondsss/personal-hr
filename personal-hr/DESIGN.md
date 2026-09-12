# Design System — Axiom Dark (Premium)

## 1. Konsep

Dark premium — warm zinc base dengan indigo primary. Referensi visual: Stripe, Notion, Linear.
Kesan professional product, bukan developer-tool. Cocok untuk dashboard HR yang digunakan sehari-hari dengan feel yang modern dan tidak lelah di mata.

---

## 2. Color Tokens

```css
/* Surface Tiers */
--color-background:   #0F0F11;   /* near-black warm */
--color-surface:      #18181B;   /* zinc-900 */
--color-elevated:     #232328;   /* zinc-800 elevated */

/* Borders */
--color-border:       #27272A;   /* zinc-800 */
--color-border-strong:#3F3F46;   /* zinc-700 */

/* Text */
--color-text-primary:   #FAFAFA;   /* near-white */
--color-text-secondary: #A1A1AA;   /* zinc-400 */
--color-text-muted:     #52525B;   /* zinc-600 */

/* Brand — Indigo */
--color-primary:         #6366F1;
--color-primary-hover:   #818CF8;
--color-primary-pressed: #4F46E5;
--color-primary-soft:    rgba(99, 102, 241, 0.10);
--color-primary-border:  rgba(99, 102, 241, 0.30);

/* Signals */
--color-success:  #10B981;
--color-warning:  #F59E0B;
--color-info:     #38BDF8;
--color-danger:   #EF4444;
```

### Palet Referensi
| Token | Hex | Penggunaan |
|---|---|---|
| Background | `#0F0F11` | Background utama |
| Surface | `#18181B` | Card, sidebar, modal |
| Elevated | `#232328` | Hover state, elevated UI |
| Primary (Indigo) | `#6366F1` | CTA, active state, accent |
| Success (Emerald) | `#10B981` | Status approved, positive |
| Warning (Amber) | `#F59E0B` | Status pending, warning |
| Danger (Red) | `#EF4444` | Status rejected, destructive |
| Info (Sky) | `#38BDF8` | Info state, view actions |

---

## 3. Tipografi

- **Font**: `Inter` (variable, via Google Fonts)
- **Font Mono**: `JetBrains Mono` (untuk kode, versi angka)

```css
--font-display: Inter, system-ui, sans-serif;
--font-body:    Inter, system-ui, sans-serif;
--font-mono:    "JetBrains Mono", monospace;
```

### Skala Teks
| Class | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| `.t-headline-lg` | 2rem | 600 | -0.025em | Page titles |
| `.t-headline-md` | 1.375rem | 600 | -0.018em | Section headings |
| `.t-title-md` | 1rem | 600 | -0.01em | Card titles |
| `.t-body-md` | 0.9375rem | 400 | -0.003em | Body text |
| `.t-body-sm` | 0.8125rem | 400 | 0 | Secondary text |
| `.t-label-sm` | 0.6875rem | 600 | 0.07em | Labels, table headers |

---

## 4. Shape & Layout

```css
--radius-xs:   4px;   /* chips, badges */
--radius-sm:   8px;   /* cards, inputs, buttons */
--radius-md:   10px;  /* modals, dropdowns */
--radius-lg:   14px;  /* modal boxes */
--radius-full: 9999px; /* avatars, pills */
```

- **Card padding**: `var(--space-6)` = 24px
- **Gap antar elemen**: `var(--space-4)` = 16px
- **Border**: `1px solid var(--color-border)` — tidak ada 2px border lagi
- **Shadow**: sangat subtle — `0 1px 4px rgba(0,0,0,0.40)` saja

---

## 5. Komponen Kunci

### Page Header Pattern
```jsx
<div className="page-header">
  <div>
    <h1 className="page-title">Page Name</h1>
    <p className="page-subtitle">Subtitle info</p>
  </div>
  <ActionButton />
</div>
```

### Stat Tile
- Top accent bar (2px, warna sesuai tone) menggantikan left-border
- Value: font-display, 2.25rem, bold, tabular-nums
- `data-tone="success|warning|info|danger"`

### Tables
- Tidak ada `table-zebra` — hover effect: `rgba(255,255,255,0.02)`
- Header: `.t-label-sm` style — uppercase, 0.6875rem, zinc-600
- Status: `.chip` component dengan `data-tone`

### Chips / Status Badge
```jsx
<span className="chip" data-tone="success|warning|info|danger|neutral">
  STATUS
</span>
```
- Uppercase, 0.6875rem, filled soft background + border

### Modals
```jsx
<div style={{ position: "fixed", inset: 0, backdropFilter: "blur(4px)", backgroundColor: "rgba(9,9,11,0.75)" }}>
  <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-lg)", boxShadow: "0 24px 60px rgba(0,0,0,0.70)" }}>
    ...
  </div>
</div>
```
- Tidak menggunakan DaisyUI `.modal` — custom implementation untuk full control

### Tabs (`.halo-tabs` + `.halo-tab`)
- Container: `background: var(--color-elevated)`, `border: 1px solid var(--color-border)`, `padding: 3px`, `border-radius: var(--radius-sm)`
- Active tab: `background: var(--color-surface)`, `box-shadow: var(--shadow-xs)`

### Sidebar Nav (`.side-nav-link`)
- Font: Inter (bukan mono) — product feel
- Active: `background: var(--color-primary-soft)`, `border: 1px solid var(--color-primary-border)`
- Icon aktif: `color: var(--color-primary-hover)`

---

## 6. Motion

```css
--motion-fast: 100ms;
--motion-base: 160ms;
--easing-standard: cubic-bezier(0.16, 1, 0.3, 1);
```

Prinsip: transisi cepat dan subtle. Tidak ada animasi yang mengganggu workflow operasional.

---

## 7. Action Buttons in Tables

Ganti class-based buttons dengan inline style approach:
- View: `color: var(--color-info)`, hover: `background: var(--color-info-soft)`
- Edit: `color: var(--color-warning)`, hover: `background: var(--color-warning-soft)`
- Delete: `color: var(--color-danger)`, hover: `background: var(--color-danger-soft)`

---

## 8. Prinsip UX

- **Whitespace generous** tapi efisien — tidak padding yang sia-sia
- **Status selalu visible** via chip component yang consistent
- **No zebra stripes** — hover row yang subtle lebih elegant
- **Form labels**: selalu di atas input, `.label-text` class
- **Mobile**: sidebar collapsible via drawer, mobile header sticky
- **Accessibility**: focus rings via `--focus-ring` token, `prefers-reduced-motion` supported
