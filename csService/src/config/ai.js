import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(projectRoot, '.env') });

export const config = {
  projectRoot,
  port: process.env.PORT || 3001,
  ai: {
    baseUrl: process.env.AI_BASE_URL || 'http://localhost:20128/v1',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'ag/gemini-3.8-flash-high',
  },
  paths: {
    tickets: path.resolve(projectRoot, process.env.KNOWLEDGE_TICKETS_PATH || './data/data_kendala_client.json'),
    faq: path.resolve(projectRoot, process.env.KNOWLEDGE_FAQ_PATH || './data/faq.json'),
    sessions: path.resolve(projectRoot, process.env.SESSIONS_PATH || './data/sessions.json'),
  }
};
