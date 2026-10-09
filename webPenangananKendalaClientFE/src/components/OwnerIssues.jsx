import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Crown,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  AlertTriangle,
  FileText,
  User,
  FileDown,
  ShieldAlert,
  Inbox,
  X,
  CheckCheck,
} from 'lucide-react';
import { SkeletonStatCards } from './SkeletonLoader';

export const OwnerIssues = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'returned' | 'rejected' | 'all'

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [decision, setDecision] = useState('approved'); // 'approved' | 'resolved' | 'returned_to_pm' | 'rejected'
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error("Gagal memuat data laporan issue owner", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter helper: Is this ticket relevant to owner escalation?
  const isOwnerEscalatedTicket = (ticket) => {
    if (ticket.status === 'escalated_to_owner') return true;
    if (ticket.assigned_to_role === 'OWNER') return true;
    // Check if progress logs indicate owner involvement
    const hasOwnerLog = ticket.progress_logs?.some(
      (l) => l.new_status === 'escalated_to_owner' || l.notes?.includes('Keputusan Owner') || l.notes?.includes('[OWNER_DECISION') || l.notes?.includes('Dieskalasikan ke Owner')
    );
    return hasOwnerLog;
  };

  const ownerTickets = tickets.filter(isOwnerEscalatedTicket);

  // Helper checks for ticket log decisions
  const isTicketApprovedByOwner = (t) =>
    t.progress_logs?.some((l) => l.notes?.includes('[OWNER_DECISION_APPROVED]') || l.notes?.includes('[OWNER_DECISION_RESOLVED]') || (l.notes?.includes('Keputusan Owner') && l.notes?.includes('Disetujui')));

  const isTicketReturnedByOwner = (t) =>
    t.progress_logs?.some((l) => l.notes?.includes('[OWNER_DECISION_RETURNED]') || (l.notes?.includes('Keputusan Owner') && l.notes?.includes('Dikembalikan')));

  const isTicketRejectedByOwner = (t) =>
    t.status === 'rejected' && t.progress_logs?.some((l) => l.notes?.includes('[OWNER_DECISION_REJECTED]') || l.notes?.includes('Keputusan Owner'));

  // Metrics calculation
  const stats = {
    pending: ownerTickets.filter((t) => t.status === 'escalated_to_owner').length,
    approved: ownerTickets.filter(isTicketApprovedByOwner).length,
    returned: ownerTickets.filter(isTicketReturnedByOwner).length,
    rejected: ownerTickets.filter(isTicketRejectedByOwner).length,
    total: ownerTickets.length,
  };

  // Filtered tickets based on activeTab & searchQuery
  const filteredTickets = ownerTickets.filter((t) => {
    // Tab filter
    if (activeTab === 'pending' && t.status !== 'escalated_to_owner') return false;
    if (activeTab === 'approved' && !isTicketApprovedByOwner(t)) return false;
    if (activeTab === 'returned' && !isTicketReturnedByOwner(t)) return false;
    if (activeTab === 'rejected' && !isTicketRejectedByOwner(t)) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const ticketId = (t.ticket_id || `TCK-OLD-${t.id}`).toLowerCase();
    const title = (t.title || '').toLowerCase();
    const creator = (t.creator?.name || '').toLowerCase();
    const pmName = (t.assignments?.[0]?.pm?.name || '').toLowerCase();

    return ticketId.includes(query) || title.includes(query) || creator.includes(query) || pmName.includes(query);
  });

  const handleOpenDecisionModal = (ticket, defaultDecision = 'approved') => {
    setSelectedTicket(ticket);
    setDecision(defaultDecision);
    setDecisionNotes('');
    setModalError('');
    setModalSuccess('');
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setSelectedTicket(null);
    setDecisionNotes('');
    setModalError('');
    setModalSuccess('');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!decisionNotes.trim()) {
      setModalError('Harap isi catatan keputusan/instruksi dari Owner.');
      return;
    }

    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    try {
      const response = await axios.post(`/tickets/${selectedTicket.ticket_id}/owner-decision`, {
        decision,
        notes: decisionNotes,
      });

      setModalSuccess(response.data.message || 'Keputusan berhasil disimpan!');
      await fetchTickets();
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Gagal menyimpan keputusan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'escalated_to_owner':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'escalated_to_pm':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'assigned':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'closed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
        <SkeletonStatCards count={4} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
      {/* Page Title & Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600">
              <Crown className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Issues dari Project Manager</h2>
          </div>
          <p className="text-sm text-slate-500">
            Daftar masalah dan eskalasi krusial yang memerlukan persetujuan atau arahan strategis dari Owner.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Decision Card */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer ${
            activeTab === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10' : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Perlu Keputusan
            </span>
            {stats.pending > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{stats.pending}</p>
          <p className="text-[11px] text-slate-400 mt-1">Tiket menunggu tindakan Anda</p>
        </div>

        {/* Approved History Card */}
        <div
          onClick={() => setActiveTab('approved')}
          className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer ${
            activeTab === 'approved' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Disetujui Owner
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{stats.approved}</p>
          <p className="text-[11px] text-slate-400 mt-1">Disetujui ke PM / Selesai</p>
        </div>

        {/* Returned to PM History Card */}
        <div
          onClick={() => setActiveTab('returned')}
          className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer ${
            activeTab === 'returned' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-indigo-600" />
              Dikembalikan ke PM
            </span>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">{stats.returned}</p>
          <p className="text-[11px] text-slate-400 mt-1">Butuh kajian ulang PM</p>
        </div>

        {/* Rejected History Card */}
        <div
          onClick={() => setActiveTab('rejected')}
          className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer ${
            activeTab === 'rejected' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10' : 'border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Ditolak Owner
            </span>
          </div>
          <p className="text-3xl font-extrabold text-rose-600">{stats.rejected}</p>
          <p className="text-[11px] text-slate-400 mt-1">Penolakan permanen</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
        {/* Navigation Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-slate-100 pb-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Perlu Keputusan ({stats.pending})</span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Disetujui ({stats.approved})</span>
            </button>

            <button
              onClick={() => setActiveTab('returned')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'returned'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
              <span>Dikembalikan ke PM ({stats.returned})</span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rejected'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Ditolak ({stats.rejected})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Semua Riwayat ({stats.total})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID tiket, judul, PM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-4 py-2 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Issue Cards List */}
        <div className="flex flex-col gap-4">
          {filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <Inbox className="w-10 h-10 text-slate-300" />
              <div>
                <p className="font-bold text-slate-600 text-sm">Tidak Ada Laporan Issue</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {activeTab === 'pending'
                    ? 'Saat ini tidak ada laporan masalah dari PM yang membutuhkan keputusan Anda.'
                    : 'Tidak ada tiket eskalasi yang cocok dengan filter ini.'}
                </p>
              </div>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isPending = t.status === 'escalated_to_owner';
              // Find latest escalation log from PM
              const pmEscalationLog = (t.progress_logs || [])
                .slice()
                .reverse()
                .find((l) => l.new_status === 'escalated_to_owner' || l.notes?.includes('Dieskalasikan ke Owner'));
              
              // Find owner decision log if available
              const ownerDecisionLog = (t.progress_logs || [])
                .slice()
                .reverse()
                .find((l) => l.notes?.includes('Keputusan Owner') || l.notes?.includes('[OWNER_DECISION'));

              const pmName = t.assignments?.[0]?.pm?.name || pmEscalationLog?.user?.name || 'Project Manager';

              return (
                <div
                  key={t.id}
                  className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col gap-4 text-left ${
                    isPending ? 'border-amber-300 ring-1 ring-amber-400/30 bg-gradient-to-r from-amber-50/20 to-white' : 'border-slate-200'
                  }`}
                >
                  {/* Top Row: Ticket ID, Status, Priority & Date */}
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                        {t.ticket_id || `TCK-OLD-${t.id}`}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getPriorityBadge(t.priority)}`}>
                        Priority: {t.priority || 'Belum Ditentukan'}
                      </span>
                      {t.category && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {t.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(t.status)}`}>
                        {isPending ? '👑 Menunggu Keputusan Owner' : t.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(t.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">{t.description}</p>
                  </div>

                  {/* PM Escalation Note Banner */}
                  {pmEscalationLog && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                          Catatan Eskalasi dari {pmName}
                        </span>
                        <span className="text-[10px] text-amber-700">
                          {new Date(pmEscalationLog.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-amber-950 italic leading-relaxed">
                        "{pmEscalationLog.notes}"
                      </p>
                    </div>
                  )}

                  {/* Owner Previous Decision Banner (if processed) */}
                  {ownerDecisionLog && !isPending && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <Crown className="w-4 h-4 text-amber-500" />
                        Keputusan Owner ({new Date(ownerDecisionLog.created_at).toLocaleString('id-ID')})
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {ownerDecisionLog.notes}
                      </p>
                    </div>
                  )}

                  {/* Bottom Actions Row */}
                  <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Klien: <strong className="text-slate-700">{t.creator?.name || 'N/A'}</strong>
                      </span>
                      {t.attachment_path && (
                        <a
                          href={`/storage/${t.attachment_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          <FileDown className="w-3.5 h-3.5" /> Lampiran
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tickets/${t.ticket_id || t.id}`}
                        className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Detail Tiket
                      </Link>

                      {isPending && (
                        <button
                          onClick={() => handleOpenDecisionModal(t, 'approved')}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          Beri Keputusan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Decision Modal Pop-up */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Keputusan Owner Tiket</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedTicket.ticket_id || `TCK-OLD-${selectedTicket.id}`} — {selectedTicket.title}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Feedback */}
            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}
            {modalSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleDecisionSubmit} className="flex flex-col gap-4">
              {/* Decision Type Radio Picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pilih Keputusan Strategis <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {/* Option 1: Approved to PM */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      decision === 'approved'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={decision === 'approved'}
                      onChange={(e) => setDecision(e.target.value)}
                      className="mt-1 accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui — Diteruskan ke PM (Eksekusi)
                      </span>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Menyetujui eskalasi. Tiket dikembalikan ke PM untuk ditugaskan ke Programmer.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Approved & Self-Resolved */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      decision === 'resolved'
                        ? 'border-teal-500 bg-teal-50/40 text-teal-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="resolved"
                      checked={decision === 'resolved'}
                      onChange={(e) => setDecision(e.target.value)}
                      className="mt-1 accent-teal-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" /> Disetujui & Selesaikan Langsung (Resolved)
                      </span>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Masalah disetujui & selesai di tingkat Owner tanpa perlu Programmer. Tiket siap diverifikasi Service Desk.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Returned to PM */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      decision === 'returned_to_pm'
                        ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="returned_to_pm"
                      checked={decision === 'returned_to_pm'}
                      onChange={(e) => setDecision(e.target.value)}
                      className="mt-1 accent-indigo-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5" /> Dikembalikan ke PM (Kajian Ulang)
                      </span>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Mengembalikan tiket ke PM dengan arahan khusus untuk dikaji ulang.
                      </p>
                    </div>
                  </label>

                  {/* Option 4: Rejected */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      decision === 'rejected'
                        ? 'border-rose-500 bg-rose-50/40 text-rose-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="rejected"
                      checked={decision === 'rejected'}
                      onChange={(e) => setDecision(e.target.value)}
                      className="mt-1 accent-rose-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Ditolak Permanen (Rejected)
                      </span>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Menolak eskalasi secara permanen. Tiket akan ditutup dari antrean.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Decision Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Catatan & Arahan Owner <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tuliskan arahan, pertimbangan, atau catatan khusus untuk PM..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Keputusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
