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

## Keamanan Database (WAJIB dibaca sebelum migrasi)

Aplikasi ini **tidak** memakai Supabase Auth/PostgREST/supabase-js. Semua query lewat Prisma
dengan role `postgres` (BYPASSRLS). Supabase secara default memberi grant `ALL` ke role
`anon`/`authenticated` untuk setiap tabel di schema `public`, jadi tanpa RLS semua data HR
bisa dibaca/diubah lewat `anon key` yang bersifat publik.

### Kondisi sekarang
- Semua tabel aplikasi ada di schema **`private`** (bukan `public`). PostgREST hanya
  expose `public`, jadi nama tabel dan datanya **tidak terlihat** dari API publik —
  balasan untuk `anon` adalah `42P01 relation does not exist`, bukan sekadar `permission denied`.
- Semua tabel punya **RLS enabled tanpa policy** (default deny) + grant `anon`/`authenticated` dicabut.
- `schema.prisma` memakai preview feature `multiSchema`; setiap model wajib punya `@@schema("private")`.
- Raw SQL wajib di-schema-qualify: `SELECT * FROM "private"."Employee"`, bukan `FROM "Employee"`.

### Aturan
1. Model baru di `schema.prisma` **wajib** ditulis dengan `@@schema("private")`.
2. Setiap selesai `prisma db push` / `prisma migrate`, **wajib** jalankan:
   ```bash
   npm run db:lockdown
   ```
   (file: `prisma/rls-lockdown.sql` — meng-enable RLS, mencabut grant `anon`/`authenticated`,
   dan mengatur `ALTER DEFAULT PRIVILEGES` supaya tabel baru tidak otomatis terbuka lagi).
3. Verifikasi dengan `npm run db:check` — semua baris harus `PASS`.
4. Sebelum migrasi berisiko, backup dulu: `npm run db:backup` (dump JSON ke `prisma/backups/`).
5. Jangan pernah membuat policy `USING (true)` di schema `public`/`private`. Kalau butuh
   akses dari client via Supabase API, tetap di schema `private` dan tulis policy spesifik.
6. `service_role` key hanya boleh dipakai di server. Tidak pernah masuk `NEXT_PUBLIC_*`.
7. Rate limit login ada di `src/lib/rate-limit.ts` dengan **escalating backoff**:
   - Per akun: 5 gagal → 15 menit, 10 gagal → 1 jam, 20 gagal → 24 jam.
   - Per IP: 20 gagal → 15 menit, 50 gagal → 1 jam, 100 gagal → 24 jam.
   - Hitungan gagal = kegagalan **sejak login sukses terakhir** ( jadi sukses me-reset
     ladder), failure lama > 30 hari di-decrement, dan aturan IP memakai jendela 24 jam.
   - Lock di-anchor ke kegagalan **terbaru**, jadi setiap kegagalan baru mendorong
     waktu unlock lebih jauh.
   - Baris `LoginAttempt` tidak dihapus saat sukses — itu audit trail. Counter yang
     di-reset, bukan datanya.
   - Ubah angka batasnya di `src/lib/rate-limit.ts`, lalu `npm run test:auth`.

### Endpoint login
- `src/app/login/actions.ts` adalah server action tipis: ambil email/password/IP dari request,
  panggil `authenticate()` dari `src/lib/auth/authenticate.ts`, lalu buat session + redirect.
- `authenticate()` **tidak boleh** memakai API request Next.js (`headers()`, `cookies()`)
  supaya tetap bisa di-unit-test. Semua logika auth harus di situ.
- Kalau email tidak terdaftar, `bcrypt.compare` tetap dijalankan terhadap hash palsu
  (`DUMMY_HASH`) supaya response time tidak membocorkan email mana yang terdaftar.
- Test: `npm run test:auth` (membuat user sementara, membersihkannya di akhir).

### Session, proxy & revocation
- `src/proxy.ts` (bukan `middleware.ts` — Next 16 sudah rename, `middleware` deprecated)
  yang mengecek session sebelum route dilayani.
- Semua crypto session ada di `src/lib/auth/token.ts` (**tanpa** import `next/headers`),
  supaya bisa dipakai di `proxy.ts`. `src/lib/session.ts` hanya thinly wrap `cookies()`.
- `jose`! Penting: `setExpirationTime()` dengan **angka** dibaca sebagai NumericDate absolut
  (detik sejak epoch) → token langsung expired. Selalu pakai `Date` atau string durasi.
- Session TTL **1 hari** dengan sliding refresh: tiap request yang sah memperpanjang cookie.
  Aktif = selalu login, idle > 1 hari = harus login lagi.
- **Revocation**: kolom `User.sessionVersion`. Token membawa `sv`; `getVerifiedSession()`
  membandingkannya dengan nilai di DB. Kalau beda → session dianggap dicabut.
  `revokeUserSessions(userId)` (tombol "Logout" di Master Data → User Accounts)
  menaikkan `sessionVersion` → semua device user itu langsung logout.
- `getSession()` (tanpa verifikasi DB) **jangan** dipakai untuk authorization.
  Pakai `getVerifiedSession()` / `getRequiredAdminSession()`.
- `proxy.ts` **tidak** mencakup `/api/*` (matcher-nya mengecualikan `api`), jadi setiap route
  handler wajib cek session + role sendiri. Jangan andalkan proxy untuk otorisasi API.

### Test commands
```bash
npm run test:auth      # logika auth + rate limit (butuh DB, tanpa server)
npm run test:session   # proxy + cookie (butuh server jalan di BASE_URL)
npm run test:e2e       # login form beneran -> cookie -> dashboard (butuh server jalan)
```
Untuk dua yang terakhir: `npm run build` lalu `npx next start -p 3113` di terminal lain,
lalu `BASE_URL=http://localhost:3113 npm run test:session`.

## Pipeline Database (WAJIB)

`npm run build` = `prisma generate` → **apply schema + lockdown + verifikasi** → `next build`.
Scriptnya `scripts/deploy-schema.js`:

1. `prisma db push` — sync schema. Kalau butuh drop kolom/tabel → **gagal**, build dibatalkan
   (data nggak dibrak diam-diam).
2. `prisma db execute --file prisma/rls-lockdown.sql` — RLS + revoke grant diulang.
3. `node prisma/rls-check.js` — verifikasi. Kalau ada yang nggak aman → build gagal.

Artinya: **lu nggak bisa lupa jalanin `db:lockdown`** lagi, karena otomatis. Dan kode yang
butuh schema baru nggak akan pernah jalan di database yang belum punya schema itu.

- Build Vercel **Preview/Development** di-skip (`VERCEL_ENV`), biar preview build nggak
  ngedump Production DB. Hanya `VERCEL_ENV=production` yang apply.
- `SKIP_SCHEMA=1 npm run build` untuk build offline / tanpa akses DB.
- Credential cuma lewat environment, **nggak pernah** di command line (biar nggak bocor ke log).
- Manual: `npm run db:push` lalu `npm run db:lockdown` lalu `npm run db:check`.
- Kalau deploy gagal dengan error "database is already in sync"/lock conflict (dua build
  jalan barengan), ulangi deploy-nya.

### Index & Performance Advisor
- `npm run db:index-report` — ngecek FK yang nggak punya index di kolom pertama, plus
  statistik scan per index. Jalankan setelah menambah kolom/relasi.
- Supabase Performance Advisor nge-flag **"Unindexed foreign keys"** kalau kolom FK
  nggak punya index yang kolom itu jadi kolom **pertama**. Relasi `required` biasanya
  udah dapet index dari Prisma, tapi kolom kedua dari `@@unique([a, b])` **nggak** —
  itu yang paling sering kena flag.
- Saran **"Unused Index"** di app iniBiasanya false positive: `idx_scan = 0` karena
  tabelnya masih 0–48 baris, jadi Postgres milih seq scan. **Jangan** drop index
  itu — begitu data nambah, index itu yang nyelametin. Hapus cuma kalau query-nya
  emang nggak pernah pakai kolom itu.

## Larangan
- Jangan gunakan `tailwind.config.js` versi lama — Tailwind v4 pakai CSS-based config.
- Jangan simpan password/secret di kode atau commit.
- Jangan buat logic kalkulasi gaji/pajak langsung di komponen React — pisahkan ke `/lib/utils` agar testable.
- Jangan bikin file session baru dengan fallback secret hardcoded — cukup pakai `src/lib/session.ts`.
