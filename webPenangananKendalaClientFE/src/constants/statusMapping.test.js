import { describe, it, expect } from 'vitest';
import { STATUS_ORDER, STATUS_LABEL, PRIORITY_CONFIG } from './statusMapping';

describe('statusMapping', () => {
  it('STATUS_ORDER punya 12 status', () => {
    expect(STATUS_ORDER).toHaveLength(12);
  });

  it('setiap status punya label', () => {
    STATUS_ORDER.forEach((s) => {
      expect(STATUS_LABEL[s]).toBeTruthy();
    });
  });

  it('PRIORITY_CONFIG punya 4 key', () => {
    expect(Object.keys(PRIORITY_CONFIG).sort()).toEqual(
      ['belum_ditentukan', 'high', 'low', 'medium']
    );
  });

  it('priority high pakai border merah', () => {
    expect(PRIORITY_CONFIG.high.border).toContain('border-red-500');
  });
});
