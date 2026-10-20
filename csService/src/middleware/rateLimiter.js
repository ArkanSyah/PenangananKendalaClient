import { securityLogger } from '../services/SecurityLogger.js';

class RateLimiter {
  constructor() {
    this.ipLimits = new Map();       // ip -> Array<timestamp>
    this.sessionLimits = new Map();  // sessionId -> Array<timestamp>
    this.sessionLastTime = new Map();// sessionId -> lastRequestTimestamp

    this.maxIpPerMinute = 30;
    this.maxSessionPerMinute = 15;
    this.minBurstIntervalMs = 500;   // Minimal jarak antar request per sesi 500ms
    this.windowMs = 60 * 1000;
  }

  getCleanedHistory(map, key, now) {
    let history = map.get(key) || [];
    history = history.filter(t => now - t < this.windowMs);
    return history;
  }

  middleware() {
    return (req, res, next) => {
      const now = Date.now();
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
      const sessionId = req.body?.sessionId || req.params?.sessionId || req.query?.sessionId || 'anonymous';

      // 1. Cek Burst Rate (Mencegah flooding otomatis sekejap)
      const lastSessionTime = this.sessionLastTime.get(sessionId) || 0;
      if (now - lastSessionTime < this.minBurstIntervalMs) {
        securityLogger.logEvent({
          eventType: 'BURST_FLOOD_DETECTED',
          severity: 'WARN',
          ip,
          sessionId,
          details: { diffMs: now - lastSessionTime, minAllowed: this.minBurstIntervalMs }
        });
        res.setHeader('Retry-After', '1');
        return res.status(429).json({
          status: 'error',
          code: 'BURST_LIMIT_EXCEEDED',
          error: 'Permintaan terlalu cepat. Mohon tunggu sesaat sebelum mengirim pesan berikutnya.'
        });
      }

      // 2. Cek Rate Limit per Sesi (15 request / menit)
      const sessionHistory = this.getCleanedHistory(this.sessionLimits, sessionId, now);
      if (sessionHistory.length >= this.maxSessionPerMinute) {
        securityLogger.logEvent({
          eventType: 'SESSION_RATE_LIMIT_EXCEEDED',
          severity: 'WARN',
          ip,
          sessionId,
          details: { count: sessionHistory.length, limit: this.maxSessionPerMinute }
        });
        res.setHeader('Retry-After', '60');
        return res.status(429).json({
          status: 'error',
          code: 'SESSION_RATE_LIMIT_EXCEEDED',
          error: 'Batas pesan sesi tercapai (maksimal 15 pesan/menit). Mohon tunggu 1 menit.'
        });
      }

      // 3. Cek Rate Limit per IP (30 request / menit)
      const ipHistory = this.getCleanedHistory(this.ipLimits, ip, now);
      if (ipHistory.length >= this.maxIpPerMinute) {
        securityLogger.logEvent({
          eventType: 'IP_RATE_LIMIT_EXCEEDED',
          severity: 'WARN',
          ip,
          sessionId,
          details: { count: ipHistory.length, limit: this.maxIpPerMinute }
        });
        res.setHeader('Retry-After', '60');
        return res.status(429).json({
          status: 'error',
          code: 'IP_RATE_LIMIT_EXCEEDED',
          error: 'Batas permintaan IP tercapai (maksimal 30 request/menit). Mohon tunggu sebentar.'
        });
      }

      // Catat request yang lolos
      sessionHistory.push(now);
      this.sessionLimits.set(sessionId, sessionHistory);
      this.sessionLastTime.set(sessionId, now);

      ipHistory.push(now);
      this.ipLimits.set(ip, ipHistory);

      next();
    };
  }

  reset() {
    this.ipLimits.clear();
    this.sessionLimits.clear();
    this.sessionLastTime.clear();
  }
}

export const rateLimiter = new RateLimiter();
