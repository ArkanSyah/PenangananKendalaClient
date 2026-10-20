import fs from 'fs';
import path from 'path';
import { config } from '../config/ai.js';
import { knowledgeService } from './KnowledgeService.js';
import { aiService } from './AIService.js';

class ChatService {
  constructor() {
    this.sessions = new Map();
    this.loadSessions();
  }

  loadSessions() {
    try {
      const sessionPath = path.resolve(config.paths.sessions);
      if (fs.existsSync(sessionPath)) {
        const raw = fs.readFileSync(sessionPath, 'utf-8');
        const obj = JSON.parse(raw);
        for (const [key, val] of Object.entries(obj)) {
          this.sessions.set(key, val);
        }
      }
    } catch (err) {
      console.warn('[ChatService] Could not load persisted sessions:', err.message);
    }
  }

  saveSessions() {
    try {
      const sessionPath = path.resolve(config.paths.sessions);
      const dir = path.dirname(sessionPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const obj = Object.fromEntries(this.sessions);
      fs.writeFileSync(sessionPath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ChatService] Error saving sessions:', err.message);
    }
  }

  getSession(sessionId) {
    if (!sessionId) {
      sessionId = 'default-session-' + Math.random().toString(36).substring(2, 9);
    }
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        createdAt: new Date().toISOString(),
        messages: [],
      });
    }
    return this.sessions.get(sessionId);
  }

  getHistory(sessionId) {
    const session = this.getSession(sessionId);
    return session.messages;
  }

  resetSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      this.saveSessions();
      return true;
    }
    return false;
  }

  buildSystemPrompt(relevantContext) {
    return `Kamu adalah "TeknoBot", asisten AI resmi untuk **Sistem Penanganan Kendala Client** (Helpdesk & Trouble Ticketing Support).

TUGAS UTAMA KAMU:
1. Membantu Klien, Service Desk, dan Staf Operasional mengecek status dan perkembangan tiket kendala IT (Format ID: TCK-202610-xxxx).
2. Memberikan panduan troubleshooting awal mandiri (self-service) untuk kendala umum seperti Error 500, akun login terkunci, atau koneksi timeout.
3. Menjelaskan alur workflow tiket (Pending Confirmation -> Open -> Escalated to PM -> Waiting Programmer -> In Progress -> In Review -> Resolved -> Closed), SLA waktu penyelesaian, dan peran masing-masing role (Service Desk, PM, Programmer, Owner).
4. Memandu klien cara membuat tiket kendala baru secara benar melalui portal web.

PEDOMAN KETAT:
1. Gunakan informasi dari [KNOWLEDGE BASE PENANGANAN KENDALA] di bawah ini untuk menjawab pertanyaan.
2. Jika pengguna menanyakan nomor tiket tertentu (misal: TCK-202610-0001 s/d TCK-202610-0008), sampaikan secara terstruktur:
   - Judul & Kategori
   - Status Terkini & Penanggung Jawab (PIC)
   - Log Progres Terakhir
   - Solusi / Rekomendasi Sementara
   - Estimasi SLA
3. Jika nomor tiket yang dicari tidak ditemukan, sampaikan dengan santun bahwa nomor tersebut belum terdaftar di sistem dan sarankan untuk mengecek kembali di menu "My Tickets" pada dashboard atau buat tiket baru di "Create Ticket".
4. Gunakan bahasa Indonesia yang ramah, sopan, bernada teknis yang solutif dan mudah dimengerti. Format jawaban menggunakan markdown rapi (bullet points & bold).

====================
[KNOWLEDGE BASE PENANGANAN KENDALA]:
${relevantContext}
====================`;
  }

  async processChat({ sessionId, message, onChunk }) {
    if (!message || !message.trim()) {
      throw new Error('Pesan tidak boleh kosong.');
    }

    const session = this.getSession(sessionId);

    // Ambil RAG Context dari knowledge base JSON kendala client
    const relevantContext = knowledgeService.getRelevantContext(message);

    // Bangun prompt system
    const systemPrompt = this.buildSystemPrompt(relevantContext);

    // Batasi history maksimal 8 pesan terakhir agar prompt tetap efisien
    const recentMessages = session.messages.slice(-8).map(m => ({
      role: m.role,
      content: m.content
    }));

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages,
      { role: 'user', content: message }
    ];

    // Simpan pesan user ke history
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    let assistantResponse = '';

    if (onChunk) {
      assistantResponse = await aiService.streamChat(fullMessages, onChunk);
    } else {
      assistantResponse = await aiService.chat(fullMessages);
    }

    // Simpan respons bot ke history
    session.messages.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString()
    });

    // Persist session ke file JSON
    this.saveSessions();

    return {
      sessionId: session.id,
      response: assistantResponse,
    };
  }
}

export const chatService = new ChatService();
