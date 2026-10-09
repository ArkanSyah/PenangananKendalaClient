import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, AlertCircle, CheckCircle, ArrowRight, ShieldAlert, Copy, Check } from 'lucide-react';

export const CreateTicket = () => {
  const navigate = useNavigate();
  const [openTickets, setOpenTickets] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [escalatePriority, setEscalatePriority] = useState('belum_ditentukan');
  const [escalateCategory, setEscalateCategory] = useState('Software');
  const [submitting, setSubmitting] = useState(false);

  const handleCopy = (idStr) => {
    navigator.clipboard.writeText(idStr);
    setCopiedId(idStr);
    setTimeout(() => setCopiedId(''), 2000);
  };

  // Fetch pending raw open tickets for dropdown selection
  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        const response = await axios.get('/tickets');
        const pending = response.data.filter(t => t.status === 'open');
        setOpenTickets(pending);
      } catch (err) {
        console.error("Gagal memuat antrean tiket open", err);
      }
    };
    fetchOpenTickets();
  }, []);

  const handleLookup = async (idToSearch) => {
    const targetId = (idToSearch || searchId || selectedTicketId).trim();
    if (!targetId) {
      setError('Masukkan ID Tiket atau pilih tiket dari daftar.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`/tickets/${targetId}`);
      setActiveTicket(response.data);
      setEscalatePriority(response.data.priority || 'belum_ditentukan');
      setEscalateCategory(response.data.category || 'Software');
      setIsModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || `Tiket dengan ID "${targetId}" tidak ditemukan atau belum terdaftar.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!internalNotes.trim()) {
      setError('Catatan internal wajib diisi oleh Service Desk.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.patch(`/tickets/${activeTicket.ticket_id || activeTicket.id}/escalate`, {
        internal_notes: internalNotes,
        priority: escalatePriority,
        category: escalateCategory
      });

      setIsModalOpen(false);
      setInternalNotes('');
      setSuccess(`Tiket ${activeTicket.ticket_id} berhasil dieskalasikan ke Project Manager.`);
      setTimeout(() => {
        navigate('/tickets');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melakukan eskalasi tiket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full text-left">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Eskalasi Tiket Klien (Service Desk)</h2>
        <p className="text-sm text-slate-500">Cari ID Tiket yang diajukan oleh Klien untuk meninjau dan meneruskannya ke antrean PM</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-4 rounded-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Ticket Lookup Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col gap-6">
        
        {/* Method 1: Dropdown Select from Open Queue */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Pilih Tiket Klien yang Masih Open
          </label>
          <select
            className="w-full text-xs border border-slate-300 rounded-sm px-3.5 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150 cursor-pointer"
            value={selectedTicketId}
            onChange={(e) => {
              setSelectedTicketId(e.target.value);
              setSearchId(e.target.value);
            }}
          >
            <option value="">-- Pilih dari Tiket Klien Masuk ({openTickets.length} tiket open) --</option>
            {openTickets.map(t => (
              <option key={t.id} value={t.ticket_id || t.id}>
                {t.ticket_id || `TCK-${t.id}`} — {t.title} (Dilaporkan oleh: {t.creator?.name})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase">Atau Masukkan Manual</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Method 2: Manual Ticket ID Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Masukkan ID Tiket Klien
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full text-xs border border-slate-300 rounded-sm pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150 font-mono"
                placeholder="Contoh: TCK-202608-0001"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="button"
              onClick={() => handleLookup()}
              disabled={loading}
              className="py-2.5 px-6 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-sm transition-colors cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>{loading ? 'Memuat...' : 'Cari & Tinjau Tiket'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Escalation Modal */}
      {isModalOpen && activeTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl flex flex-col gap-4 text-left">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">Form Eskalasi Tiket ke Project Manager</h3>
              </div>
              <p className="text-xs text-slate-500">
                Informasi laporan klien dikunci (Read-Only) untuk menjaga keaslian laporan.
              </p>
            </div>

            {/* Read-Only Client Info Fields */}
            <div className="flex flex-col gap-3 text-xs max-h-80 overflow-y-auto pr-1 bg-slate-50 border border-slate-200 p-4 rounded-sm">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ID Tiket</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="w-full text-xs border border-slate-200 bg-white rounded px-3 py-2 text-slate-700 font-mono font-bold"
                    value={activeTicket.ticket_id || `TCK-${activeTicket.id}`}
                    disabled
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(activeTicket.ticket_id || `TCK-${activeTicket.id}`)}
                    className="p-2 border border-slate-200 bg-white hover:bg-slate-100 rounded text-slate-500 shrink-0 cursor-pointer"
                    title="Salin ID Tiket"
                  >
                    {copiedId === (activeTicket.ticket_id || `TCK-${activeTicket.id}`) ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Klien</label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 bg-white rounded px-3 py-2 text-slate-700 font-semibold"
                  value={activeTicket.creator?.name || ''}
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Judul Tiket</label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 bg-white rounded px-3 py-2 text-slate-700 font-semibold"
                  value={activeTicket.title || ''}
                  disabled
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori Masalah <span className="text-primary">*</span>
                  </label>
                  <select
                    className="w-full text-xs border border-slate-300 bg-white rounded px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-primary cursor-pointer"
                    value={escalateCategory}
                    onChange={(e) => setEscalateCategory(e.target.value)}
                  >
                    <option value="Jaringan">Jaringan</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Akun">Akun</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Skala Prioritas <span className="text-primary">*</span>
                  </label>
                  <select
                    className="w-full text-xs border border-slate-300 bg-white rounded px-3 py-2 text-slate-800 font-bold uppercase focus:outline-none focus:border-primary cursor-pointer"
                    value={escalatePriority}
                    onChange={(e) => setEscalatePriority(e.target.value)}
                  >
                    <option value="belum_ditentukan">Belum Ditentukan</option>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deskripsi Masalah Klien</label>
                <textarea
                  className="w-full text-xs border border-slate-200 bg-white rounded px-3 py-2 text-slate-700 leading-normal"
                  rows="3"
                  value={activeTicket.description || ''}
                  disabled
                  readOnly
                />
              </div>
            </div>

            {/* Mandatory Service Desk Internal Notes Form */}
            <form onSubmit={handleEscalateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5">
                  Catatan Internal Service Desk <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full text-xs border border-slate-300 rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150 bg-white"
                  rows="4"
                  placeholder="Klien mengeluhkan sistem lambat (kategori: Jaringan). Sudah dicek koneksi stabil, sepertinya error dari sisi server backend. Mohon PM untuk mengecek log server."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-sm transition-colors cursor-pointer"
                  disabled={submitting}
                >
                  {submitting ? 'Mengirim Eskalasi...' : 'Kirim Eskalasi ke PM'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setInternalNotes('');
                  }}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-sm transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
