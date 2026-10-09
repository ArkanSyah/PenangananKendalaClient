import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Hand, AlertCircle, RefreshCw, MessageSquareQuote } from 'lucide-react';
import { SkeletonTaskCards } from './SkeletonLoader';

export const AvailableTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/tickets/available');
      setTickets(response.data);
    } catch (err) {
      console.error('Gagal memuat available tickets', err);
      setError(err.response?.data?.message || 'Gagal memuat daftar tiket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleClaim = async (ticket) => {
    const ticketId = ticket.ticket_id || ticket.id;
    setClaimingId(ticket.id);
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`/tickets/${ticketId}/claim`);
      setMessage(response.data.message);
      await fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melakukan claim tiket.');
    } finally {
      setClaimingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority?.toLowerCase();
    switch (p) {
      case 'low': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'medium': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'high': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-8 text-left w-full max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Available Tickets</h2>
          <p className="text-xs text-slate-500 mt-1">Tiket yang tersedia untuk di-claim programmer</p>
        </div>
        <SkeletonTaskCards count={3} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Available Tickets</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tiket yang tersedia dan siap di-claim oleh Programmer
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setLoading(true); fetchTickets(); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-300 rounded-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-sm flex items-center gap-2">
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 text-sm">
          Tidak ada tiket yang tersedia untuk claim saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tickets.map((ticket) => {
            const tId = ticket.ticket_id || `TCK-OLD-${ticket.id}`;
            const isClaiming = claimingId === ticket.id;

            // Check if this ticket has a rejection log from PM
            const rejectionLogs = (ticket.progress_logs || []).filter(
              (l) => l.notes && l.notes.includes('[CLAIM_REJECTED]')
            );
            const latestRejection = rejectionLogs[rejectionLogs.length - 1];
            let pmRejectionNote = '';
            if (latestRejection) {
              const match = latestRejection.notes.match(/Catatan PM:\s*(.*)/i);
              pmRejectionNote = match ? match[1].trim() : latestRejection.notes;
            }

            return (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col gap-4 hover:border-primary/40 transition-colors shadow-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary-tint/50 px-2 py-0.5 rounded-sm">
                    {tId}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityBadge(ticket.priority)}`}>
                    {(ticket.priority || 'belum_ditentukan').replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{ticket.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-normal">{ticket.description}</p>
                </div>

                {/* Catatan Penolakan PM jika tiket ini pernah ditolak claim sebelumnya */}
                {pmRejectionNote && (
                  <div className="bg-rose-50/80 border border-rose-200 rounded p-3 text-xs text-rose-800 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <MessageSquareQuote className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Catatan Penolakan Claim dari PM:</span>
                    </div>
                    <p className="italic text-rose-700 leading-relaxed bg-white/70 p-2 rounded border border-rose-100">
                      "{pmRejectionNote}"
                    </p>
                  </div>
                )}

                <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                  Kategori: <strong className="text-slate-700">{ticket.category || '-'}</strong>
                  {' · '}
                  Dilaporkan: <strong className="text-slate-700">{ticket.creator?.name || '-'}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaim(ticket)}
                  disabled={isClaiming}
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Hand className="w-3.5 h-3.5" />
                  {isClaiming ? 'Mengajukan Claim...' : 'Claim Ticket'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
