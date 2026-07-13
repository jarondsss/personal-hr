# Project Scope — Personal HR WebApp

## 1. Ringkasan Proyek
Aplikasi HR internal (personal use) untuk mengelola data karyawan, proyek, cuti, lembur, payroll, SOP, dan generator dokumen kontrak/surat kerja. Dibangun sebagai fullstack monolith.

## 2. Tech Stack
- **Framework**: Next.js (App Router, fullstack — Server Actions/Route Handlers)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **Database**: PostgreSQL (rekomendasi) + Prisma ORM
- **Auth**: NextAuth.js / Auth.js (credential-based, role: Admin/HR, Employee)
- **File Storage**: lokal/S3-compatible (untuk upload template docs & slip)
- **Document Generation**: docx-templater / mammoth (placeholder `[...]` replace) → render ke `.docx`/PDF
- **Form & Validasi**: React Hook Form + Zod
- **State/data fetching**: TanStack Query
- **Notifikasi**: Cron job (Vercel Cron / node-cron) untuk reminder kontrak

## 3. Role & Akses
| Role | Akses |
|---|---|
| Admin/HR | Full akses semua modul, generate dokumen, approve leave/overtime, kelola payroll |
| Employee | Akses terbatas: lihat profil sendiri, ajukan leave, lihat slip gaji sendiri, lihat SOP |

## 4. Modul

### 4.1 Modul Employee
**Data field**: Nama Lengkap, Email, No HP, No HP 2, Discord ID, GitHub Username, Jabatan, Status (Fulltime/Intern/Part Time), Role, Project 1, Project 2, Gaji, Tipe Gaji (Gross/Nett), Mulai Kontrak, Akhir Kontrak, Join Date Perusahaan, Alamat.
**Fitur**: CRUD karyawan, filter/search, detail profil, riwayat kontrak.

### 4.2 Modul Project
**Data field**: Nama Client, Nama Project, Status Project (Outsource/Whitelabel/Product), Team (relasi ke Employee), Employee Join Date (per-project).
**Fitur**: CRUD project, assign/remove team member, lihat timeline keterlibatan karyawan.

### 4.3 Modul Leave Management
**Data**: History Leave Request (tanggal, jenis cuti, alasan, status approve/reject), Kuota Leave per Employee.
**Fitur**: Ajukan cuti (employee), approve/reject (HR), tracking sisa kuota otomatis berkurang saat approved.

### 4.4 Modul Overtime Management
**Data**: History overtime per project, jam mulai-selesai, perhitungan jam (hour calculation).
**Fitur**: Input overtime, kalkulasi otomatis total jam & estimasi nilai lembur, rekap per project/employee.

### 4.5 Modul Payroll
**Data**: Salary, PPh 21, pro-rate (untuk karyawan baru/resign di tengah bulan), Slip Salary, Slip Overtime.
**Fitur**: Generate slip gaji bulanan (PDF), kalkulasi PPh 21 sederhana, kalkulasi pro-rate otomatis berdasarkan join/akhir kontrak, export slip overtime.

### 4.6 Modul SOP Information
**Fitur**: Halaman informasi SOP perusahaan untuk dibaca employee, kategori SOP, kemungkinan versi/last updated.

### 4.7 Modul Document Generator
**Fitur**: Upload template (.docx) dengan placeholder `[...]` (mis. `[Nama]`, `[Jabatan]`, `[Gaji]`), pilih jenis dokumen (Kontrak Fulltime/Part Time/Intern, Surat Keterangan Kerja), sistem otomatis isi placeholder dari data Employee, generate & download hasil docx/PDF.

### 4.8 Fitur Reminder Kontrak
Widget dashboard yang mengecek `akhir kontrak` employee mendekati (mis. H-30/H-14/H-7), tampilkan notifikasi in-app untuk Admin/HR.

## 5. Struktur Database (high-level)
- `Employee`
- `Project`
- `ProjectMember` (pivot Employee ↔ Project + join date)
- `LeaveRequest`, `LeaveQuota`
- `Overtime`
- `Payroll`, `PayrollSlip`
- `SOP`
- `DocumentTemplate`, `GeneratedDocument`
- `User` (auth, terhubung ke Employee/role)


## 6. Non-Functional Requirements
- Responsive (desktop-first, mobile friendly)
- Role-based access control di setiap route/server action
- Audit-friendly: timestamp createdAt/updatedAt di semua tabel
- Personal use → tidak perlu multi-tenant, tapi tetap proteksi auth

## 7. Fase Pengembangan (Saran)
1. Setup project, auth, layout, design system
2. Modul Employee + Project
3. Modul Leave + Overtime
4. Modul Payroll + Slip generator
5. Modul SOP
6. Document Generator + Reminder Kontrak
7. Polish UI/UX, testing
