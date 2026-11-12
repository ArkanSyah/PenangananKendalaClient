import { Router } from 'express';
import { chatService } from '../services/ChatService.js';
import { knowledgeService } from '../services/KnowledgeService.js';
import { securityLogger } from '../services/SecurityLogger.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/ai.js';
import { postgres } from '../db/postgres.js';

const router = Router();

function parseSafeInt(value, fallback, { min = 0, max = 100000 } = {}) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < min) return fallback;
  return Math.min(parsed, max);
}

// Pasang Rate Limiter Middleware untuk semua route CS
router.use(rateLimiter.middleware());

// 1. Health check & status (menampilkan koneksi PostgreSQL & metrik data)
router.get('/health', async (req, res) => {
  try {
    const dbCounts = await knowledgeService.getDatabaseCountsAsync();
    const dbConnected = postgres.isDbConnected();

    res.json({
      status: 'ok',
      service: 'Customer Service AI Microservice (Penanganan Kendala Client)',
      aiConfig: {
        baseUrl: config.ai.baseUrl,
        model: config.ai.model,
        hasApiKey: !!config.ai.apiKey,
      },
      database: {
        connected: dbConnected,
        engine: dbConnected ? 'PostgreSQL' : 'JSON Fallback',
        host: dbConnected ? config.db.host : null,
        database: dbConnected ? config.db.database : null,
      },
      knowledgeBase: dbCounts,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 2. Daftar FAQ Helpdesk (dari PostgreSQL)
router.get('/faq', async (req, res) => {
  try {
    const faqs = await knowledgeService.getFaqsAsync();
    res.json({
      status: 'success',
      data: faqs,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 3. Daftar Tiket Terdaftar (Hanya tiket milik pengguna aktif kecuali admin/service desk)
router.get('/tickets', async (req, res) => {
  try {
    const userId = parseSafeInt(req.query.userId, 6, { min: 1 });
    const role = req.query.role || 'client';
    const limit = parseSafeInt(req.query.limit, 120, { min: 1, max: 200 });
    const offset = parseSafeInt(req.query.offset, 0, { min: 0 });

    const allowed = await knowledgeService.getTicketsAsync({ userId, role, limit, offset });
    res.json({
      status: 'success',
      total: allowed.length,
      data: allowed,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 3b. Daftar Pelanggan / Klien (Akses terbatas Admin/Service Desk atau profil sendiri)
router.get('/customers', async (req, res) => {
  try {
    const userId = parseSafeInt(req.query.userId, null, { min: 1 });
    if (!userId) {
      return res.status(401).json({ status: 'error', error: 'Parameter userId valid diperlukan.' });
    }
    const role = req.query.role || 'client';
    const search = req.query.search || '';
    const limit = parseSafeInt(req.query.limit, 50, { min: 1, max: 200 });
    const offset = parseSafeInt(req.query.offset, 0, { min: 0 });

    const customers = await knowledgeService.getCustomersAsync({ userId, role, search, limit, offset });
    res.json({
      status: 'success',
      total: customers.length,
      data: customers,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 4. Daftar Kategori Kendala
router.get('/categories', (req, res) => {
  res.json({
    status: 'success',
    data: knowledgeService.getCategories(),
  });
});

// 5. Endpoint Utama Chat (Mendukung Streaming SSE & JSON Biasa + Ownership Check & Output Filter)
router.post('/chat', async (req, res) => {
  const { sessionId, message, user, stream = true } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  if (!message) {
    return res.status(400).json({ error: 'Field "message" wajib diisi.' });
  }

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      await chatService.processChat({
        sessionId,
        message,
        user,
        ip,
        onChunk: (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        },
      });

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (err) {
      console.error('[Route /chat error]:', err.message);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  } else {
    try {
      const result = await chatService.processChat({
        sessionId,
        message,
        user,
        ip,
      });
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      console.error('[Route /chat error]:', err.message);
      res.status(500).json({
        status: 'error',
        error: err.message,
      });
    }
  }
});

// 6. Riwayat Chat per Sesi (Mendukung Sinkronisasi Konteks Pengguna + PostgreSQL)
router.get('/history/:sessionId', async (req, res) => {
  try {
    const parsedUserId = parseSafeInt(req.query.userId, null, { min: 1 });
    const user = parsedUserId
      ? {
          id: parsedUserId,
          role: req.query.role || 'client',
          name: req.query.name || '',
        }
      : undefined;
    const history = await chatService.getHistoryAsync(req.params.sessionId, user);
    res.json({
      status: 'success',
      sessionId: req.params.sessionId,
      data: history,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 7. Reset Sesi Percakapan (PostgreSQL + Cache Memori)
router.post('/reset/:sessionId', async (req, res) => {
  try {
    const success = await chatService.resetSessionAsync(req.params.sessionId);
    res.json({
      status: 'success',
      message: success ? 'Sesi percakapan berhasil di-reset.' : 'Sesi tidak ditemukan atau sudah kosong.',
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 8. Audit Log Keamanan (Internal Monitoring untuk Deteksi Pola Probing)
router.get('/security/events', async (req, res) => {
  try {
    const limit = parseSafeInt(req.query.limit, 50, { min: 1, max: 200 });
    const events = await securityLogger.getRecentEventsAsync(limit);
    res.json({
      status: 'success',
      data: events,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;
