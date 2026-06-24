# Revisi Landing Page MasterMove — Permintaan Client

## Context
Client meminta 2 revisi pada landing page MasterMove:
1. Hapus card layanan "Pengurusan Bea Cukai" dari halaman Services
2. Ganti paragraf pertama di halaman About dengan teks baru dari client

## Changes

### 1. ServicesSection (`/home/jajang/mastermove-landing/sections/ServicesSection.tsx`)

**Hapus dari array `services` (line 24-31):**
```ts
{
  icon: DollarSign,
  title: "Customs Clearance",
  subtitle: "Pengurusan Bea Cukai",
  description: "Pengurusan dokumen dan kepabeanan ekspor-impor secara lancar dan sesuai regulasi.",
  featured: false,
},
```

**Hapus Card 2 JSX (line 146-166):** — block `motion.div` yang render card "Pengurusan Bea Cukai"

**Hapus unused import:** `DollarSign` dari lucide-react (line 11)

**Adjust animation delays:** Card 3-8 delay perlu di-shift down 0.1s masing-masing (0.3→0.2, 0.4→0.3, dst) biar tetep sequential tanpa gap.

### 2. AboutSection (`/home/jajang/mastermove-landing/sections/AboutSection.tsx`)

**Ganti paragraf pertama (line 32-37)** dengan:
> "Mastermove adalah perusahaan jasa pengurusan transportasi (JPT) yang melayani pengiriman barang ke seluruh Indonesia melalui jalur darat, laut, udara, serta transportasi multimoda yang terintegrasi."

**Ganti paragraf kedua (line 38-43)** dengan:
> "Kami hadir sebagai solusi logistik modern yang mengutamakan kecepatan, keandalan, dan efisiensi, dengan didukung oleh jaringan nasional dan internasional, termasuk maskapai penerbangan, pelayaran, vendor trucking, hingga mitra pergudangan."

## Verification
- `npm run build` harus pass tanpa error
- Cek visual: Services section tampil 7 card (bukan 8), grid layout tetep rapi
- Cek visual: About section paragraf pertama & kedua sesuai teks baru client
- Pastikan DollarSign import sudah dihapus (no unused imports)
