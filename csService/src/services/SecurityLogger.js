import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, '../../logs');
const logFilePath = path.join(logsDir, 'security.log');

class SecurityLogger {
  constructor() {
    this.probingTracker = new Map(); // key: ip or sessionId, value: Array<timestamp>
    this.probingThreshold = 3; // 3 pelanggaran dalam window
    this.probingWindowMs = 5 * 60 * 1000; // 5 menit

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Mencatat kejadian keamanan dan memeriksa apakah terindikasi pola probing
   */
  logEvent({ eventType, severity = 'WARN', ip = 'unknown', sessionId = 'unknown', userId = null, details = {} }) {
    const timestamp = new Date().toISOString();
    const trackerKey = `${ip}:${sessionId}`;

    // 1. Catat timestamp pelanggaran ke tracker probing
    const now = Date.now();
    let history = this.probingTracker.get(trackerKey) || [];
    history = history.filter(t => now - t < this.probingWindowMs);
    history.push(now);
    this.probingTracker.set(trackerKey, history);

    const isProbingPattern = history.length >= this.probingThreshold;

    const entry = {
      timestamp,
      severity: isProbingPattern ? 'ALERT' : severity,
      eventType: isProbingPattern ? 'SUSPICIOUS_PROBING_DETECTED' : eventType,
      originalEvent: isProbingPattern ? eventType : undefined,
      violationCount: history.length,
      ip,
      sessionId,
      userId,
      details,
    };

    const logLine = JSON.stringify(entry) + '\n';

    try {
      fs.appendFileSync(logFilePath, logLine, 'utf-8');
    } catch (err) {
      console.error('[SecurityLogger Error]: Gagal menulis log:', err.message);
    }

    if (entry.severity === 'ALERT' || entry.severity === 'CRITICAL') {
      console.warn(`[SECURITY ALERT] ${entry.eventType} dari IP=${ip} Sesi=${sessionId}:`, details);
    }

    return entry;
  }

  getRecentEvents(limit = 50) {
    try {
      if (!fs.existsSync(logFilePath)) return [];
      const lines = fs.readFileSync(logFilePath, 'utf-8').trim().split('\n');
      return lines.slice(-limit).map(l => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(Boolean);
    } catch {
      return [];
    }
  }

  resetTracker() {
    this.probingTracker.clear();
  }
}

export const securityLogger = new SecurityLogger();
