# Design System — Sky Blue & White (Modern Clean)

## 1. Konsep
Tema clean, modern, rounded, dengan dominasi warna sky blue dan white. Kesan profesional namun ringan, cocok untuk dashboard HR yang dipakai sehari-hari.

## 2. Color Tokens (Tailwind v4 + DaisyUI v5 theme)

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: skyhr --default;
}

@plugin "daisyui/theme" {
  name: "skyhr";
  default: true;
  color-scheme: light;

  --color-base-100: oklch(100% 0 0);          /* white */
  --color-base-200: oklch(97% 0.01 230);       /* very light sky */
  --color-base-300: oklch(93% 0.02 230);       /* light sky border */
  --color-base-content: oklch(25% 0.02 240);   /* dark slate text */

  --color-primary: oklch(70% 0.13 230);        /* sky blue */
  --color-primary-content: oklch(100% 0 0);

  --color-secondary: oklch(85% 0.06 220);      /* pale sky */
  --color-secondary-content: oklch(25% 0.02 240);

  --color-accent: oklch(75% 0.15 200);         /* cyan accent */
  --color-accent-content: oklch(100% 0 0);

  --color-neutral: oklch(30% 0.02 240);
  --color-neutral-content: oklch(95% 0 0);

  --color-info: oklch(75% 0.12 230);
  --color-success: oklch(75% 0.15 150);
  --color-warning: oklch(80% 0.15 80);
  --color-error: oklch(65% 0.2 25);

  --radius-box: 1.25rem;     /* rounded cards */
  --radius-field: 0.75rem;   /* rounded inputs/buttons */
  --radius-selector: 0.5rem;

  --border: 1px;
  --depth: 1;
  --noise: 0;
}
```

### Palet Referensi
| Token | Hex kira-kira | Penggunaan |
|---|---|---|
| Primary (Sky Blue) | `#4FA8DB` | Tombol utama, header, highlight |
| Primary Light | `#E6F4FB` | Background section, hover state |
| White | `#FFFFFF` | Background utama, card |
| Slate Text | `#1F2A37` | Teks utama |
| Muted Text | `#6B7A8F` | Teks sekunder/caption |
| Border | `#D9E8F2` | Border card, divider |
| Success | `#34C77B` | Status approved/active |
| Warning | `#F5B544` | Status pending |
| Error | `#EF5A5A` | Status reject/overdue kontrak |

## 3. Tipografi
- **Font utama**: `Plus Jakarta Sans` atau `Inter` (sans-serif modern, rounded letterform)
- **Heading**: semi-bold/bold, ukuran besar dengan letter-spacing sedikit rapat
- **Body**: regular, line-height nyaman (1.6)

```css
--font-sans: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
```

Skala:
- H1: 2rem / bold
- H2: 1.5rem / semibold
- H3: 1.25rem / semibold
- Body: 0.95rem / regular
- Caption: 0.8rem / medium, warna muted

## 4. Shape & Layout
- **Rounded shape konsisten**: card `rounded-2xl`, button `rounded-xl`, input `rounded-lg`, avatar `rounded-full`
- **Spacing**: generous padding (card padding `p-6`), gap antar elemen `gap-4`/`gap-6`
- **Shadow**: soft shadow (`shadow-sm`/`shadow-md`), hindari shadow tajam — beri kesan "floating" lembut
- **Border**: tipis (`border border-base-300`), gunakan warna sky pale, bukan abu-abu gelap

## 5. Komponen Kunci (DaisyUI 5 based)

### Sidebar
- Background white, item aktif berlatar sky-light dengan teks primary, icon rounded
- Logo + nama app di atas, collapsible

### Card / Stat Widget
- `card bg-base-100 shadow-sm rounded-2xl border border-base-300`
- Stat angka besar bold, label kecil muted, icon bulat berwarna primary-light

### Table
- Header sticky, background base-200, rounded di pojok atas
- Row hover: `hover:bg-primary/5`
- Status pakai `badge` rounded-full sesuai warna (success/warning/error/info)

### Button
- Primary: solid sky blue, `rounded-xl`, hover sedikit lebih gelap
- Ghost/secondary: outline sky pale
- Icon button: rounded-full untuk aksi cepat (edit/delete)

### Form/Input
- `input input-bordered rounded-lg`, focus ring sky blue
- Label di atas input, warna muted

### Modal/Drawer
- Rounded-2xl, padding lega, header dengan judul + close icon rounded

### Badge Status
- Active/Approved → success
- Pending → warning
- Expired/Rejected → error
- Info kontrak mendekati habis → warning dengan icon jam

## 6. Iconography
Gunakan icon set rounded/outline (mis. Lucide React) — selaras dengan gaya rounded keseluruhan, ukuran konsisten 18–20px di tabel/list, 24px di header.

## 7. Dark Mode (opsional, fase lanjut)
Jika dibutuhkan, siapkan theme kedua `skyhr-dark` dengan base gelap slate dan primary sky blue tetap sebagai aksen terang.

## 8. Prinsip UX
- Clean & tidak ramai: whitespace cukup, hindari border berlebihan
- Konsistensi rounded di semua elemen interaktif
- Status warna jelas dan mudah dipindai sekilas (scannable)
- Mobile-friendly: sidebar jadi bottom-nav/drawer di layar kecil
