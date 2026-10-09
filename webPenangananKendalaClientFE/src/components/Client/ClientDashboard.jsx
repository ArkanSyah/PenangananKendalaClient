import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  Inbox,
  Search,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  X
} from 'lucide-react';
import { SkeletonStatCards, SkeletonTableRows } from '../SkeletonLoader';

export const ClientDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Status Modal, and Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/client/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error("Gagal memuat data dashboard klien", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Metric Calculation
  const totalTickets = tickets.length;

  const activeTickets = tickets.filter(t => {
    const s = t.status?.toLowerCase();
    return s === 'pending_confirmation' || s === 'open' || s === 'assigned' || s === 'in_progress' || s === 'in progress';
  }).length;

  const resolvedTickets = tickets.filter(t => {
    const s = t.status?.toLowerCase();
    return s === 'resolved' || s === 'closed';
  }).length;

  // Filter & Search Logic
  const filteredTickets = tickets.filter(ticket => {
    const ticketIdStr = (ticket.ticket_id || '').toLowerCase();
    const titleStr = (ticket.title || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = ticketIdStr.includes(query) || titleStr.includes(query);

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const s = ticket.status?.toLowerCase();
      if (statusFilter === 'open') {
        matchesStatus = s === 'open' || s === 'assigned';
      } else if (statusFilter === 'in_progress') {
        matchesStatus = s === 'in_progress' || s === 'in progress';
      } else if (statusFilter === 'closed') {
        matchesStatus = s === 'closed' || s === 'resolved';
      }
    }

    return matchesSearch && matchesStatus;
  });

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination Calculation
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending_confirmation': return 'bg-slate-100 text-slate-600 border border-slate-300';
      case 'open': return 'bg-sky-50 text-sky-700 border border-sky-100';
      case 'assigned': return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'in_progress': case 'in progress': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'closed': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      pending_confirmation: 'Menunggu Konfirmasi',
      open: 'Terbuka',
      assigned: 'Ditugaskan',
      in_progress: 'Sedang Dikerjakan',
      'in progress': 'Sedang Dikerjakan',
      pending_review: 'Menunggu Review',
      resolved: 'Selesai',
      closed: 'Ditutup',
      rejected: 'Ditolak',
    };
    return map[status?.toLowerCase()] || status?.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
        <SkeletonStatCards count={4} />
        <SkeletonTableRows count={5} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 text-left w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1 w-full">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pusat Bantuan Klien</h2>
        <p className="text-sm text-slate-500">Laporkan kendala, lacak rekam jejak, dan selesaikan kendala teknis Anda.</p>
      </div>

      {/* Grid: Stat Cards & Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Action Card: Buat Tiket Baru */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-36 hover:border-primary transition-all duration-150 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>Buat Tiket Baru</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Buat tiket kendala teknis baru untuk melaporkan masalah sistem Anda.
            </p>
          </div>
          <Link to="/client/create" className="py-2 text-center bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-sm transition-all">
            Buat Tiket Baru
          </Link>
        </div>

        {/* Counter: Total Tiket */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-36 shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Total Tiket</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">Riwayat seluruh tiket yang dilaporkan.</p>
          </div>
          <span className="text-3xl font-extrabold text-primary">{totalTickets}</span>
        </div>

        {/* Counter: Masalah Aktif */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-36 shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Masalah Aktif</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">Menunggu penugasan PM atau pengerjaan Programmer.</p>
          </div>
          <span className="text-3xl font-extrabold text-amber-500">{activeTickets}</span>
        </div>

        {/* Counter: Tiket Selesai */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-36 shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Tiket Selesai</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">Tiket yang telah berhasil diselesaikan.</p>
          </div>
          <span className="text-3xl font-extrabold text-emerald-600">{resolvedTickets}</span>
        </div>

      </div>

      {/* Ticket Logs Table Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-5">

        {/* Table Title and Subtitle */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tiket Bantuan Anda</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{filteredTickets.length} tiket ditemukan</p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan ID Tiket atau Judul..."
              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-48">
              <select
                className="w-full text-xs border border-slate-200 rounded-sm py-2.5 px-3 focus:outline-none focus:border-primary bg-white cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="open">Open</option>
                <option value="escalated_to_pm">Escalated to PM</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Status Information Guide Button */}
            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-primary-tint text-slate-700 hover:text-primary border border-slate-200 rounded-sm transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold"
              title="Panduan Informasi Status Tiket"
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Bantuan Status</span>
            </button>
          </div>
        </div>

        {/* High-density Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-sm">
          <table className="min-w-full text-left text-sm text-slate-900 border-collapse">
            <thead className="bg-[#F8F9FA] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Tiket</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Judul</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Dibuat</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedTickets.map(ticket => {
                const s = ticket.status?.toLowerCase();
                const hasUnreadUpdate = ticket.progress_logs && ticket.progress_logs.length > 1 && s !== 'closed' && s !== 'resolved';

                return (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-xs text-primary">
                      <div className="flex items-center gap-1.5">
                        <span>{ticket.ticket_id || `TCK-OLD-${ticket.id}`}</span>
                        {hasUnreadUpdate && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-red-100 text-red-700 leading-none shrink-0 uppercase tracking-wider animate-pulse">
                            Pembaruan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold truncate max-w-xs">{ticket.title}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm">
                        {ticket.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/client/tickets/${ticket.ticket_id}`}
                        className="text-primary hover:text-primary-hover font-bold text-xs underline"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {paginatedTickets.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox className="w-8 h-8 text-slate-300" />
                      <span>Anda belum mengirimkan tiket bantuan.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center border-t border-slate-100 pt-4 text-xs text-slate-500">
            <div>
              Menampilkan <span className="font-semibold text-slate-800">{startIndex + 1}</span> hingga{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(startIndex + itemsPerPage, filteredTickets.length)}
              </span>{' '}
              dari <span className="font-semibold text-slate-800">{filteredTickets.length}</span> tiket
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 font-bold rounded-sm border transition-colors cursor-pointer ${currentPage === page
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Status Information Guide Modal Overlay */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl flex flex-col gap-5 text-left">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-tint/50 rounded-md text-primary">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Panduan Informasi Status Tiket</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Penjelasan alur dan arti setiap status tiket bantuan Anda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Plain Text Cards Layout (NO Table) */}
            <div className="flex flex-col gap-4 text-xs text-left max-h-[60vh] overflow-y-auto pr-1">
              
              {/* Open */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded text-[11px]">
                    Open
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed mt-1">
                  Tiket Anda telah diterima oleh sistem dan sedang menunggu pengecekan awal oleh tim Service Desk kami.
                </p>
              </div>

              {/* Escalated to PM */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-800 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                    Escalated to PM
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed mt-1">
                  Tiket Anda sedang dianalisis oleh Manajer Proyek untuk menentukan langkah perbaikan dan alokasi tim.
                </p>
              </div>

              {/* Assigned */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded text-[11px]">
                    Assigned
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed mt-1">
                  Tiket Anda telah diserahkan kepada tim teknis/programmer dan sudah masuk ke dalam jadwal pengerjaan.
                </p>
              </div>

              {/* In Progress */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                    In Progress
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed mt-1">
                  Tim teknis kami sedang aktif melakukan perbaikan atau pengerjaan pada tiket Anda.
                </p>
              </div>

              {/* Resolved */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                    Resolved
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed mt-1">
                  Pengerjaan telah selesai dan kendala berhasil diatasi. Menunggu konfirmasi akhir dari Anda.
                </p>
              </div>

              {/* Closed */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded text-[11px]">
                    Closed
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed mt-1">
                  Tiket telah dinyatakan selesai sepenuhnya dan ditutup secara permanen.
                </p>
              </div>

              {/* Rejected */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-800 bg-red-100 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                    Rejected
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed mt-1">
                  Tiket tidak dapat diproses (misalnya karena duplikasi laporan atau di luar cakupan layanan). Alasan detail akan diinformasikan oleh tim kami.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="py-2 px-5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-sm transition-colors cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
