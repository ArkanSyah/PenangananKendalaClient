import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/ai.js';
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
    endpoints: {
      health: '/api/health',
      chat: 'POST /api/chat',
      faq: '/api/faq',
      products: '/api/products',
      widgetJs: '/widget.js',
      widgetCss: '/widget.css'
    }
  });
});

// Start Server
app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 Customer Service AI Microservice Running!`);
  console.log(`🔌 Port             : ${config.port}`);
  console.log(`🔌 API Base URL     : http://localhost:${config.port}/api`);
  console.log(`🤖 AI Model         : ${config.ai.model}`);
  console.log(`⚡ Proxy Endpoint   : ${config.ai.baseUrl}`);
  console.log(`📁 Knowledge Base   : ${config.paths.sales}`);
  console.log(`====================================================`);
});
