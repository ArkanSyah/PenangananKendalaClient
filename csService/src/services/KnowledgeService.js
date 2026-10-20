import fs from 'fs';
import path from 'path';
import { config } from '../config/ai.js';

class KnowledgeService {
  constructor() {
    this.salesData = null;
    this.faqData = null;
    this.loadData();
  }

  loadData() {
    try {
      const salesPath = path.resolve(config.paths.sales);
      if (fs.existsSync(salesPath)) {
        this.salesData = JSON.parse(fs.readFileSync(salesPath, 'utf-8'));
      } else {
        console.warn(`[KnowledgeService] Sales file not found: ${salesPath}`);
        this.salesData = {};
      }
    } catch (err) {
      console.error('[KnowledgeService] Error loading sales data:', err.message);
      this.salesData = {};
    }

    try {
      const faqPath = path.resolve(config.paths.faq);
      if (fs.existsSync(faqPath)) {
        this.faqData = JSON.parse(fs.readFileSync(faqPath, 'utf-8'));
      } else {
        console.warn(`[KnowledgeService] FAQ file not found: ${faqPath}`);
        this.faqData = [];
      }
    } catch (err) {
      console.error('[KnowledgeService] Error loading FAQ data:', err.message);
      this.faqData = [];
    }
  }

  getStoreInfo() {
    return this.salesData?.toko || null;
  }

  getProducts() {
    return this.salesData?.produk || [];
  }

  getOrders() {
    return this.salesData?.transaksi_pesanan || [];
  }

  getPromos() {
    return this.salesData?.promo_voucher || [];
  }

  getPaymentMethods() {
    return this.salesData?.metode_pembayaran || [];
  }

  getFaqs() {
    return this.faqData || [];
  }

  findOrder(query) {
    if (!query) return null;
    const cleanQuery = query.trim().toLowerCase();
    const orders = this.getOrders();
    return orders.find(o => 
      o.order_id.toLowerCase().includes(cleanQuery) ||
      o.nama_pelanggan.toLowerCase().includes(cleanQuery) ||
      (o.nomor_resi && o.nomor_resi.toLowerCase().includes(cleanQuery))
    );
  }

  getRelevantContext(userMessage) {
    const rawQ = (userMessage || '').toLowerCase();
    const qTokens = rawQ.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const q = rawQ;

    const store = this.getStoreInfo();
    const products = this.getProducts();
    const orders = this.getOrders();
    const promos = this.getPromos();
    const payments = this.getPaymentMethods();
    const faqs = this.getFaqs();

    let contextParts = [];

    // 1. Info Toko & Operasional
    if (store) {
      contextParts.push(`[INFORMASI TOKO]:\nNama: ${store.nama}\nDeskripsi: ${store.deskripsi}\nJam Operasional: ${store.jam_operasional}\nKontak WA: ${store.kontak?.whatsapp}\nEmail: ${store.kontak?.email}\nAlamat: ${store.kontak?.alamat}`);
    }

    // 2. Deteksi Cek Resi / Order / Pesanan
    const isOrderQuery = q.match(/ord-\d{4}-\d{3}/i) || 
      qTokens.some(w => ['pesanan', 'resi', 'paket', 'kirim', 'order', 'status', 'lacak', 'ekspedisi'].includes(w));
      
    if (isOrderQuery) {
      const specificId = (q.match(/ord-\d{4}-\d{3}/i) || [])[0];
      if (specificId) {
        const found = this.findOrder(specificId);
        if (found) {
          contextParts.push(`[DATA PESANAN DITEMUKAN]:\nID: ${found.order_id}\nPelanggan: ${found.nama_pelanggan}\nStatus: ${found.status_pesanan}\nKurir: ${found.kurir}\nNo Resi: ${found.nomor_resi}\nEstimasi Tiba: ${found.estimasi_tiba}\nItem: ${JSON.stringify(found.item)}\nTotal: Rp ${found.total_bayar.toLocaleString('id-ID')}`);
        }
      } else {
        const orderSummary = orders.map(o => `- ${o.order_id} (${o.nama_pelanggan}): Status ${o.status_pesanan}, Kurir ${o.kurir}, Resi ${o.nomor_resi}`).join('\n');
        contextParts.push(`[DATA CONTOH PESANAN SISTEM]:\n${orderSummary}`);
      }
    }

    // 3. Produk & Katalog
    const matchedProducts = products.filter(p => {
      const pText = (p.nama + ' ' + p.kategori + ' ' + p.spesifikasi).toLowerCase();
      return qTokens.some(w => pText.includes(w));
    });

    if (matchedProducts.length > 0) {
      const prodText = matchedProducts.map(p => 
        `- ${p.nama} (${p.kategori}): Rp ${p.harga.toLocaleString('id-ID')} | Stok: ${p.stok} | Garansi: ${p.garansi}\n  Spesifikasi: ${p.spesifikasi}`
      ).join('\n');
      contextParts.push(`[KATALOG PRODUK RELEVAN]:\n${prodText}`);
    } else {
      const allProdSummary = products.map(p => `- ${p.id} ${p.nama} (Rp ${p.harga.toLocaleString('id-ID')}) - Stok: ${p.stok}`).join('\n');
      contextParts.push(`[DAFTAR KATALOG PRODUK]:\n${allProdSummary}`);
    }

    // 4. Promo & Diskon
    const isPromoQuery = qTokens.some(w => ['promo', 'diskon', 'voucher', 'murah', 'hemat', 'cashback', 'ongkir'].includes(w));
    if (isPromoQuery) {
      const promoText = promos.map(pr => `- Kode: ${pr.kode} -> Diskon: ${pr.diskon} (Min belanja: Rp ${pr.minimal_pembelian.toLocaleString('id-ID')}, Berlaku s/d: ${pr.berlaku_sampai})`).join('\n');
      contextParts.push(`[VOUCHER & PROMO AKTIF]:\n${promoText}`);
    }

    // 5. Metode Pembayaran
    const isPayQuery = qTokens.some(w => ['bayar', 'transfer', 'cod', 'rekening', 'qris', 'bca', 'mandiri'].includes(w));
    if (isPayQuery) {
      contextParts.push(`[METODE PEMBAYARAN TERSEDIA]:\n${payments.map(m => '- ' + m).join('\n')}`);
    }

    // 6. FAQ Relevan
    const matchedFaqs = faqs.filter(f => {
      const fText = (f.kategori + ' ' + f.pertanyaan + ' ' + f.jawaban).toLowerCase();
      return qTokens.some(w => fText.includes(w));
    });

    if (matchedFaqs.length > 0) {
      const faqText = matchedFaqs.map(f => `Q: ${f.pertanyaan}\nA: ${f.jawaban}`).join('\n\n');
      contextParts.push(`[PANDUAN & FAQ RELEVAN]:\n${faqText}`);
    } else {
      const defaultFaqText = faqs.map(f => `Q: ${f.pertanyaan}\nA: ${f.jawaban}`).join('\n\n');
      contextParts.push(`[FAQ UMUM]:\n${defaultFaqText}`);
    }

    return contextParts.join('\n\n--------------------\n\n');
  }
}

export const knowledgeService = new KnowledgeService();
