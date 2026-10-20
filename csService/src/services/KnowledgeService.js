import fs from 'fs';
import path from 'path';
import { config } from '../config/ai.js';

class KnowledgeService {
  constructor() {
    this.ticketData = null;
    this.faqData = null;
    this.loadData();
  }

  loadData() {
    try {
      const ticketPath = path.resolve(config.paths.tickets);
      if (fs.existsSync(ticketPath)) {
        this.ticketData = JSON.parse(fs.readFileSync(ticketPath, 'utf-8'));
      } else {
        console.warn(`[KnowledgeService] Tickets file not found: ${ticketPath}`);
        this.ticketData = {};
      }
    } catch (err) {
      console.error('[KnowledgeService] Error loading tickets data:', err.message);
      this.ticketData = {};
    }

    try {
      const faqPath = path.resolve(config.paths.faq);
      if (fs.existsSync(faqPath)) {
        this.faqData = JSON.parse(fs.readFileSync(faqPath, 'utf-8'));
      } else {
        console.warn(`[KnowledgeService] FAQ file not found: ${faqPath}`);
        this.faqData = [];
      }
    } catch (err) {
      console.error('[KnowledgeService] Error loading FAQ data:', err.message);
      this.faqData = [];
    }
  }

  getSystemInfo() {
    return this.ticketData?.sistem || null;
  }

  getCategories() {
    return this.ticketData?.kategori_kendala || [];
  }

  getTickets() {
    return this.ticketData?.daftar_tiket || [];
  }

  getWorkflows() {
    return this.ticketData?.alur_status_workflow || [];
  }

  getSla() {
    return this.ticketData?.sla_level || [];
  }

  getFaqs() {
    return this.faqData || [];
  }

  findTicket(query) {
    if (!query) return null;
    const cleanQuery = query.trim().toLowerCase();
    const tickets = this.getTickets();
    return tickets.find(t => 
      t.ticket_id.toLowerCase().includes(cleanQuery) ||
      t.judul.toLowerCase().includes(cleanQuery) ||
      t.pelapor.toLowerCase().includes(cleanQuery)
    );
  }

  getRelevantContext(userMessage) {
    const rawQ = (userMessage || '').toLowerCase();
    const qTokens = rawQ.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const q = rawQ;

    const sistem = this.getSystemInfo();
    const categories = this.getCategories();
    const tickets = this.getTickets();
    const workflows = this.getWorkflows();
    const slas = this.getSla();
    const faqs = this.getFaqs();

    let contextParts = [];

    // 1. Informasi Sistem Helpdesk & Kontak Service Desk
    if (sistem) {
      contextParts.push(`[INFORMASI SISTEM]:\nNama: ${sistem.nama}\nDeskripsi: ${sistem.deskripsi}\nJam Layanan: ${sistem.jam_layanan}\nTelepon Helpdesk: ${sistem.kontak_helpdesk?.telepon}\nWhatsApp: ${sistem.kontak_helpdesk?.whatsapp}\nEmail: ${sistem.kontak_helpdesk?.email}\nWalk-in: ${sistem.kontak_helpdesk?.lokasi_walkin}`);
    }

    // 2. Pencarian Tiket Spesifik / Tracking Tiket
    const isTicketQuery = q.match(/tck-\d{6}-\d{4}/i) || 
      qTokens.some(w => ['tiket', 'ticket', 'kendala', 'lacak', 'status', 'progress', 'antrean', 'tck'].includes(w));

    if (isTicketQuery) {
      const specificId = (q.match(/tck-\d{6}-\d{4}/i) || [])[0];
      if (specificId) {
        const found = this.findTicket(specificId);
        if (found) {
          contextParts.push(`[DATA DETAIL TIKET DITEMUKAN]:
- ID Tiket: ${found.ticket_id}
- Judul: ${found.judul}
- Kategori: ${found.kategori} | Prioritas: ${found.prioritas}
- Status Terkini: ${found.status_label} (${found.status})
- Pelapor: ${found.pelapor} (${found.kontak_pelapor})
- PIC Programmer: ${found.pic_programmer || 'Belum ditugaskan'}
- Tanggal Dibuat: ${found.tanggal_dibuat} | SLA Estimasi: ${found.sla_estimasi}
- Log Progres Terakhir: ${found.log_terkini}
- Solusi / Rekomendasi Sementara: ${found.solusi_sementara}`);
        }
      } else {
        // Tampilkan daftar ringkas tiket aktif
        const ticketSummary = tickets.map(t => 
          `- ${t.ticket_id}: "${t.judul}" [Status: ${t.status_label}] (Pelapor: ${t.pelapor}, Prioritas: ${t.prioritas})`
        ).join('\n');
        contextParts.push(`[DAFTAR TIKET TERDAFTAR DI SISTEM]:\n${ticketSummary}`);
      }
    }

    // 3. Kategori Kendala (Software, Hardware, Jaringan, Akun, Walk-in)
    const isCategoryQuery = qTokens.some(w => ['kategori', 'software', 'hardware', 'jaringan', 'akun', 'walkin', 'rusak', 'error', 'bug'].includes(w));
    if (isCategoryQuery) {
      const catText = categories.map(c => `- [${c.kode}] ${c.nama}: ${c.deskripsi} (PIC: ${c.pic})`).join('\n');
      contextParts.push(`[KATEGORI KENDALA IT]:\n${catText}`);
    }

    // 4. Alur Workflow & Status Tiket
    const isWorkflowQuery = qTokens.some(w => ['alur', 'workflow', 'pending', 'open', 'review', 'resolved', 'closed', 'eskalasi', 'peran', 'role', 'pm', 'programmer', 'owner', 'servicedesk'].includes(w));
    if (isWorkflowQuery) {
      const wfText = workflows.map(w => `- Status "${w.status}" (${w.nama}): Tanggung jawab [${w.penanggung_jawab}] -> ${w.keterangan}`).join('\n');
      contextParts.push(`[ALUR WORKFLOW STATUS TIKET]:\n${wfText}`);
    }

    // 5. Tingkat SLA & Respon
    const isSlaQuery = qTokens.some(w => ['sla', 'waktu', 'durasi', 'urgent', 'cepat', 'target', 'prioritas', 'jam'].includes(w));
    if (isSlaQuery) {
      const slaText = slas.map(s => `- Prioritas ${s.prioritas}: Respon Pertama ${s.respon_pertama}, Target Selesai ${s.target_selesai} (${s.kriteria})`).join('\n');
      contextParts.push(`[STANDAR SERVICE LEVEL AGREEMENT (SLA)]:\n${slaText}`);
    }

    // 6. FAQ Relevan
    const matchedFaqs = faqs.filter(f => {
      const fText = (f.kategori + ' ' + f.pertanyaan + ' ' + f.jawaban).toLowerCase();
      return qTokens.some(w => fText.includes(w));
    });

    if (matchedFaqs.length > 0) {
      const faqText = matchedFaqs.map(f => `Q: ${f.pertanyaan}\nA: ${f.jawaban}`).join('\n\n');
      contextParts.push(`[PANDUAN & FAQ KENDALA CLIENT]:\n${faqText}`);
    } else {
      const defaultFaqText = faqs.map(f => `Q: ${f.pertanyaan}\nA: ${f.jawaban}`).join('\n\n');
      contextParts.push(`[FAQ UMUM KENDALA]:\n${defaultFaqText}`);
    }

    return contextParts.join('\n\n--------------------\n\n');
  }
}

export const knowledgeService = new KnowledgeService();
