import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Search, Copy, Check } from 'lucide-react';
import { SkeletonStatCards, SkeletonTableRows } from './SkeletonLoader';

export const DashboardOverview = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error("Failed to load dashboard index", err);
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

  const getStats = () => {
    const stats = { total: 0, open: 0, active: 0, resolved: 0, closed: 0 };
    tickets.forEach(ticket => {
      stats.total++;
      if (ticket.status === 'open') stats.open++;
      else if (ticket.status === 'assigned' || ticket.status === 'in_progress') stats.active++;
      else if (ticket.status === 'resolved') stats.resolved++;
      else if (ticket.status === 'closed') stats.closed++;
    });
    return stats;
  };

  const stats = getStats();
  const getGreeting = () => {
    switch (user?.role) {
      case 'service_desk': return 'Console Service Desk';
      case 'project_manager': return 'PM Project Control Center';
      case 'programmer': return 'Developer Backlog Control';
      case 'owner': return 'Executive Surveillance Desk';
      default: return 'Dashboard Sistem Tiket';
    }
  };

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
    switch (status) {
      case 'open': return 'bg-sky-50 text-sky-700 border border-sky-100';
      case 'escalated_to_pm': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'assigned': return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'closed': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const ticketId = (ticket.ticket_id || `TCK-OLD-${ticket.id}`).toLowerCase();
    const title = (ticket.title || '').toLowerCase();
    const creator = (ticket.creator?.name || '').toLowerCase();
    const category = (ticket.category || '').toLowerCase();
    const status = (ticket.status || '').toLowerCase();
    return ticketId.includes(query) || title.includes(query) || creator.includes(query) || category.includes(query) || status.includes(query);
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">{getGreeting()}</h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">Selamat datang, {user?.name}. Memuat data operasional...</p>
        </div>
        <SkeletonStatCards count={4} />
        <SkeletonTableRows count={5} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 text-left w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{getGreeting()}</h2>
        <p className="text-sm text-slate-500">Selamat datang, {user?.name}. Ringkasan operasional penanganan klien.</p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {user.role === 'service_desk' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-40 hover:border-primary transition-all duration-150 shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Eskalasi Tiket Baru</h4>
              <p className="text-xs text-slate-500 leading-normal">Cari ID Tiket Klien & tentukan prioritas untuk dikirim ke PM.</p>
            </div>
            <Link to="/tickets/create" className="py-2 text-center bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-sm transition-all">
              + Cari / Eskalasi Tiket
            </Link>
          </div>
        )}

        {user.role === 'project_manager' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-40 hover:border-primary transition-all duration-150 shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Resource Allocation</h4>
              <p className="text-xs text-slate-500 leading-normal">Review open tickets and assign programmers with hourly estimations.</p>
            </div>
            <Link to="/tickets/assign" className="py-2 text-center bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-sm transition-all">
              Go to Resource Allocation
            </Link>
          </div>
        )}

        {user.role === 'programmer' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-40 hover:border-primary transition-all duration-150 shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">My Sprint Tasks</h4>
              <p className="text-xs text-slate-500 leading-normal">You have {tickets.filter(t => t.status === 'assigned' || t.status === 'in_progress').length} active tasks assigned.</p>
            </div>
            <Link to="/tickets/tasks" className="py-2 text-center bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-sm transition-all">
              Open My Worklist
            </Link>
          </div>
        )}

        {user.role === 'owner' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-40 hover:border-primary transition-all duration-150 shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Analytical Audit Reports</h4>
              <p className="text-xs text-slate-500 leading-normal">Review overall statistics, charts, and log activity streams.</p>
            </div>
            <Link to="/reports" className="py-2 text-center bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-sm transition-all">
              Open Audit Reports
            </Link>
          </div>
        )}

        {/* Counter cards */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-40 shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Backlog</h4>
            <p className="text-[11px] text-slate-400 mt-1">Sum of all tickets registered.</p>
          </div>
          <span className="text-3xl font-extrabold text-primary">{stats.total}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-40 shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Tasks</h4>
            <p className="text-[11px] text-slate-400 mt-1">In progress or assigned state.</p>
          </div>
          <span className="text-3xl font-extrabold text-amber-500">{stats.active}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-40 shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resolved & Closed</h4>
            <p className="text-[11px] text-slate-400 mt-1">Verification finished.</p>
          </div>
          <span className="text-3xl font-extrabold text-emerald-600">{stats.closed + stats.resolved}</span>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-4">
        
        {/* Table Header & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar Tiket Operasional</h3>
            <p className="text-xs text-slate-500">Gunakan pencarian cepat untuk mencari berdasarkan ID, Judul, Klien, atau Status</p>
          </div>

          {/* Interactive Search Bar */}
          <div className="relative w-full sm:w-72">
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

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-900 border-collapse">
            <thead className="bg-[#F1F3F4] border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Tiket</th>
                <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Judul</th>
                <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Prioritas</th>
                <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelapor</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 text-xs">
                    {searchQuery ? `Tidak ada tiket yang cocok dengan pencarian "${searchQuery}".` : 'Belum ada tiket terdaftar.'}
                  </td>
                </tr>
              ) : (
                filteredTickets.slice(0, 10).map(ticket => {
                  const tId = ticket.ticket_id || `TCK-OLD-${ticket.id}`;
                  const isCopied = copiedId === tId;
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-primary">
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
                      <td className="px-4 py-3 font-semibold truncate max-w-xs">
                        <Link to={user?.role === 'client' ? `/client/tickets/${ticket.ticket_id || ticket.id}` : `/tickets/${ticket.ticket_id || ticket.id}`} className="hover:underline text-slate-900">
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityBadge(ticket.priority)}`}>
                          {formatPriorityText(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{ticket.creator?.name}</td>
                      <td className="px-4 py-3 text-right">
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
