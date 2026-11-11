import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/ai.js';
import { postgres } from './postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORY_CODE_MAP = {
  Software: 'SW',
  Hardware: 'HW',
  Jaringan: 'NET',
  Akun: 'ACC',
  'Walk-In': 'WI',
};

const CORE_CUSTOMERS = [
  { id: 1, customer_code: 'CUST-0001', nama: 'Service Desk Admin', perusahaan: 'Tim Infrastruktur & Service Desk IT', email: 'servicedesk@example.com', telepon: '(021) 555-0101', kota: 'Jakarta', paket_layanan: 'Internal IT', status_akun: 'active', role: 'service_desk' },
  { id: 2, customer_code: 'CUST-0002', nama: 'Project Manager Alpha', perusahaan: 'Divisi Manajemen Proyek IT', email: 'pm@example.com', telepon: '(021) 555-0102', kota: 'Jakarta', paket_layanan: 'Internal IT', status_akun: 'active', role: 'project_manager' },
  { id: 3, customer_code: 'CUST-0003', nama: 'Programmer Dev One', perusahaan: 'Tim DevOps & Backend Engineering', email: 'programmer@example.com', telepon: '(021) 555-0103', kota: 'Bandung', paket_layanan: 'Internal IT', status_akun: 'active', role: 'programmer' },
  { id: 4, customer_code: 'CUST-0004', nama: 'Programmer Dev Two', perusahaan: 'Tim QA & Mobile Frontend', email: 'programmer2@gmail.com', telepon: '(021) 555-0104', kota: 'Bandung', paket_layanan: 'Internal IT', status_akun: 'active', role: 'programmer' },
  { id: 5, customer_code: 'CUST-0005', nama: 'Company Owner', perusahaan: 'PT Penanganan Kendala Nusantara', email: 'owner@example.com', telepon: '(021) 555-0105', kota: 'Jakarta', paket_layanan: 'Internal IT', status_akun: 'active', role: 'owner' },
  { id: 6, customer_code: 'CUST-0006', nama: 'Corporate Client', perusahaan: 'PT Mitra Usaha Utama', email: 'client@example.com', telepon: '081234567890', kota: 'Jakarta', paket_layanan: 'Enterprise', status_akun: 'active', role: 'client' },
  { id: 7, customer_code: 'CUST-0007', nama: 'System Administrator', perusahaan: 'Divisi Operasional & Keamanan Sistem', email: 'admin@example.com', telepon: '(021) 555-0107', kota: 'Jakarta', paket_layanan: 'Internal IT', status_akun: 'active', role: 'admin' },
];

const FIRST_NAMES = [
  'Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hendra', 'Indah', 'Joko',
  'Kartika', 'Lukman', 'Maya', 'Nugroho', 'Olivia', 'Putra', 'Qori', 'Rina', 'Surya', 'Tania',
  'Umar', 'Vina', 'Wahyu', 'Yusuf', 'Zahra', 'Bagas', 'Dian', 'Farhan', 'Hana', 'Ilham',
];

const LAST_NAMES = [
  'Pratama', 'Santoso', 'Wijaya', 'Kusuma', 'Lestari', 'Saputra', 'Hidayat', 'Nugraha', 'Purnama', 'Rahmawati',
  'Setiawan', 'Utami', 'Wibowo', 'Kurniawan', 'Sari', 'Permana', 'Susanto', 'Anggraini', 'Ramadhan', 'Mulyani',
];

const COMPANIES = [
  'PT Sinar Abadi', 'CV Karya Mandiri', 'PT Global Niaga', 'PT Mega Logistik', 'PT Cakra Fintech',
  'PT Prima Medika', 'PT Nusantara Retail', 'CV Bintang Timur', 'PT Harmoni Digital', 'PT Sentosa Ekspres',
  'PT Jaya Konstruksi', 'PT Amanah Pangan', 'PT Sumber Energi', 'PT Samudra Transport', 'PT Kreasi Media',
  'PT Maju Jaya Teknik', 'PT Graha Properti', 'CV Cahaya Solusi', 'PT Mulia Sejahtera', 'PT Delta Informatika',
];

const CITIES = ['Jakarta', 'Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Medan', 'Makassar', 'Denpasar', 'Batam', 'Balikpapan'];
const PACKAGES = ['Enterprise', 'Business Pro', 'Business Pro', 'Starter'];

function generateCustomers(total = 105) {
  const customers = [...CORE_CUSTOMERS];
  for (let id = 8; id <= total; id++) {
    const fn = FIRST_NAMES[(id * 3) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(id * 7) % LAST_NAMES.length];
    const comp = COMPANIES[(id * 5) % COMPANIES.length];
    const kota = CITIES[id % CITIES.length];
    const paket = PACKAGES[id % PACKAGES.length];
    const status = id % 19 === 0 ? 'suspended' : (id % 11 === 0 ? 'trial' : 'active');
    const code = `CUST-${String(id).padStart(4, '0')}`;
    const nama = `${fn} ${ln}`;
    customers.push({
      id,
      customer_code: code,
      nama,
      perusahaan: `${comp} (${kota})`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}.${id}@klien-corp.id`,
      telepon: `081${String(200000000 + id * 13579).slice(0, 9)}`,
      kota,
      paket_layanan: paket,
      status_akun: status,
      role: 'client',
    });
  }
  return customers;
}

const TICKET_TEMPLATES = [
  {
    kategori: 'Software',
    category_kode: 'SW',
    judul: 'Gagal Ekspor Rekapitulasi Faktur Pajak Format CSV',
    deskripsi: 'Saat mengekspor lebih dari 500 baris transaksi ke CSV, file hasil unduhan bernilai 0 KB pada browser.',
    solusi: 'Bagi rentang tanggal ekspor menjadi per-minggu sementara optimasi stream memory dikerjakan.',
  },
  {
    kategori: 'Software',
    category_kode: 'SW',
    judul: 'Session Expired Terlalu Cepat Saat Mengisi Form Pengajuan',
    deskripsi: 'Pengguna terlempar ke halaman login setelah 10 menit menginput data lampiran berukuran besar.',
    solusi: 'Simpan draf deskripsi di notepad terlebih dahulu dan pastikan ukuran lampiran di bawah 5 MB.',
  },
  {
    kategori: 'Software',
    category_kode: 'SW',
    judul: 'Grafik SLA Bulanan Tidak Muncul di Browser Safari Mac',
    deskripsi: 'Halaman laporan analitik menampilkan area kosong pada komponen chart di Safari versi 17.',
    solusi: 'Gunakan Chrome atau Edge versi terbaru sambil patch kompatibilitas CSS/SVG dirilis.',
  },
  {
    kategori: 'Jaringan',
    category_kode: 'NET',
    judul: 'Koneksi VPN Kantor Cabang Sering Terputus Tiap 15 Menit',
    deskripsi: 'Tunnel WireGuard/OpenVPN ke server pusat mengalami packet loss 35% saat jam sibuk pagi hari.',
    solusi: 'Alihkan sementara ke gateway backup ISP-2 dan lakukan flush DNS lokal (`ipconfig /flushdns`).',
  },
  {
    kategori: 'Jaringan',
    category_kode: 'NET',
    judul: 'Webhook Notifikasi Real-Time Mengalami Delay 5 Menit',
    deskripsi: 'Callback API status tiket baru diterima oleh sistem ERP internal setelah jeda lebih dari 300 detik.',
    solusi: 'Gunakan sinkronisasi manual lewat tombol Refresh atau endpoint polling `/api/tickets` per 5 menit.',
  },
  {
    kategori: 'Hardware',
    category_kode: 'HW',
    judul: 'Printer Thermal Barcode Loket Gudang Tidak Merespons',
    deskripsi: 'Lampu indikator printer berkedip merah dan antrean print spooler Windows tertahan status Error.',
    solusi: 'Restart service Print Spooler, cabut pasang kabel USB printer ke port lain, dan uji test print.',
  },
  {
    kategori: 'Hardware',
    category_kode: 'HW',
    judul: 'Laptop Operasional Mengalami Overheat & PSU Adapter Mati-Nyala',
    deskripsi: 'Adaptor daya laptop terasa sangat panas dan pengisian baterai sering terputus otomatis.',
    solusi: 'Segera hentikan penggunaan adaptor yang bermasalah untuk mencegah korsleting, gunakan unit cadangan, dan bawa ke meja IT Lantai 2.',
  },
  {
    kategori: 'Akun',
    category_kode: 'ACC',
    judul: 'Permintaan Aktivasi Hak Akses Role Supervisor Cabang Baru',
    deskripsi: 'Supervisor baru belum mendapatkan menu persetujuan eskalasi dan notifikasi email digest.',
    solusi: 'Pastikan surat tugas/approval atasan sudah dilampirkan agar Service Desk dapat langsung memperbarui role.',
  },
  {
    kategori: 'Akun',
    category_kode: 'ACC',
    judul: 'Kode OTP Verifikasi Login Dua Langkah Tidak Masuk ke Email',
    deskripsi: 'Pengguna menunggu lebih dari 5 menit setelah klik kirim ulang OTP namun inbox dan spam tetap kosong.',
    solusi: 'Periksa whitelist domain `@kendala-client.local` di mail server perusahaan atau hubungi hotline Service Desk.',
  },
  {
    kategori: 'Walk-In',
    category_kode: 'WI',
    judul: 'Kendala Mendesak Akses Portal Presentasi Klien di Ruang Rapat',
    deskripsi: 'Koneksi WiFi tamu tidak dapat mengakses staging server saat demo presentasi berlangsung.',
    solusi: 'Hubungkan perangkat ke SSID khusus `Operasional-Meeting` melalui petugas Service Desk di Lantai 2.',
  },
];

const WORKFLOW_POOL = [
  { status: 'pending_confirmation', status_label: 'Menunggu Konfirmasi Service Desk', sla_estimasi: '4 Jam Kerja', log: 'Tiket baru masuk sistem, menunggu validasi awal Service Desk.' },
  { status: 'open', status_label: 'Terbuka (Dalam Antrean Service Desk)', sla_estimasi: '4 Jam Kerja', log: 'Tiket tervalidasi dan siap ditindaklanjuti tim teknis.' },
  { status: 'escalated_to_pm', status_label: 'Eskalasi ke Project Manager', sla_estimasi: '8 Jam Kerja', log: 'Dieskalasikan ke PM untuk alokasi programmer spesialis.' },
  { status: 'waiting_programmer', status_label: 'Menunggu Klaim Programmer', sla_estimasi: '1 Hari Kerja', log: 'Dirilis ke pool Available Tickets untuk diklaim tim engineering.' },
  { status: 'in_progress', status_label: 'Sedang Dikerjakan oleh Programmer', sla_estimasi: '6 Jam Kerja', log: 'Programmer sedang menganalisis log error dan menyiapkan patch perbaikan.' },
  { status: 'pending_review', status_label: 'Selesai Dikerjakan (Menunggu Review PM)', sla_estimasi: '3 Jam Kerja', log: 'Perbaikan selesai di branch staging, menunggu QA review Project Manager.' },
  { status: 'resolved', status_label: 'Selesai / Teratasi (Resolved)', sla_estimasi: 'Selesai', log: 'Kendala berhasil diselesaikan dan diverifikasi oleh tim QA/PM.' },
  { status: 'closed', status_label: 'Ditutup (Closed)', sla_estimasi: 'Selesai', log: 'Klien mengonfirmasi kendala tuntas; tiket ditutup dan diarsipkan.' },
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

function generateRemainingTickets(baseTickets, customers, targetTotal = 120) {
  const result = baseTickets.map((t) => ({
    ticket_id: t.ticket_id,
    customer_id: t.user_id,
    category_kode: CATEGORY_CODE_MAP[t.kategori] || 'SW',
    judul: t.judul,
    deskripsi: t.deskripsi,
    kategori: t.kategori,
    prioritas: t.prioritas,
    status: t.status,
    status_label: t.status_label,
    pelapor: t.pelapor,
    kontak_pelapor: t.kontak_pelapor || null,
    pic_programmer: t.pic_programmer || null,
    tanggal_dibuat: t.tanggal_dibuat,
    sla_estimasi: t.sla_estimasi,
    log_terkini: t.log_terkini,
    solusi_sementara: t.solusi_sementara,
  }));

  for (let idx = result.length + 1; idx <= targetTotal; idx++) {
    const ticketId = `TCK-202610-${String(idx).padStart(4, '0')}`;
    const tpl = TICKET_TEMPLATES[(idx - 9) % TICKET_TEMPLATES.length];
    const wf = WORKFLOW_POOL[(idx * 3) % WORKFLOW_POOL.length];
    const priority = PRIORITIES[(idx * 5) % PRIORITIES.length];

    // Distribusikan ke 105 customer; sisakan beberapa tiket juga untuk client ID 6
    const customer = (idx % 18 === 0)
      ? customers.find((c) => c.id === 6)
      : customers[7 + (idx % (customers.length - 7))];

    const day = 1 + (idx % 28);
    const hour = 8 + (idx % 9);
    const min = (idx * 7) % 60;
    const tanggalDibuat = `2026-10-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} WIB`;

    result.push({
      ticket_id: ticketId,
      customer_id: customer.id,
      category_kode: tpl.category_kode,
      judul: `${tpl.judul} - ${customer.kota} (#${idx})`,
      deskripsi: `${tpl.deskripsi} Dilaporkan oleh ${customer.nama} dari ${customer.perusahaan}.`,
      kategori: tpl.kategori,
      prioritas: priority,
      status: wf.status,
      status_label: wf.status_label,
      pelapor: `${customer.nama} (${customer.perusahaan})`,
      kontak_pelapor: customer.email,
      pic_programmer: ['in_progress', 'pending_review', 'resolved', 'closed'].includes(wf.status)
        ? (idx % 2 === 0 ? 'Programmer Dev One' : 'Programmer Dev Two')
        : null,
      tanggal_dibuat: tanggalDibuat,
      sla_estimasi: priority === 'Urgent' ? '2-4 Jam' : wf.sla_estimasi,
      log_terkini: wf.log,
      solusi_sementara: tpl.solusi,
    });
  }

  return result;
}

const EXTRA_FAQS = [
  {
    kategori: 'Jaringan & VPN',
    pertanyaan: 'Bagaimana cara mengatasi koneksi VPN kantor yang sering putus atau lambat?',
    jawaban: '1. Pastikan koneksi internet lokal stabil dan tidak sedang mengunduh file besar.\n2. Jalankan flush DNS (`ipconfig /flushdns` di Windows atau `sudo dscacheutil -flushcache` di Mac).\n3. Coba hubungkan ulang ke gateway cadangan (Server VPN-Backup-ID).\n4. Jika masih putus tiap beberapa menit, buat tiket kategori Jaringan dengan melampirkan hasil `ping` atau `traceroute`.',
  },
  {
    kategori: 'Hardware & Perangkat',
    pertanyaan: 'Apa yang harus dilakukan jika PSU komputer atau adaptor daya mati-nyala sendiri?',
    jawaban: 'Gejala mati-nyala berulang menandakan proteksi arus pendek (OCP/SCP) aktif atau kapasitor PSU bermasalah.\n1. Matikan saklar PSU dan cabut kabel listrik segera demi keamanan.\n2. Periksa kabel daya dan stopkontak (pastikan tidak longgar atau berbagi beban berat).\n3. Jangan paksa menyalakan berulang kali; segera buat tiket kategori Hardware atau hubungi meja IT Lantai 2 untuk pengecekan unit pengganti.',
  },
  {
    kategori: 'Hardware & Perangkat',
    pertanyaan: 'Bagaimana penanganan awal printer barcode/kantor yang statusnya Offline atau Spooling macet?',
    jawaban: '1. Periksa kabel USB/LAN dan pastikan printer dalam kondisi menyala tanpa lampu indikator merah.\n2. Di Windows, buka `Services` -> restart layanan **Print Spooler**, lalu bersihkan antrean cetak yang tersangkut.\n3. Cabut daya printer selama 15 detik lalu nyalakan kembali dan lakukan Test Print.',
  },
  {
    kategori: 'Keamanan Akun',
    pertanyaan: 'Bagaimana jika kode OTP Two-Factor Authentication (2FA) tidak masuk ke email?',
    jawaban: '1. Periksa folder Spam/Junk atau tab Promotions di klien email Anda.\n2. Pastikan alamat `@kendala-client.local` tidak terblokir filter mail perusahaan.\n3. Tunggu minimal 60 detik sebelum klik Kirim Ulang OTP agar tidak terkena batas rate limit.\n4. Jika tetap gagal, hubungi Service Desk di (021) 555-0199 untuk verifikasi identitas manual.',
  },
  {
    kategori: 'Laporan & Ekspor',
    pertanyaan: 'Mengapa file ekspor PDF atau Excel berukuran 0 KB atau timeout saat data terlalu banyak?',
    jawaban: 'Ekspor lebih dari ribuan baris sekaligus berisiko melebihi batas timeout browser. Gunakan filter rentang tanggal per minggu atau per bulan saat melakukan ekspor laporan agar file terunduh sempurna.',
  },
  {
    kategori: 'Manajemen Akun',
    pertanyaan: 'Bagaimana prosedur penambahan akun pengguna baru atau perubahan hak akses role?',
    jawaban: 'PIC perusahaan klien cukup membuat tiket kategori Akun dengan melampirkan nama lengkap, email perusahaan, dan role yang dibutuhkan (misal Client Staff atau Supervisor). Service Desk akan memproses aktivasi dalam estimasi SLA 2-4 jam kerja.',
  },
  {
    kategori: 'Manajemen Paket & Layanan',
    pertanyaan: 'Apa perbedaan paket layanan Enterprise, Business Pro, dan Starter bagi klien?',
    jawaban: '- Enterprise: Prioritas respon Urgent < 30 menit, dukungan on-call 24/7, dan Account Manager khusus.\n- Business Pro: Dukungan penuh hari kerja (08:00-17:00 WIB) dan akses portal tracking multi-divisi.\n- Starter: Akses portal ticketing standar dan panduan self-service TeknoBot.',
  },
  {
    kategori: 'Notifikasi & PWA',
    pertanyaan: 'Bagaimana cara mengaktifkan notifikasi real-time di HP atau desktop lewat PWA?',
    jawaban: 'Login ke portal web menggunakan Chrome/Edge, buka menu **Profile & Notification Settings**, aktifkan toggle **Push Notification**, dan klik Allow pada dialog izin browser. Anda juga bisa meng-install aplikasi ke layar utama lewat ikon Install App di address bar.',
  },
  {
    kategori: 'Troubleshooting Software',
    pertanyaan: 'Mengapa muncul pesan 401 Unauthorized atau sesi berakhir saat mengirim tiket?',
    jawaban: 'Token autentikasi memiliki masa berlaku demi keamanan. Silakan salin teks deskripsi Anda terlebih dahulu, lalu lakukan logout dan login kembali agar token sesi diperbarui secara otomatis.',
  },
  {
    kategori: 'Troubleshooting Software',
    pertanyaan: 'Apakah lampiran screenshot atau log error bisa dilampirkan pada tiket kendala?',
    jawaban: 'Ya, portal mendukung unggahan lampiran gambar (PNG/JPG) dan file log (TXT/PDF) hingga ukuran 5 MB per file saat membuat tiket baru atau membalas log progres tiket.',
  },
  {
    kategori: 'Workflow & Approval',
    pertanyaan: 'Kapan sebuah tiket kendala dieskalasikan ke Project Manager atau Company Owner?',
    jawaban: '- Eskalasi ke PM dilakukan jika kendala membutuhkan debugging kode tingkat lanjut atau koordinasi lintas tim programmer.\n- Eskalasi ke Company Owner dilakukan apabila penyelesaian membutuhkan persetujuan anggaran pengadaan hardware atau perubahan kebijakan kontrak.',
  },
  {
    kategori: 'Privasi & Keamanan Data',
    pertanyaan: 'Apakah riwayat tiket perusahaan saya bisa dilihat oleh klien dari perusahaan lain?',
    jawaban: 'Tidak. Sistem menerapkan isolasi data per-akun (*Cross-Tenant Isolation*). Klien hanya dapat melihat dan melacak tiket yang dilaporkan oleh akun miliknya sendiri.',
  },
  {
    kategori: 'Maintenance & Jadwal',
    pertanyaan: 'Kapan jadwal pemeliharaan rutin (maintenance) dan backup database server dilakukan?',
    jawaban: 'Pemeliharaan dan backup otomatis terjadwal setiap hari Minggu pukul 01:00 - 03:00 WIB dengan pemberitahuan resmi H-2 di banner dashboard portal.',
  },
  {
    kategori: 'Billing & Kontrak',
    pertanyaan: 'Ke mana saya harus menghubungi jika status akun klien tercatat Suspended?',
    jawaban: 'Status akun Suspended umumnya terjadi akibat masa kontrak layanan berakhir atau verifikasi administrasi tertunda. Hubungi tim admin kami melalui email helpdesk@penanganankendala.local atau telepon (021) 555-0199 untuk reaktivasi.',
  },
  {
    kategori: 'Integrasi API',
    pertanyaan: 'Mengapa webhook atau API integrasi sistem klien terkena error 429 Too Many Requests?',
    jawaban: 'Error 429 menandakan frekuensi permintaan API melebihi batas keamanan rate limit per menit. Terapkan jeda (*backoff*) antar request dan hindari polling otomatis di bawah interval 5 detik.',
  },
  {
    kategori: 'Walk-In Support',
    pertanyaan: 'Apakah klien boleh datang langsung ke kantor untuk perbaikan perangkat keras mendadak?',
    jawaban: 'Boleh. Silakan kunjungi Meja Service Desk di Lantai 2 Gedung IT Operasional pada jam kerja Senin-Jumat (08:00 - 17:00 WIB) untuk didaftarkan melalui jalur Walk-in Ticket.',
  },
  {
    kategori: 'Pembatalan & Penutupan Tiket',
    pertanyaan: 'Bagaimana jika kendala sudah teratasi sendiri sebelum ditangani programmer?',
    jawaban: 'Anda dapat menambahkan catatan pada detail tiket atau menghubungi Service Desk agar tiket segera ditandai Resolved dan Closed sehingga tidak menumpuk di antrean aktif.',
  },
  {
    kategori: 'TeknoBot CS AI',
    pertanyaan: 'Apa saja hal yang bisa dibantu langsung oleh TeknoBot CS di widget chat?',
    jawaban: 'TeknoBot dapat membantu melacak status tiket pribadi Anda secara real-time, memberikan panduan troubleshooting mandiri (Error 500, VPN, Printer, Akun Terkunci), menjelaskan alur workflow/SLA, serta mencarikan FAQ terkait.',
  },
];

export async function seedDatabase({ closeAfter = false } = {}) {
  const connected = await postgres.init({ force: true });
  if (!connected) {
    throw new Error('Tidak dapat terhubung ke PostgreSQL. Periksa konfigurasi PGHOST/PGUSER/PGDATABASE/PGPASSWORD.');
  }

  await postgres.applySchema();

  const ticketsJson = JSON.parse(fs.readFileSync(path.resolve(config.paths.tickets), 'utf-8'));
  const faqJson = JSON.parse(fs.readFileSync(path.resolve(config.paths.faq), 'utf-8'));

  const customers = generateCustomers(105);
  const tickets = generateRemainingTickets(ticketsJson.daftar_tiket || [], customers, 120);
  const faqs = [...faqJson, ...EXTRA_FAQS];

  const workflows = [
    ...(ticketsJson.alur_status_workflow || []).map((w, idx) => {
      if (w.status === 'pending_review / in_review') {
        return { ...w, status: 'pending_review', urutan: idx + 1 };
      }
      return { ...w, urutan: idx + 1 };
    }),
    {
      status: 'in_review',
      urutan: 11,
      nama: 'Sedang Di-review PM',
      penanggung_jawab: 'Project Manager',
      keterangan: 'Hasil perbaikan programmer sedang diuji dan diverifikasi oleh Project Manager sebelum status Resolved.',
    },
  ];

  await postgres.query('BEGIN');
  try {
    // 1. System info
    const s = ticketsJson.sistem;
    await postgres.query(
      `INSERT INTO system_info (id, nama, deskripsi, jam_layanan, telepon, whatsapp, email, lokasi_walkin)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         nama = EXCLUDED.nama,
         deskripsi = EXCLUDED.deskripsi,
         jam_layanan = EXCLUDED.jam_layanan,
         telepon = EXCLUDED.telepon,
         whatsapp = EXCLUDED.whatsapp,
         email = EXCLUDED.email,
         lokasi_walkin = EXCLUDED.lokasi_walkin,
         updated_at = NOW()`,
      [
        s.nama,
        s.deskripsi,
        s.jam_layanan,
        s.kontak_helpdesk.telepon,
        s.kontak_helpdesk.whatsapp,
        s.kontak_helpdesk.email,
        s.kontak_helpdesk.lokasi_walkin,
      ]
    );

    // 2. Categories
    for (const c of ticketsJson.kategori_kendala || []) {
      await postgres.query(
        `INSERT INTO ticket_categories (kode, nama, deskripsi, pic)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (kode) DO UPDATE SET
           nama = EXCLUDED.nama,
           deskripsi = EXCLUDED.deskripsi,
           pic = EXCLUDED.pic`,
        [c.kode, c.nama, c.deskripsi, c.pic]
      );
    }

    // 3. Workflow statuses
    for (const w of workflows) {
      await postgres.query(
        `INSERT INTO workflow_statuses (status, urutan, nama, penanggung_jawab, keterangan)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (status) DO UPDATE SET
           urutan = EXCLUDED.urutan,
           nama = EXCLUDED.nama,
           penanggung_jawab = EXCLUDED.penanggung_jawab,
           keterangan = EXCLUDED.keterangan`,
        [w.status, w.urutan, w.nama, w.penanggung_jawab, w.keterangan]
      );
    }

    // 4. SLA levels
    for (const sla of ticketsJson.sla_level || []) {
      await postgres.query(
        `INSERT INTO sla_levels (prioritas, respon_pertama, target_selesai, kriteria)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (prioritas) DO UPDATE SET
           respon_pertama = EXCLUDED.respon_pertama,
           target_selesai = EXCLUDED.target_selesai,
           kriteria = EXCLUDED.kriteria`,
        [sla.prioritas, sla.respon_pertama, sla.target_selesai, sla.kriteria]
      );
    }

    // 5. Customers (105 records)
    for (const c of customers) {
      await postgres.query(
        `INSERT INTO customers (id, customer_code, nama, perusahaan, email, telepon, kota, paket_layanan, status_akun, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           customer_code = EXCLUDED.customer_code,
           nama = EXCLUDED.nama,
           perusahaan = EXCLUDED.perusahaan,
           email = EXCLUDED.email,
           telepon = EXCLUDED.telepon,
           kota = EXCLUDED.kota,
           paket_layanan = EXCLUDED.paket_layanan,
           status_akun = EXCLUDED.status_akun,
           role = EXCLUDED.role`,
        [c.id, c.customer_code, c.nama, c.perusahaan, c.email, c.telepon, c.kota, c.paket_layanan, c.status_akun, c.role]
      );
    }

    // 6. Tickets (120 records)
    for (const t of tickets) {
      await postgres.query(
        `INSERT INTO tickets (
           ticket_id, customer_id, category_kode, judul, deskripsi, kategori, prioritas,
           status, status_label, pelapor, kontak_pelapor, pic_programmer, tanggal_dibuat,
           sla_estimasi, log_terkini, solusi_sementara
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (ticket_id) DO UPDATE SET
           customer_id = EXCLUDED.customer_id,
           category_kode = EXCLUDED.category_kode,
           judul = EXCLUDED.judul,
           deskripsi = EXCLUDED.deskripsi,
           kategori = EXCLUDED.kategori,
           prioritas = EXCLUDED.prioritas,
           status = EXCLUDED.status,
           status_label = EXCLUDED.status_label,
           pelapor = EXCLUDED.pelapor,
           kontak_pelapor = EXCLUDED.kontak_pelapor,
           pic_programmer = EXCLUDED.pic_programmer,
           tanggal_dibuat = EXCLUDED.tanggal_dibuat,
           sla_estimasi = EXCLUDED.sla_estimasi,
           log_terkini = EXCLUDED.log_terkini,
           solusi_sementara = EXCLUDED.solusi_sementara`,
        [
          t.ticket_id,
          t.customer_id,
          t.category_kode,
          t.judul,
          t.deskripsi,
          t.kategori,
          t.prioritas,
          t.status,
          t.status_label,
          t.pelapor,
          t.kontak_pelapor,
          t.pic_programmer,
          t.tanggal_dibuat,
          t.sla_estimasi,
          t.log_terkini,
          t.solusi_sementara,
        ]
      );
    }

    // 7. FAQs (25 records)
    for (const f of faqs) {
      await postgres.query(
        `INSERT INTO faqs (kategori, pertanyaan, jawaban)
         VALUES ($1, $2, $3)
         ON CONFLICT (pertanyaan) DO UPDATE SET
           kategori = EXCLUDED.kategori,
           jawaban = EXCLUDED.jawaban`,
        [f.kategori, f.pertanyaan, f.jawaban]
      );
    }

    await postgres.query('COMMIT');

    const countsRes = await postgres.query(`
      SELECT
        (SELECT COUNT(*)::int FROM customers) AS total_customers,
        (SELECT COUNT(*)::int FROM tickets) AS total_tickets,
        (SELECT COUNT(*)::int FROM faqs) AS total_faqs,
        (SELECT COUNT(*)::int FROM ticket_categories) AS total_categories,
        (SELECT COUNT(*)::int FROM workflow_statuses) AS total_workflows,
        (SELECT COUNT(*)::int FROM sla_levels) AS total_slas
    `);

    const counts = countsRes.rows[0];
    console.log('✅ PostgreSQL Seeding Berhasil:', counts);
    return counts;
  } catch (err) {
    await postgres.query('ROLLBACK');
    console.error('❌ PostgreSQL Seeding Gagal:', err.message);
    throw err;
  } finally {
    if (closeAfter) {
      await postgres.close();
    }
  }
}

// Jalankan langsung jika dipanggil via CLI: node src/db/seed.js
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  seedDatabase({ closeAfter: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
