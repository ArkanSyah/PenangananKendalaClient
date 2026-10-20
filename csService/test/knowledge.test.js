import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { knowledgeService } from '../src/services/KnowledgeService.js';

describe('KnowledgeService Tests', () => {
  test('Memuat informasi sistem Helpdesk dengan benar', () => {
    const sistem = knowledgeService.getSystemInfo();
    assert.ok(sistem, 'Sistem info harus ada');
    assert.match(sistem.nama, /Penanganan Kendala Client/i);
    assert.ok(sistem.kontak_helpdesk?.whatsapp, 'Kontak WA helpdesk harus tersedia');
  });

  test('Memuat 5 kategori kendala IT lengkap', () => {
    const categories = knowledgeService.getCategories();
    assert.equal(categories.length, 5);
    const codes = categories.map(c => c.kode);
    assert.ok(codes.includes('SW'), 'Kategori Software harus ada');
    assert.ok(codes.includes('HW'), 'Kategori Hardware harus ada');
    assert.ok(codes.includes('NET'), 'Kategori Jaringan harus ada');
    assert.ok(codes.includes('ACC'), 'Kategori Akun harus ada');
    assert.ok(codes.includes('WI'), 'Kategori Walk-in harus ada');
  });

  test('Dapat menemukan tiket berdasarkan Ticket ID', () => {
    const ticket = knowledgeService.findTicket('TCK-202610-0001');
    assert.ok(ticket, 'Tiket TCK-202610-0001 harus ditemukan');
    assert.equal(ticket.ticket_id, 'TCK-202610-0001');
    assert.equal(ticket.status, 'pending_confirmation');
    assert.equal(ticket.kategori, 'Software');
    assert.match(ticket.judul, /Error 500/i);
  });

  test('Mengembalikan null jika nomor tiket tidak terdaftar', () => {
    const ticket = knowledgeService.findTicket('TCK-999999-9999');
    assert.equal(ticket, null);
  });

  test('Menghasilkan konteks RAG yang relevan untuk pertanyaan kendala login', () => {
    const context = knowledgeService.getRelevantContext('Saya mengalami error 500 saat login portal');
    assert.ok(context.includes('TCK-202610-0001'), 'Harus menyertakan tiket terkait error 500');
    assert.ok(context.includes('Solusi / Rekomendasi Sementara'), 'Harus ada solusi sementara');
  });

  test('Menghasilkan alur workflow tiket pada pertanyaan seputar SLA & alur status', () => {
    const context = knowledgeService.getRelevantContext('Bagaimana alur status workflow dan SLA tiket?');
    assert.ok(context.includes('ALUR WORKFLOW STATUS TIKET'), 'Harus memuat data workflow');
    assert.ok(context.includes('SERVICE LEVEL AGREEMENT'), 'Harus memuat data SLA');
  });
});
