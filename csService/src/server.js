import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/ai.js';
import { postgres } from './db/postgres.js';
import { knowledgeService } from './services/KnowledgeService.js';
import chatRoutes from './routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static widget files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', chatRoutes);

// Health fallback
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Customer Service AI Microservice is running.',
    storageMode: knowledgeService.storageMode,
    endpoints: {
      health: '/api/health',
      chat: 'POST /api/chat',
      faq: '/api/faq',
      tickets: '/api/tickets',
      customers: '/api/customers',
      history: '/api/history/:sessionId',
      reset: 'POST /api/reset/:sessionId',
      widgetJs: '/widget.js',
      widgetCss: '/widget.css',
    },
  });
});

async function startServer() {
  await knowledgeService.init();
  const counts = await knowledgeService.getDatabaseCountsAsync();

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 Customer Service AI Microservice Running!`);
    console.log(`🔌 Port             : ${config.port}`);
    console.log(`🔌 API Base URL     : http://localhost:${config.port}/api`);
    console.log(`🤖 AI Model         : ${config.ai.model}`);
    console.log(`⚡ Proxy Endpoint   : ${config.ai.baseUrl}`);
    if (postgres.isDbConnected()) {
      console.log(`🐘 Database Engine  : PostgreSQL (${config.db.host}:${config.db.port}/${config.db.database})`);
      console.log(`📊 Knowledge Rows   : ${counts.totalCustomers} Customers | ${counts.totalTickets} Tickets | ${counts.totalFaqs} FAQs`);
    } else {
      console.log(`📁 Knowledge Base   : JSON Fallback (${config.paths.tickets})`);
    }
    console.log(`====================================================`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await postgres.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
