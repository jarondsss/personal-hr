# AGENT.md — Panduan untuk Coding Agent

## Konteks Proyek
Aplikasi HR internal (personal use) bernama **HR WebApp**, fullstack Next.js, dipakai oleh Admin/HR dan Employee untuk mengelola data karyawan, project, cuti, lembur, payroll, SOP, dan generate dokumen kontrak.

Rujuk `PROJECT_SCOPE.md` untuk detail modul & data field, dan `DESIGN.md` untuk aturan visual/tema sebelum membangun UI apapun.

## Tech Stack Wajib
- Next.js (App Router) — fullstack, gunakan Server Actions/Route Handlers untuk backend logic
- TypeScript strict mode
- Tailwind CSS v4 (config via CSS `@theme`/`@plugin`, bukan `tailwind.config.js` lama)
- DaisyUI v5 sebagai component plugin di atas Tailwind v4
- Prisma ORM + PostgreSQL
- Auth.js (NextAuth) untuk autentikasi & role-based access
- React Hook Form + Zod untuk semua form & validasi
- TanStack Query untuk client-side data fetching/caching
- Lucide React untuk icon

## Aturan Umum
1. **Selalu cek `DESIGN.md`** sebelum membuat komponen UI baru — gunakan token warna, radius, dan tipografi yang sudah didefinisikan, jangan hardcode warna lain.
2. **Konsisten rounded shape**: card `rounded-2xl`, button `rounded-xl`, input `rounded-lg`.
3. **Role-based access**: setiap server action/route handler harus cek role (`ADMIN_HR` vs `EMPLOYEE`) sebelum eksekusi.
4. **Validasi server-side wajib** menggunakan Zod schema, jangan percaya validasi client saja.
5. **Penamaan**: gunakan bahasa Inggris untuk nama variabel/field di kode, boleh bahasa Indonesia untuk label UI yang tampil ke user (karena dipakai internal).
6. **Setiap tabel database** punya `createdAt`, `updatedAt`, dan (jika relevan) `createdBy`.
7. **File upload** (template docs, foto, dsb) disimpan dengan path terstruktur, validasi tipe file & ukuran.

## Struktur Folder yang Disarankan
```
/app
  /(auth)/login
  /(dashboard)
    /employees
    /projects
    /leave
    /overtime
    /payroll
    /sop
    /documents
  /api (jika perlu route handler terpisah dari server actions)
/components
  /ui (komponen generic: Card, Badge, Table, Modal, dst — mengikuti DESIGN.md)
  /modules (komponen spesifik per modul)
/lib
  /actions (server actions per modul)
  /validations (zod schemas)
  /prisma (client + helpers)
  /utils
/prisma
  schema.prisma
```

## Panduan Per Modul (ringkas — detail lihat PROJECT_SCOPE.md)

### Employee
- CRUD lengkap, field sesuai scope. Validasi email unik, nomor HP format Indonesia.
- Status & tipe gaji pakai enum, bukan free text.

### Project
- Relasi many-to-many ke Employee via tabel pivot `ProjectMember` (simpan join date per anggota).
- Status project pakai enum: `OUTSOURCE | WHITELABEL | PRODUCT`.

### Leave Management
- Saat request di-approve, otomatis kurangi `LeaveQuota.remaining`.
- Cegah pengajuan jika kuota tidak cukup (validasi server-side).

### Overtime
- Hitung total jam otomatis dari `startTime`–`endTime` (handle lintas hari jika perlu).
- Agregasi per project & per employee untuk laporan.

### Payroll
- Pro-rate dihitung dari `joinDate`/`endContract` relatif terhadap periode payroll.
- PPh 21: buat fungsi kalkulasi terpisah & mudah diaudit (bukan hardcode di komponen UI).
- Slip gaji & slip overtime di-generate sebagai PDF (gunakan library seperti `@react-pdf/renderer` atau render HTML → PDF).

### SOP
- CRUD sederhana, kategori + rich text content (gunakan editor ringan, mis. Tiptap).

### Document Generator
- Parse file `.docx` yang diupload, cari placeholder format `[NamaField]`.
- Mapping placeholder ke data Employee (mis. `[Nama]` → `employee.fullName`).
- Generate ulang `.docx` (gunakan `docxtemplater` + `pizzip`) dengan data ter-replace, simpan sebagai `GeneratedDocument`.
- Sediakan preview sebelum download final.

### Reminder Kontrak
- Widget dashboard server component mengecek `endContract` employee.
- Threshold reminder: H-30, H-14, H-7 (boleh dikonfigurasi).
- Ditampilkan on-demand saat load halaman dashboard, tidak perlu tabel log.

## Checklist Sebelum Submit Kode
- [ ] Sudah cek role/permission di server action
- [ ] Sudah validasi input dengan Zod
- [ ] UI mengikuti token warna & radius dari DESIGN.md
- [ ] Tidak ada hardcoded credentials/secrets
- [ ] Komponen reusable ditaruh di `/components/ui`, bukan duplikasi
- [ ] Query Prisma efisien (hindari N+1, gunakan `include`/`select` secukupnya)

## Larangan
- Jangan gunakan `tailwind.config.js` versi lama — Tailwind v4 pakai CSS-based config.
- Jangan simpan password/secret di kode atau commit.
- Jangan buat logic kalkulasi gaji/pajak langsung di komponen React — pisahkan ke `/lib/utils` agar testable.
