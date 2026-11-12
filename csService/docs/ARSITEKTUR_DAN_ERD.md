# Dokumentasi Arsitektur, ERD, dan Alur Program TeknoBot CS (PostgreSQL)

Dokumen ini menjelaskan rancangan database (**ERD**), **Alur Program (Flowchart)**, serta **Diagram Interaksi (Sequence Diagram)** untuk microservice **Customer Service AI (TeknoBot)** yang terintegrasi langsung dengan **PostgreSQL** (`teknobot_cs_db`).

---

## 1. Entity Relationship Diagram (ERD) Database PostgreSQL

```mermaid
erDiagram
    CUSTOMERS ||--o{ TICKETS : "melaporkan (1:N)"
    TICKET_CATEGORIES ||--o{ TICKETS : "mengkategorikan (1:N)"
    SLA_LEVELS ||--o{ TICKETS : "menentukan_target (1:N)"
    WORKFLOW_STATUSES ||--o{ TICKETS : "menetapkan_status (1:N)"
    CUSTOMERS ||--o{ CHAT_SESSIONS : "memiliki_sesi (1:N)"
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "menyimpan_pesan (1:N)"

    CUSTOMERS {
        int id PK
        varchar customer_code UK
        varchar nama
        varchar perusahaan
        varchar email UK
        varchar telepon
        varchar kota
        varchar paket_layanan
        varchar status_akun
        varchar role
        timestamptz created_at
    }

    TICKETS {
        varchar ticket_id PK
        int customer_id FK
        varchar category_kode FK
        varchar judul
        text deskripsi
        varchar kategori
        varchar prioritas FK
        varchar status FK
        varchar status_label
        varchar pelapor
        varchar kontak_pelapor
        varchar pic_programmer
        varchar tanggal_dibuat
        varchar sla_estimasi
        text log_terkini
        text solusi_sementara
        timestamptz created_at
    }

    TICKET_CATEGORIES {
        varchar kode PK
        varchar nama
        text deskripsi
        varchar pic
    }

    WORKFLOW_STATUSES {
        varchar status PK
        int urutan
        varchar nama
        varchar penanggung_jawab
        text keterangan
    }

    SLA_LEVELS {
        varchar prioritas PK
        varchar respon_pertama
        varchar target_selesai
        text kriteria
    }

    FAQS {
        serial id PK
        varchar kategori
        text pertanyaan UK
        text jawaban
        timestamptz created_at
    }

    CHAT_SESSIONS {
        varchar id PK
        int customer_id FK
        int user_id
        varchar user_name
        varchar user_role
        timestamptz created_at
        timestamptz updated_at
    }

    CHAT_MESSAGES {
        serial id PK
        varchar session_id FK
        varchar role
        text content
        timestamptz created_at
    }

    SECURITY_LOGS {
        serial id PK
        varchar event_type
        varchar severity
        varchar ip
        varchar session_id
        int user_id
        jsonb details
        timestamptz created_at
    }

    SYSTEM_INFO {
        int id PK
        varchar nama
        text deskripsi
        varchar jam_layanan
        varchar telepon
        varchar whatsapp
        varchar email
        varchar lokasi_walkin
        timestamptz updated_at
    }
```

### Ringkasan Dataset Terisi (>= 100 Data):
| Tabel | Jumlah Data | Fungsi Utama |
| :--- | :---: | :--- |
| `customers` | **105 baris** | Data profil pelanggan/klien dan peran akun sistem |
| `tickets` | **120 baris** | Data tiket kendala IT terhubung ke pelanggan & kategori |
| `faqs` | **25 baris** | Basis pengetahuan panduan troubleshooting mandiri |
| `workflow_statuses` | **11 baris** | Referensi alur status penanganan tiket |
| `ticket_categories` | **5 baris** | Kategori kendala (Software, Hardware, Jaringan, Akun, Walk-In) |
| `sla_levels` | **4 baris** | Target waktu respon dan penyelesaian (Urgent - Low) |
| `chat_sessions` & `chat_messages` | Dinamis | Penyimpanan riwayat percakapan chatbot per sesi |
| `security_logs` | Dinamis | Audit insiden guardrail keamanan (OWASP LLM01/LLM06) |

---

## 2. Flowchart Alur Program Chatbot AI (TeknoBot)

```mermaid
flowchart TD
    A["Pengguna Mengirim Pesan di Widget Chat React"] --> B["Express Middleware: Rate Limiter per IP dan Sesi"]
    B -->|Melebihi Batas| C["HTTP 429 Too Many Requests"]
    B -->|Lolos| D{"Cek Pertanyaan Identitas Model?"}
    D -->|Ya| E["Balas Identitas Resmi TeknoBot White-Label"]
    D -->|Tidak| F{"Deteksi Prompt Injection / SQLi / File Dump?"}
    F -->|Terdeteksi| G["Catat ke security_logs PostgreSQL & Blokir"]
    F -->|Aman| H{"Ada ID Tiket Spesifik TCK-xxxx?"}
    H -->|Ya| I["Query SQL Parameterized ke Tabel tickets PostgreSQL"]
    I --> J{"Lolos Ownership Check?"}
    J -->|Tamu / Bukan Pemilik| K["Catat Unauthorized Access & Tolak Akses"]
    J -->|Sah / Admin / Service Desk| L["Lanjutkan ke SQL RAG Retrieval"]
    H -->|Tidak| L["SQL RAG Retrieval ke PostgreSQL"]
    L --> M["Ambil Context Terbatas: Profil, Tiket Sesuai Role, Statistik, & FAQ"]
    M --> N["Bangun System Prompt + Bungkus Konteks untrusted_database_records"]
    N --> O["Ambil Maksimal 8 Riwayat Chat Terakhir dari chat_messages"]
    O --> P["Kirim ke LLM Gateway via SSE Streaming - Ollama atau 9Router"]
    P --> Q["Bidirectional Output Filtering: Sensor API Key, Path, Raw Dump, Vendor"]
    Q --> R["Simpan Turn User & Assistant ke chat_sessions dan chat_messages PostgreSQL"]
    R --> S["Tampilkan Jawaban Real-Time ke Widget React"]
```

---

## 3. Sequence Diagram (Alur Sesi Reaktif Login/Logout & PostgreSQL)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna
    participant UI as React Widget Chat
    participant API as Node.js csService
    participant DB as PostgreSQL teknobot_cs_db
    participant LLM as LLM Gateway (9Router / Ollama)

    Note over User,DB: Kondisi 1: Pengguna Tamu di Halaman Login
    User->>UI: Kirim pesan cek FAQ / kendala umum
    UI->>API: POST /api/chat (sessionId: sess_guest_..., user: null)
    API->>DB: Query tabel system_info & faqs (tanpa akses tickets privat)
    DB-->>API: Baris FAQ relevan
    API->>LLM: Kirim prompt + konteks FAQ
    LLM-->>API: Stream chunk jawaban
    API->>DB: INSERT ke chat_sessions & chat_messages
    API-->>UI: Stream SSE jawaban ke layar

    Note over User,DB: Kondisi 2: Pengguna Login sebagai Klien (ID 6)
    User->>UI: Login sukses di portal
    UI->>API: GET /api/history/sess_user_6?userId=6&role=client
    API->>DB: Sinkronkan chat_sessions & ambil chat_messages milik user 6
    DB-->>API: Riwayat chat klien
    User->>UI: Tanya status tiket TCK-202610-0001
    UI->>API: POST /api/chat (sessionId: sess_user_6, user: ID 6)
    API->>DB: SELECT tickets JOIN customers WHERE customer_id = 6
    DB-->>API: Detail tiket sah milik klien
    API->>LLM: Kirim prompt + data tiket sah
    LLM-->>API: Stream jawaban detail tiket
    API->>DB: Simpan pesan ke PostgreSQL
    API-->>UI: Stream SSE tampil ke klien
```
