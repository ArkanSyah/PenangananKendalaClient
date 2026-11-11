import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { postgres } from '../src/db/postgres.js';
import { knowledgeService } from '../src/services/KnowledgeService.js';
import { chatService } from '../src/services/ChatService.js';

describe('PostgreSQL Database Integration Tests (100+ Dataset & RAG SQL)', () => {
  let dbReady = false;

  before(async () => {
    dbReady = await knowledgeService.init();
  });

  after(async () => {
    await postgres.close();
  });

  test('Koneksi PostgreSQL aktif dan dataset utama minimal 100 data tersedia (customers & tickets)', async (t) => {
    if (!dbReady) {
      t.skip('PostgreSQL tidak diaktifkan di lingkungan ini (DB_ENABLED=false)');
      return;
    }

    const counts = await knowledgeService.getDatabaseCountsAsync();
    assert.equal(counts.storageMode, 'postgresql');
    assert.ok(counts.totalCustomers >= 100, `Expected >= 100 customers, got ${counts.totalCustomers}`);
    assert.ok(counts.totalTickets >= 100, `Expected >= 100 tickets, got ${counts.totalTickets}`);
    assert.ok(counts.totalFaqs >= 20, `Expected >= 20 FAQs, got ${counts.totalFaqs}`);
  });

  test('RAG SQL mengisolasi data tiket milik klien vs admin/service desk di PostgreSQL', async (t) => {
    if (!dbReady) {
      t.skip('PostgreSQL tidak diaktifkan di lingkungan ini');
      return;
    }

    // Klien ID 6 tidak boleh melihat tiket milik user_id 1 (TCK-202610-0007)
    const denied = await knowledgeService.findTicketAsync('TCK-202610-0007', { id: 6, role: 'client', name: 'Corporate Client' });
    assert.equal(denied.unauthorized, true);
    assert.equal(denied.isGuest, false);

    // Klien ID 6 boleh melihat tiket miliknya sendiri
    const own = await knowledgeService.findTicketAsync('TCK-202610-0001', { id: 6, role: 'client', name: 'Corporate Client' });
    assert.equal(own.unauthorized, undefined);
    assert.equal(own.ticket_id, 'TCK-202610-0001');

    // Admin melihat statistik agregasi lengkap (100+ data) di konteks RAG SQL
    const adminCtx = await knowledgeService.getRelevantContextAsync(
      'Berapa total pelanggan dan tiket urgent saat ini?',
      { id: 7, role: 'admin', name: 'System Administrator' }
    );
    assert.match(adminCtx, /RINGKASAN STATISTIK DATABASE POSTGRESQL/);
    assert.match(adminCtx, /Total Seluruh Tiket Kendala:/);
    assert.match(adminCtx, /Total Pelanggan Terdaftar:/);

    // Klien biasa TIDAK boleh mendapatkan statistik direktori seluruh pelanggan
    const clientCtx = await knowledgeService.getRelevantContextAsync(
      'Berapa total pelanggan terdaftar?',
      { id: 6, role: 'client', name: 'Corporate Client' }
    );
    assert.doesNotMatch(clientCtx, /RINGKASAN STATISTIK DATABASE POSTGRESQL/);
  });

  test('Persistensi sesi dan pesan percakapan ke tabel chat_sessions & chat_messages PostgreSQL', async (t) => {
    if (!dbReady) {
      t.skip('PostgreSQL tidak diaktifkan di lingkungan ini');
      return;
    }

    const testSessionId = 'pg-test-sess-' + Date.now();
    const session = chatService.getSession(testSessionId, { id: 6, role: 'client', name: 'Corporate Client' });

    await chatService.persistTurn(session, 'Cek koneksi PostgreSQL', 'Koneksi PostgreSQL aktif dan sehat.');

    const loaded = await chatService.getHistoryAsync(testSessionId);
    assert.equal(loaded.length, 2);
    assert.equal(loaded[0].content, 'Cek koneksi PostgreSQL');
    assert.equal(loaded[1].content, 'Koneksi PostgreSQL aktif dan sehat.');

    const resetOk = await chatService.resetSessionAsync(testSessionId);
    assert.equal(resetOk, true);

    const afterReset = await chatService.getHistoryAsync(testSessionId);
    assert.equal(afterReset.length, 0);
  });

  test('Pencarian RAG SQL menyaring stopwords dan memeringkat hasil FAQ/Tiket paling relevan', async (t) => {
    if (!dbReady) {
      t.skip('PostgreSQL tidak diaktifkan di lingkungan ini');
      return;
    }

    const ctx = await knowledgeService.getRelevantContextAsync(
      'Bagaimana cara mengatasi printer thermal barcode kantor yang statusnya offline spooling macet?',
      null
    );
    assert.match(ctx, /Print Spooler/i, 'Harus mengangkat FAQ Printer Spooler teratas walau didahului stopwords');

    // PM / Owner dapat mengakses tiket eskalasi TCK-202610-0007
    const ownerLookup = await knowledgeService.findTicketAsync('TCK-202610-0007', {
      id: 5,
      role: 'owner',
      name: 'Company Owner',
    });
    assert.equal(ownerLookup.unauthorized, undefined);
    assert.equal(ownerLookup.ticket_id, 'TCK-202610-0007');
  });
});
