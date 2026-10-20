import { Router } from 'express';
import { chatService } from '../services/ChatService.js';
import { knowledgeService } from '../services/KnowledgeService.js';
import { config } from '../config/ai.js';

const router = Router();

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
        totalProducts: knowledgeService.getProducts().length,
        totalOrders: knowledgeService.getOrders().length,
        totalFaqs: knowledgeService.getFaqs().length,
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 2. Daftar FAQ
router.get('/faq', (req, res) => {
  res.json({
    status: 'success',
    data: knowledgeService.getFaqs()
  });
});

// 3. Daftar Katalog Produk
router.get('/products', (req, res) => {
  res.json({
    status: 'success',
    data: knowledgeService.getProducts()
  });
});

// 4. Endpoint Utama Chat (Mendukung Streaming SSE & JSON Biasa)
router.post('/chat', async (req, res) => {
  const { sessionId, message, stream = true } = req.body;

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

// 5. Riwayat Chat per Sesi
router.get('/history/:sessionId', (req, res) => {
  const history = chatService.getHistory(req.params.sessionId);
  res.json({
    status: 'success',
    sessionId: req.params.sessionId,
    data: history
  });
});

// 6. Reset Sesi Percakapan
router.post('/reset/:sessionId', (req, res) => {
  const success = chatService.resetSession(req.params.sessionId);
  res.json({
    status: 'success',
    message: success ? 'Sesi percakapan berhasil di-reset.' : 'Sesi tidak ditemukan atau sudah kosong.'
  });
});

export default router;
