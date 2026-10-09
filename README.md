# Sistem Penanganan Kendala Client (Tugas PKL)

Sistem helpdesk & penanganan tiket klien terpadu berbasis **Laravel 11 (Backend)** dan **React 19 + Vite (Frontend)** dengan database **MySQL/MariaDB**, mengintegrasikan fitur **Board Monitoring & In-App Notification Digest** dari `alamak` serta **PWA Offline Sync & Web Push Notification** dari `pkl`.

---

## 🚀 Fitur Unggulan Terpadu

### 1. Diadaptasi dari `alamak`:
- **Kanban Board Monitoring (`/board`)**: Drag-and-drop tiket berdasarkan alur status menggunakan `@dnd-kit`, dengan layout tersimpan di `sessionStorage`.
- **In-App Notification & Digest Engine**:
  - Preferensi notifikasi per event (`/settings/notifications`).
  - Mode digest: Pengiriman instan, rangkuman per jam (*hourly*), atau harian (*daily*) pukul 08:00.
  - Jam Hening (*Quiet Hours / Do Not Disturb*).
  - Riwayat lengkap notifikasi (`/settings/notifications/history`).
  - Pemantauan kuota notifikasi admin (`/admin/quota`).
- **Event-Driven Architecture**: Status tiket memicu event `TicketStatusChanged` dan listener `AggregateTicketStatusNotification`.

### 2. Diintegrasikan dari `pkl`:
- **PWA (Progressive Web App)**:
  - Service Worker dengan strategi caching cerdas via `vite-plugin-pwa` & `Workbox`.
  - Dukungan instalasi mandiri (standalone app) dengan App Shortcuts.
- **Offline Reliability & Background Sync**:
  - Form pembuatan tiket client dan tiket walk-in otomatis menyimpan data ke antrean lokal (`offlineSync.js`) saat internet terputus.
  - Tiket disinkronkan otomatis ke server begitu perangkat kembali online via `PWAStatusBanner`.
- **Native Web Push Notifications (VAPID)**:
  - Tombol aktivasi dan tes push langsung di dropdown `NotificationBell`.
  - Pengiriman push notification ke browser/OS via script backend `send_push.cjs`.
- **App Badging API & Dynamic Canvas Favicon**:
  - Menampilkan jumlah notifikasi unread di icon aplikasi (`navigator.setAppBadge`) dan dynamic badge merah pada favicon tab browser.
- **QA & Test Suite Lengkap**:
  - 38 PHPUnit backend tests (133 assertions) lulus 100%.
  - 26 Vitest frontend unit tests lulus 100%.
  - Dokumen formal [AC.md](./webPenangananKendalaClientBE/AC.md) (22 Acceptance Criteria).

---

## 🗄️ Konfigurasi Database MySQL

Database telah dikonfigurasi menggunakan MySQL/MariaDB:

- **Database**: `penanganan_kendala_client`
- **Host**: `127.0.0.1` (Port: `3306`)
- **Username**: `noobplay` (atau `root`)
- **Password**: *(kosong)*

### Perintah Database (Backend):
```bash
cd webPenangananKendalaClientBE
# Jalankan migrasi & seeder
php artisan migrate:fresh --seed
```

---

## 🔑 Akun Demo (Default Seed Users)

Seluruh role sudah di-seed ke MySQL dengan password default: `password`

| Role | Email | Password | Akses Menu Utama |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@example.com` | `password` | Manajemen Pengguna, Log Aktivitas, Board, Kuota |
| **Project Manager** | `pm@example.com` | `password` | Assign Tiket, Approval Claim, Review Solusi, Eskalasi Owner |
| **Programmer 1** | `programmer@example.com` | `password` | Available Tickets, Claim Tiket, My Tasks, Log Pengerjaan |
| **Programmer 2** | `programmer2@gmail.com` | `password` | Available Tickets, My Tasks |
| **Service Desk** | `servicedesk@example.com` | `password` | Buat Tiket, Tiket Walk-in, Konfirmasi/Tolak Tiket Klien |
| **Company Owner** | `owner@example.com` | `password` | Board Monitoring, Keputusan Isu Eskalasi, Laporan Sistem |
| **Client** | `client@example.com` | `password` | Dashboard Client, Buat Tiket Kendala (Online/Offline), Tracking |

---

## 🛠️ Cara Menjalankan Aplikasi

### 1. Menjalankan Backend (Laravel)
Buka terminal:
```bash
cd "/home/noobplay/Desktop/tugas pkl/webPenangananKendalaClientBE"
php artisan serve
```
Backend akan aktif di: `http://localhost:8000`

### 2. Menjalankan Frontend (React + Vite)
Buka terminal baru:
```bash
cd "/home/noobplay/Desktop/tugas pkl/webPenangananKendalaClientFE"
npm run dev
```
Frontend akan aktif di: `http://localhost:5173`

---

## 🧪 Menjalankan Pengujian (Testing)

### Backend Tests (PHPUnit):
```bash
cd "/home/noobplay/Desktop/tugas pkl/webPenangananKendalaClientBE"
./vendor/bin/phpunit
```
*(Hasil: 38 tests, 133 assertions passed)*

### Frontend Tests (Vitest):
```bash
cd "/home/noobplay/Desktop/tugas pkl/webPenangananKendalaClientFE"
npm test
```
*(Hasil: 3 test files, 26 tests passed)*
