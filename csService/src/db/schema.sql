-- Schema PostgreSQL untuk Customer Service AI (TeknoBot)
-- Sistem Penanganan Kendala Client

CREATE TABLE IF NOT EXISTS system_info (
  id INTEGER PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  deskripsi TEXT NOT NULL,
  jam_layanan VARCHAR(150) NOT NULL,
  telepon VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL,
  lokasi_walkin VARCHAR(200) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  customer_code VARCHAR(30) UNIQUE NOT NULL,
  nama VARCHAR(120) NOT NULL,
  perusahaan VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telepon VARCHAR(50),
  kota VARCHAR(80),
  paket_layanan VARCHAR(40) NOT NULL DEFAULT 'Business Pro',
  status_akun VARCHAR(30) NOT NULL DEFAULT 'active',
  role VARCHAR(40) NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_categories (
  kode VARCHAR(20) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT NOT NULL,
  pic VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_statuses (
  status VARCHAR(50) PRIMARY KEY,
  urutan INTEGER NOT NULL,
  nama VARCHAR(100) NOT NULL,
  penanggung_jawab VARCHAR(100) NOT NULL,
  keterangan TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sla_levels (
  prioritas VARCHAR(20) PRIMARY KEY,
  respon_pertama VARCHAR(50) NOT NULL,
  target_selesai VARCHAR(50) NOT NULL,
  kriteria TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id VARCHAR(30) PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  category_kode VARCHAR(20) REFERENCES ticket_categories(kode),
  judul VARCHAR(200) NOT NULL,
  deskripsi TEXT NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  prioritas VARCHAR(20) NOT NULL REFERENCES sla_levels(prioritas),
  status VARCHAR(50) NOT NULL REFERENCES workflow_statuses(status),
  status_label VARCHAR(120) NOT NULL,
  pelapor VARCHAR(150) NOT NULL,
  kontak_pelapor VARCHAR(120),
  pic_programmer VARCHAR(120),
  tanggal_dibuat VARCHAR(40) NOT NULL,
  sla_estimasi VARCHAR(60),
  log_terkini TEXT,
  solusi_sementara TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_kategori ON tickets(kategori);
CREATE INDEX IF NOT EXISTS idx_tickets_prioritas ON tickets(prioritas);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  kategori VARCHAR(100) NOT NULL,
  pertanyaan TEXT NOT NULL UNIQUE,
  jawaban TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id VARCHAR(100) PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  user_id INTEGER,
  user_name VARCHAR(120),
  user_role VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

CREATE TABLE IF NOT EXISTS security_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(80) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  ip VARCHAR(64),
  session_id VARCHAR(100),
  user_id INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
