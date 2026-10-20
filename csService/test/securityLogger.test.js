import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { securityLogger } from '../src/services/SecurityLogger.js';

describe('SecurityLogger & Probing Detection Tests', () => {
  beforeEach(() => {
    securityLogger.resetTracker();
  });

  test('Mencatat event pelanggaran keamanan tunggal dengan status WARN', () => {
    const entry = securityLogger.logEvent({
      eventType: 'PROMPT_INJECTION_DETECTED',
      severity: 'WARN',
      ip: '10.0.0.1',
      sessionId: 'sess-probe-1',
      details: { reason: 'System override' }
    });

    assert.equal(entry.eventType, 'PROMPT_INJECTION_DETECTED');
    assert.equal(entry.severity, 'WARN');
    assert.equal(entry.violationCount, 1);
  });

  test('Mendeteksi pola probing jika terdapat 3 pelanggaran beruntun dalam window 5 menit', () => {
    const ip = '10.0.0.99';
    const sessionId = 'sess-attacker';

    // Pelanggaran 1
    const e1 = securityLogger.logEvent({
      eventType: 'UNAUTHORIZED_TICKET_ACCESS',
      ip, sessionId
    });
    assert.equal(e1.eventType, 'UNAUTHORIZED_TICKET_ACCESS');

    // Pelanggaran 2
    const e2 = securityLogger.logEvent({
      eventType: 'PROMPT_INJECTION_DETECTED',
      ip, sessionId
    });
    assert.equal(e2.eventType, 'PROMPT_INJECTION_DETECTED');

    // Pelanggaran 3 -> Harus berubah menjadi SUSPICIOUS_PROBING_DETECTED dengan severity ALERT!
    const e3 = securityLogger.logEvent({
      eventType: 'PROMPT_INJECTION_DETECTED',
      ip, sessionId
    });
    assert.equal(e3.eventType, 'SUSPICIOUS_PROBING_DETECTED');
    assert.equal(e3.severity, 'ALERT');
    assert.equal(e3.violationCount, 3);
  });
});
