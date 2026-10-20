import { Router } from 'express';
import { chatService } from '../services/ChatService.js';
import { knowledgeService } from '../services/KnowledgeService.js';
import { securityLogger } from '../services/SecurityLogger.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/ai.js';

const router = Router();

// Pasang Rate Limiter Middleware untuk semua route CS
router.use(rateLimiter.middleware());

// 1. Health check & status
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      service: 'Customer Service AI Microservice (Penanganan Kendala Client)',
      aiConfig: {
        baseUrl: config.ai.baseUrl,
        model: config.ai.model,
        hasApiKey: !!config.ai.apiKey
      },
      knowledgeBase: {
        totalTickets: knowledgeService.getTickets().length,
        totalCategories: knowledgeService.getCategories().length,
        totalFaqs: knowledgeService.getFaqs().length,
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 2. Daftar FAQ Helpdesk
router.get('/faq', (req, res) => {
  res.json({
    status: 'success',
    data: knowledgeService.getFaqs()
  });
});

// 3. Daftar Tiket Terdaftar (Hanya tiket milik pengguna aktif kecuali admin/service desk)
router.get('/tickets', (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId) : 6;
  const role = req.query.role || 'client';
  const tickets = knowledgeService.getTickets();
  const allowed = (role === 'admin' || role === 'service_desk')
    ? tickets
    : tickets.filter(t => t.user_id === userId);

  res.json({
    status: 'success',
    data: allowed
  });
});

// 4. Daftar Kategori Kendala
router.get('/categories', (req, res) => {
  res.json({
    status: 'success',
    data: knowledgeService.getCategories()
  });
});

// 5. Endpoint Utama Chat (Mendukung Streaming SSE & JSON Biasa + Ownership Check & Output Filter)
router.post('/chat', async (req, res) => {
  const { sessionId, message, user, stream = true } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  if (!message) {
    return res.status(400).json({ error: 'Field "message" wajib diisi.' });
  }

  // Jika client meminta streaming SSE
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
        }
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
    // Non-streaming response biasa (JSON)
    try {
      const result = await chatService.processChat({
        sessionId,
        message,
        user,
        ip
      });
      res.json({
        status: 'success',
        data: result
      });
    } catch (err) {
      console.error('[Route /chat error]:', err.message);
      res.status(500).json({
        status: 'error',
        error: err.message
      });
    }
  }
});

// 6. Riwayat Chat per Sesi
router.get('/history/:sessionId', (req, res) => {
  const history = chatService.getHistory(req.params.sessionId);
  res.json({
    status: 'success',
    sessionId: req.params.sessionId,
    data: history
  });
});

// 7. Reset Sesi Percakapan
router.post('/reset/:sessionId', (req, res) => {
  const success = chatService.resetSession(req.params.sessionId);
  res.json({
    status: 'success',
    message: success ? 'Sesi percakapan berhasil di-reset.' : 'Sesi tidak ditemukan atau sudah kosong.'
  });
});

// 8. Audit Log Keamanan (Internal Monitoring untuk Deteksi Pola Probing)
router.get('/security/events', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  res.json({
    status: 'success',
    data: securityLogger.getRecentEvents(limit)
  });
});

export default router;
