import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Copy, Check, ShieldAlert, ArrowRight, User, Calendar, Search } from 'lucide-react';
import { SkeletonTableRows } from './SkeletonLoader';

export const AssignTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/tickets');
      // Filter for tickets escalated to PM by Service Desk
      setTickets(response.data.filter(t => t.status === 'escalated_to_pm' || t.status === 'open'));
    } catch (err) {
      console.error("Gagal memuat antrean penugasan tiket", err);
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Resource Allocation Queue (PM)</h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">Antrean tiket yang dieskalasikan oleh Service Desk, menunggu penunjukan Programmer & estimasi jam pengerjaan</p>
        </div>
        <SkeletonTableRows count={5} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 text-left w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resource Allocation Queue (PM)</h2>
        <p className="text-sm text-slate-500">Antrean tiket yang dieskalasikan oleh Service Desk, menunggu penunjukan Programmer & estimasi jam pengerjaan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 col-span-2 text-sm">
            Tidak ada tiket yang memerlukan penugasan saat ini. Semua tiket sudah ditugaskan ke Programmer.
          </div>
        ) : (
          tickets.map(ticket => {
            const tId = ticket.ticket_id || `TCK-OLD-${ticket.id}`;
            const isCopied = copiedId === tId;
            return (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 rounded-lg flex overflow-hidden hover:border-primary transition-all duration-150 text-left shadow-sm flex-col justify-between"
              >
                <div className="p-6 flex flex-col gap-3">
                  {/* Card Top Badges */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-primary bg-primary-tint/50 px-2 py-0.5 rounded-sm border border-primary/10">
                      <span>{tId}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(tId, e)}
                        title="Salin ID Tiket"
                        className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-primary transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.category && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                          {ticket.category}
                        </span>
                      )}
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityBadge(ticket.priority)}`}>
                        {formatPriorityText(ticket.priority)}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5 truncate">{ticket.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 border border-slate-200 border-dashed p-3 rounded-sm">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Service Desk Internal Notes */}
                  {ticket.internal_notes && (
                    <div className="bg-primary-tint/20 border border-primary/20 p-3 rounded-sm flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Catatan Service Desk
                      </span>
                      <p className="text-xs text-slate-700 leading-normal italic line-clamp-2">
                        "{ticket.internal_notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-center bg-slate-50 border-t border-slate-150 px-6 py-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Klien: {ticket.creator?.name}</span>
                  </div>
                  <Link
                    to={`/tickets/${ticket.ticket_id || ticket.id}`}
                    className="py-1.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Allocate Resource</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
