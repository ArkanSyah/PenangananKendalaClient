import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Search, Copy, Check } from 'lucide-react';
import { SkeletonTableRows } from './SkeletonLoader';

export const TicketList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error("Gagal mengambil data tiket", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCopy = (idStr, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(idStr);
    setCopiedId(idStr);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const tId = (ticket.ticket_id || `TCK-OLD-${ticket.id}`).toLowerCase();
    const title = (ticket.title || '').toLowerCase();
    const creator = (ticket.creator?.name || '').toLowerCase();
    const category = (ticket.category || '').toLowerCase();
    
    return matchesStatus && (tId.includes(query) || title.includes(query) || creator.includes(query) || category.includes(query));
  });

  const getPriorityBadge = (priority) => {
    const p = priority?.toLowerCase();
    switch (p) {
      case 'low': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'medium': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'high': return 'bg-red-50 text-red-700 border border-red-100';
      case 'belum_ditentukan': default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const formatPriorityText = (priority) => {
    if (!priority || priority === 'belum_ditentukan') return 'Belum Ditentukan';
    return priority.toUpperCase();
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending_confirmation': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'open': return 'bg-sky-50 text-sky-700 border border-sky-100';
      case 'escalated_to_pm': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'waiting_programmer': return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
      case 'waiting_pm_approval': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'assigned': return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'in_progress': case 'in progress': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'pending_review': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'escalated_to_owner': return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'closed': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Riwayat & Daftar Tiket</h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">Seluruh riwayat tiket bantuan teknis dengan fitur pencarian cepat & salin ID</p>
        </div>
        <SkeletonTableRows count={5} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 text-left w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat & Daftar Tiket</h2>
        <p className="text-sm text-slate-500">Seluruh riwayat tiket bantuan teknis dengan fitur pencarian cepat & salin ID</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between sm:items-end gap-4 shadow-sm">
        {/* Search Bar */}
        <div className="flex flex-col gap-1.5 flex-1 max-w-md">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cari Tiket</label>
          <div className="relative">
            <input
              type="text"
              className="w-full text-xs border border-slate-300 rounded-sm pl-9 pr-3.5 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150"
              placeholder="Cari ID Tiket, Judul, Klien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filter Status</label>
          <select
            className="text-xs border border-slate-300 rounded-sm py-2 px-3 w-48 focus:outline-none focus:border-primary bg-white cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="pending_confirmation">Pending Confirmation</option>
            <option value="open">Open</option>
            <option value="escalated_to_pm">Escalated to PM</option>
            <option value="waiting_programmer">Waiting Programmer</option>
            <option value="waiting_pm_approval">Waiting PM Approval</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_review">Pending Review</option>
            <option value="escalated_to_owner">Escalated to Owner</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-900">
            <thead className="bg-[#F8F9FA] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID Tiket</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Judul</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Prioritas</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dilaporkan Oleh</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400 text-xs">
                    Tidak ada tiket bantuan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => {
                  const tId = ticket.ticket_id || `TCK-OLD-${ticket.id}`;
                  const isCopied = copiedId === tId;
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-xs text-primary">
                        <div className="flex items-center gap-1.5">
                          <span>{tId}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(tId, e)}
                            title="Salin ID Tiket"
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-semibold truncate max-w-xs">{ticket.title}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityBadge(ticket.priority)}`}>
                          {formatPriorityText(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 text-xs">{ticket.creator?.name}</td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          to={user?.role === 'client' ? `/client/tickets/${ticket.ticket_id || ticket.id}` : `/tickets/${ticket.ticket_id || ticket.id}`}
                          className="text-primary hover:text-primary-hover font-bold text-xs underline"
                        >
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
