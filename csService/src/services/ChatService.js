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
    return `Kamu adalah "TeknoBot", asisten Customer Service (CS) AI resmi dari TeknoSolusi Store & Client Support (Sistem Penanganan Kendala Client).

TUGAS UTAMA:
- Memberikan pelayanan yang ramah, sopan, profesional, dan solutif kepada pelanggan toko dan pengguna sistem.
- Menjawab pertanyaan seputar produk, spesifikasi, harga, stok, promo/voucher, estimasi pengiriman, cara bayar, hingga tracking status pesanan/resi.
- Membantu menangani pertanyaan kendala client sesuai SOP toko.

PEDOMAN KETAT:
1. Prioritaskan dan gunakan informasi dari [KNOWLEDGE BASE] di bawah ini untuk menjawab.
2. Jika pelanggan menanyakan status pesanan, paket, atau nomor resi, gunakan data pesanan yang relevan dari KNOWLEDGE BASE. Sebutkan status pesanan, nama kurir, nomor resi, dan estimasi waktu tiba dengan jelas.
3. Selalu sebutkan harga dalam format Rupiah yang rapi (contoh: Rp 1.350.000).
4. Jika ada info yang tidak ada di dalam KNOWLEDGE BASE, jangan mengarang. Sampaikan dengan santun bahwa pelanggan dapat menghubungi CS manusia kami via WhatsApp resmi di kontak toko.
5. Gunakan bahasa Indonesia yang santun, hangat, dan gunakan format markdown (seperti bullet points atau bold) agar mudah dibaca.

====================
[KNOWLEDGE BASE TOKO]:
${relevantContext}
====================`;
  }

  async processChat({ sessionId, message, onChunk }) {
    if (!message || !message.trim()) {
      throw new Error('Pesan tidak boleh kosong.');
    }

    const session = this.getSession(sessionId);

    // Ambil RAG Context dari knowledge base JSON
    const relevantContext = knowledgeService.getRelevantContext(message);

    // Bangun prompt system
    const systemPrompt = this.buildSystemPrompt(relevantContext);

    // Batasi history maksimal 8 pesan terakhir agar prompt tetap ringkas
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
