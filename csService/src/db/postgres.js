import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../config/ai.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PostgresClient {
  constructor() {
    this.pool = null;
    this.connected = false;
    this.lastError = null;
  }

  getPoolConfig() {
    if (config.db.connectionString) {
      return {
        connectionString: config.db.connectionString,
        max: config.db.max,
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 30000,
      };
    }

    return {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      max: config.db.max,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
    };
  }

  async init({ force = false } = {}) {
    if (!config.db.enabled && !force) {
      this.connected = false;
      return false;
    }

    if (this.pool && this.connected) {
      return true;
    }

    try {
      this.pool = new Pool(this.getPoolConfig());
      this.pool.on('error', (err) => {
        console.error('[Postgres] Unexpected pool error:', err.message);
        this.connected = false;
        this.lastError = err.message;
      });

      await this.pool.query('SELECT 1');
      this.connected = true;
      this.lastError = null;
      return true;
    } catch (err) {
      this.connected = false;
      this.lastError = err.message;
      console.warn('[Postgres] Database connection failed, using fallback mode:', err.message);
      if (this.pool) {
        await this.pool.end().catch(() => {});
        this.pool = null;
      }
      return false;
    }
  }

  async applySchema() {
    if (!this.pool) {
      throw new Error('PostgreSQL pool is not initialized.');
    }
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    await this.pool.query(sql);
  }

  isDbConnected() {
    return !!(this.pool && this.connected);
  }

  async query(text, params = []) {
    if (!this.isDbConnected()) {
      throw new Error('PostgreSQL is not connected.');
    }
    return this.pool.query(text, params);
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connected = false;
    }
  }
}

export const postgres = new PostgresClient();
