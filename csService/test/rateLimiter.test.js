import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimiter } from '../src/middleware/rateLimiter.js';

describe('RateLimiter Middleware (Per Session & Per IP)', () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  function createMockReqRes({ ip = '127.0.0.1', sessionId = 'sess-1' } = {}) {
    const req = {
      headers: { 'x-forwarded-for': ip },
      body: { sessionId },
      socket: { remoteAddress: ip }
    };
    const res = {
      statusCode: 200,
      headers: {},
      jsonData: null,
      setHeader(k, v) { this.headers[k] = v; },
      status(code) { this.statusCode = code; return this; },
      json(data) { this.jsonData = data; return this; }
    };
    return { req, res };
  }

  test('Request pertama lolos tanpa hambatan', () => {
    const { req, res } = createMockReqRes();
    let nextCalled = false;
    rateLimiter.middleware()(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  });

  test('Menolak burst flood jika request kedua dikirim < 500ms', () => {
    const { req: req1, res: res1 } = createMockReqRes({ sessionId: 'burst-sess' });
    let next1 = false;
    rateLimiter.middleware()(req1, res1, () => { next1 = true; });
    assert.equal(next1, true);

    const { req: req2, res: res2 } = createMockReqRes({ sessionId: 'burst-sess' });
    let next2 = false;
    rateLimiter.middleware()(req2, res2, () => { next2 = true; });

    assert.equal(next2, false, 'Next tidak boleh dipanggil');
    assert.equal(res2.statusCode, 429);
    assert.equal(res2.jsonData.code, 'BURST_LIMIT_EXCEEDED');
  });

  test('Membatasi request sesi maksimal 15 request per menit', () => {
    const sessionId = 'session-limit-test';

    // Kirim 15 request dengan jarak waktu manual
    for (let i = 0; i < 15; i++) {
      const { req, res } = createMockReqRes({ sessionId });
      rateLimiter.sessionLastTime.set(sessionId, 0); // bypass burst check
      let nextCalled = false;
      rateLimiter.middleware()(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true, `Request ${i + 1} harus lolos`);
    }

    // Request ke-16 harus ditolak 429
    const { req: req16, res: res16 } = createMockReqRes({ sessionId });
    rateLimiter.sessionLastTime.set(sessionId, 0);
    let next16 = false;
    rateLimiter.middleware()(req16, res16, () => { next16 = true; });

    assert.equal(next16, false);
    assert.equal(res16.statusCode, 429);
    assert.equal(res16.jsonData.code, 'SESSION_RATE_LIMIT_EXCEEDED');
  });

  test('Membatasi request IP maksimal 30 request per menit', () => {
    const ip = '192.168.1.100';

    for (let i = 0; i < 30; i++) {
      const { req, res } = createMockReqRes({ ip, sessionId: `sess-${i}` });
      rateLimiter.sessionLastTime.set(`sess-${i}`, 0);
      let nextCalled = false;
      rateLimiter.middleware()(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true, `Request ${i + 1} harus lolos`);
    }

    // Request ke-31 harus ditolak 429
    const { req: req31, res: res31 } = createMockReqRes({ ip, sessionId: 'sess-31' });
    rateLimiter.sessionLastTime.set('sess-31', 0);
    let next31 = false;
    rateLimiter.middleware()(req31, res31, () => { next31 = true; });

    assert.equal(next31, false);
    assert.equal(res31.statusCode, 429);
    assert.equal(res31.jsonData.code, 'IP_RATE_LIMIT_EXCEEDED');
  });
});
