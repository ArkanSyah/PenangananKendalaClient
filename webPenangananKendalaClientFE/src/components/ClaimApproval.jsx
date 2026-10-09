import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, User, AlertCircle, RefreshCw } from 'lucide-react';
import { SkeletonTableRows } from './SkeletonLoader';

export const ClaimApproval = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [notesMap, setNotesMap] = useState({});
  const [estimateMap, setEstimateMap] = useState({});
  const [unitMap, setUnitMap] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/tickets/pending-claims');
      setTickets(response.data);
    } catch (err) {
      console.error('Gagal memuat pending claims', err);
      setError(err.response?.data?.message || 'Gagal memuat daftar claim.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleApprove = async (ticket) => {
    const ticketId = ticket.ticket_id || ticket.id;
    const notes = (notesMap[ticket.id] || '').trim();
    if (!notes) {
      setError('Catatan approval wajib diisi.');
      return;
    }
    setProcessingId(ticket.id);
    setMessage('');
    setError('');
    try {
      const unit = unitMap[ticket.id] || 'hours';
      const response = await axios.post(`/tickets/${ticketId}/approve-claim`, {
        notes,
        estimated_hours: estimateMap[ticket.id] ? Number(estimateMap[ticket.id]) : undefined,
        estimated_unit: unit,
      });
      setMessage(response.data.message);
      setNotesMap((prev) => ({ ...prev, [ticket.id]: '' }));
      await fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyetujui claim.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (ticket) => {
    const ticketId = ticket.ticket_id || ticket.id;
    const notes = (notesMap[ticket.id] || '').trim();
    if (!notes) {
      setError('Catatan rejection wajib diisi.');
      return;
    }
    setProcessingId(ticket.id);
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`/tickets/${ticketId}/reject-claim`, { notes });
      setMessage(response.data.message);
      setNotesMap((prev) => ({ ...prev, [ticket.id]: '' }));
      await fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menolak claim.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Ticket Claim Approval</h2>
          <p className="text-xs text-slate-500 mt-1">Persetujuan claim tiket dari programmer</p>
        </div>
        <SkeletonTableRows count={4} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Ticket Claim Approval</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review dan setujui/tolak claim programmer (status <strong>waiting_pm_approval</strong>)
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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-sm">
          {message}
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
          Tidak ada claim yang menunggu persetujuan.
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {tickets.map((ticket) => {
            const tId = ticket.ticket_id || `TCK-OLD-${ticket.id}`;
            const isProcessing = processingId === ticket.id;
            const claimant = ticket.claimed_programmer;
            return (
              <div key={ticket.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-primary">{tId}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                        waiting_pm_approval
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{ticket.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 shrink-0">
                    <User className="w-4 h-4 text-primary" />
                    <span>
                      Claim oleh: <strong>{claimant?.name || 'Unknown'}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Estimasi Pengerjaan
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        className="flex-1 text-xs border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:border-primary"
                        placeholder={unitMap[ticket.id] === 'days' ? 'contoh: 2' : 'contoh: 8'}
                        value={estimateMap[ticket.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEstimateMap((prev) => ({ ...prev, [ticket.id]: val }));
                        }}
                      />
                      <select
                        className="w-24 text-xs border border-slate-300 rounded-sm px-2 py-2 bg-white focus:outline-none focus:border-primary cursor-pointer font-medium text-slate-700"
                        value={unitMap[ticket.id] || 'hours'}
                        onChange={(e) => setUnitMap((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                      >
                        <option value="hours">Jam</option>
                        <option value="days">Hari</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Catatan PM <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:border-primary"
                      placeholder="Alasan approve/reject..."
                      value={notesMap[ticket.id] || ''}
                      onChange={(e) => setNotesMap((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApprove(ticket)}
                    disabled={isProcessing}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(ticket)}
                    disabled={isProcessing}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Claim
                  </button>
                  <Link
                    to={`/tickets/${tId}`}
                    className="py-2 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-sm transition-colors text-center"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
