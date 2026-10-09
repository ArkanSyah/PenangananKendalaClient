# Dokumentasi Arsitektur & Spesifikasi API Backend

Sistem Penanganan Kendala Client dibangun menggunakan **Laravel 11**, **MySQL/MariaDB**, dan **Laravel Sanctum** untuk autentikasi berbasis Bearer Token.

---

## 1. Konvensi & Standar API

- **Base URL**: `http://localhost:8000/api`
- **Format Pertukaran Data**: `application/json`
- **Header Standar**:
  ```http
  Accept: application/json
  Content-Type: application/json
  Authorization: Bearer <access_token>
  ```
- **Standar Kode Respon HTTP**:
  - `200 OK`: Permintaan berhasil diproses.
  - `201 Created`: Data baru berhasil dibuat di database.
  - `401 Unauthorized`: Token otentikasi tidak valid atau belum login.
  - `403 Forbidden`: Pengguna tidak memiliki hak akses (RBAC violation).
  - `404 Not Found`: Tiket atau data yang diminta tidak ditemukan.
  - `422 Unprocessable Content`: Validasi input data gagal.

---

## 2. Matriks Hak Akses (RBAC Matrix)

| Modul / Fitur | Client | Service Desk | Project Manager | Programmer | Owner | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Buat Tiket Sendiri | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Buat Tiket Klien / Walk-in | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Konfirmasi / Tolak Tiket Baru | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Eskalasi Tiket ke PM | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Tiket ke Programmer | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Rilis Tiket ke Pool Claim | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve / Reject Claim Programmer | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Claim Tiket dari Pool | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Update Status & Progress Log Tiket | ❌ | ❌ | ❌ | ✅ (milik sendiri) | ❌ | ❌ |
| Review Solusi Programmer (OK / NOT OK) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Eskalasi Masalah ke Owner | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Keputusan Isu Eskalasi Owner | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Kanban Board Drag & Drop | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manajemen Pengguna (CRUD & Toggle Active) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit Trail & Log Aktivitas Sistem | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Pengaturan Preferensi Notifikasi & In-App | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Diagram Alur Status Tiket (State Machine)

```
[Client Submit]
       │
       ▼
pending_confirmation ──(SD Reject)──► rejected
       │
   (SD Confirm)
       ▼
      open ──(SD Self-Resolve)──► closed
       │
   (SD Escalate)
       ▼
escalated_to_pm ──(PM Direct Assign)──┐
       │                              │
(PM Release to Pool)                  │
       ▼                              │
waiting_programmer                    │
       │                              │
(Programmer Claim)                    │
       ▼                              │
waiting_pm_approval                   │
       │                              │
  (PM Approve)                        │
       ▼                              ▼
    assigned ◄────────────────────────┘
       │
(Programmer Start)
       ▼
  in_progress ◄─────────────────┐
       │                        │
(Programmer Finish)             │
       ▼                        │
 pending_review ──(PM Not OK)───┘
       │
   (PM OK)
       ▼
   resolved ──(SD / Client Verify)──► closed

* Catatan Eskalasi Khusus:
escalated_to_pm ──(PM Escalate)──► escalated_to_owner ──(Owner Approve)──► escalated_to_pm
```

---

## 4. Rincian Endpoint API

### A. Autentikasi & Akun
- `POST /api/login` — Login pengguna (email, password).
- `POST /api/logout` — Logout dan hapus token aktif.
- `GET /api/me` — Ambil data profil pengguna yang sedang login.
- `PUT /api/profile` — Update nama & email pengguna.
- `PUT /api/profile/password` — Ganti password pengguna.
- `POST /api/forgot-password` — Pengiriman token reset password ke email.
- `POST /api/reset-password` — Reset password via token.

### B. Tiket Klien (`role: client`)
- `GET /api/client/tickets` — Daftar tiket milik klien yang login.
- `POST /api/client/tickets` — Pembuatan tiket kendala baru.
- `GET /api/client/tickets/{id}` — Detail tiket klien (hanya log publik).

### C. Tiket Service Desk (`role: service_desk`)
- `POST /api/tickets` — Buat tiket baru oleh Service Desk.
- `POST /api/tickets/walk-in` — Buat tiket atas nama pelapor non-terdaftar (walk-in).
- `POST /api/tickets/{id}/confirm` — Konfirmasi tiket baru dari status `pending_confirmation` ke `open`.
- `POST /api/tickets/{id}/escalate` — Eskalasikan tiket ke Project Manager (`escalated_to_pm`).

### D. Tiket Project Manager (`role: project_manager`)
- `POST /api/tickets/{id}/assign` — Tugaskan tiket langsung ke programmer tertentu.
- `POST /api/tickets/{id}/release-for-claim` — Rilis tiket ke status `waiting_programmer`.
- `GET /api/tickets/pending-claims` — Daftar tiket yang sedang menunggu persetujuan claim PM.
- `POST /api/tickets/{id}/approve-claim` — Setujui pengajuan claim programmer.
- `POST /api/tickets/{id}/reject-claim` — Tolak pengajuan claim programmer.
- `POST /api/tickets/{id}/pm-review` — Keputusan review hasil kerja (`ok` / `not_ok`).
- `POST /api/tickets/{id}/escalate-owner` — Eskalasi masalah ke Owner.
- `GET /api/programmers` — Ambil daftar programmer yang tersedia untuk penugasan.

### E. Tiket Programmer (`role: programmer`)
- `GET /api/tickets/available` — Ambil daftar tiket yang tersedia di pool untuk di-claim.
- `POST /api/tickets/{id}/claim` — Ajukan claim terhadap tiket yang tersedia.
- `POST /api/tickets/{id}/status` — Perbarui status tiket yang ditugaskan ke dirinya.
- `POST /api/tickets/{id}/logs` — Tambahkan catatan progres pekerjaan (internal / publik).

### F. Owner Decision (`role: owner`)
- `POST /api/tickets/{id}/owner-decision` — Keputusan owner atas tiket yang dieskalasi (`approved`, `resolved`, `rejected`).

### G. Kanban Board Monitoring (`role: owner, admin`)
- `PATCH /api/board/move` — Update status tiket secara visual dari drag-and-drop board.

### H. Modul Notifikasi & Preferensi
- `GET /api/notification/preferences` — Ambil preferensi notifikasi pengguna.
- `PUT /api/notification/preferences` — Update preferensi (email, in-app, digest_mode, quiet_hours).
- `GET /api/notifications/in-app` — Daftar notifikasi in-app untuk pengguna (dengan unread count).
- `POST /api/notifications/in-app/{id}/read` — Tandai notifikasi telah dibaca.
- `GET /api/admin/quota` — Pemantauan kuota pengiriman notifikasi oleh admin.

### I. Modul Admin RBAC (`role: admin`)
- `GET /api/admin/users` — Daftar seluruh pengguna sistem.
- `POST /api/admin/users` — Tambah akun pengguna baru dengan role spesifik.
- `PUT /api/admin/users/{id}` — Edit data pengguna.
- `PATCH /api/admin/users/{id}/toggle-active` — Nonaktifkan / aktifkan kembali akun pengguna.
- `POST /api/admin/users/{id}/reset-password` — Reset password paksa oleh administrator.
- `GET /api/admin/stats` — Statistik ringkasan sistem (total user, tiket aktif).
- `GET /api/admin/activity-logs` — Audit trail seluruh tindakan administratif.

### J. Modul PWA & Web Push (Terbuka & Terproteksi)
- `GET /api/health` — Status kesehatan API, koneksi database, dan kesiapan PWA.
- `GET /api/vapid-public-key` — Mengambil Public VAPID key untuk browser subscription.
- `POST /api/push-subscriptions` — Mendaftarkan endpoint Web Push browser pengguna.
- `POST /api/send-test-push` — Memicu pengiriman notifikasi uji coba ke perangkat.

---

## 5. Ringkasan Pengujian Backend (PHPUnit Test Suites)

Total: **44 Test Cases**, **153 Assertions** (100% Passed)

| File Test | Cakupan Uji |
| :--- | :--- |
| `tests/Feature/AuthTest.php` | Login aktif, penolakan akun non-aktif, update profil, ubah password. |
| `tests/Feature/AdminRbacTest.php` | Proteksi route admin, CRUD user, toggle status aktif, audit logging. |
| `tests/Feature/TicketRbacTest.php` | Hak cipta tiket, assignment PM, isolasi programmer, visibilitas log internal. |
| `tests/Feature/ClaimWorkflowTest.php` | Alur rilis ke pool, claim programmer, dan approval/rejection oleh PM. |
| `tests/Feature/NotificationSystemTest.php` | Preferensi notifikasi, in-app list, tandai dibaca, dan monitoring kuota admin. |
| `tests/Feature/PwaIntegrationTest.php` | Health check endpoint, VAPID key sanitization, pendaftaran push subscription. |
| `tests/Unit/TicketModelTest.php` | Relasi Eloquent Ticket dengan Creator, Assignments, dan ProgressLogs. |
