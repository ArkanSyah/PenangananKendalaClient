import { describe, it, expect, beforeEach } from 'vitest';
import {
  groupTicketsByStatus,
  formatRelativeTime,
  getPriorityConfig,
  loadBoardLayout,
  saveBoardLayout,
} from './boardUtils';
import { STATUS_ORDER } from '../constants/statusMapping';

describe('formatRelativeTime', () => {
  it('null → "-"', () => {
    expect(formatRelativeTime(null)).toBe('-');
  });

  it('< 60 detik → "baru saja"', () => {
    expect(formatRelativeTime(new Date())).toBe('baru saja');
  });

  it('5 menit lalu', () => {
    expect(formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000))).toBe('5 menit lalu');
  });

  it('3 jam lalu', () => {
    expect(formatRelativeTime(new Date(Date.now() - 3 * 60 * 60 * 1000))).toBe('3 jam lalu');
  });

  it('2 hari lalu', () => {
    expect(formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))).toBe('2 hari lalu');
  });
});

describe('groupTicketsByStatus', () => {
  it('mengembalikan 12 key status', () => {
    const result = groupTicketsByStatus([]);
    expect(Object.keys(result).sort()).toEqual([...STATUS_ORDER].sort());
  });

  it('mengelompokkan tiket sesuai status', () => {
    const tickets = [
      { id: 1, status: 'open' },
      { id: 2, status: 'in_progress' },
      { id: 3, status: 'open' },
    ];
    const result = groupTicketsByStatus(tickets);
    expect(result.open).toHaveLength(2);
    expect(result.in_progress).toHaveLength(1);
    expect(result.closed).toHaveLength(0);
  });
});

describe('getPriorityConfig', () => {
  it('high → label "High"', () => {
    expect(getPriorityConfig('high').label).toBe('High');
  });

  it('fallback untuk priority invalid', () => {
    expect(getPriorityConfig('invalid').label).toBe('—');
    expect(getPriorityConfig(undefined).label).toBe('—');
  });
});

describe('sessionStorage layout', () => {
  beforeEach(() => sessionStorage.clear());

  it('loadBoardLayout null kalau kosong', () => {
    expect(loadBoardLayout()).toBeNull();
  });

  it('save & load layout', () => {
    const layout = { open: [1, 2], closed: [3] };
    saveBoardLayout(layout);
    expect(loadBoardLayout()).toEqual(layout);
  });
});

