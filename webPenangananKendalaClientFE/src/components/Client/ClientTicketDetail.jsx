import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Clock, 
  Calendar,
  AlertCircle, 
  FileDown
} from 'lucide-react';
import { SkeletonTicketDetail } from '../SkeletonLoader';
import { formatDateTime } from '../../utils/dateUtils';

export const ClientTicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTicket = async () => {
    try {
      const response = await axios.get(`/client/tickets/${ticketId}`);
      setTicket(response.data);
    } catch (err) {
      console.error("Failed to load client ticket details", err);
      setError(err.response?.data?.message || 'Gagal memuat detail tiket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);



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
      open: 'Terbuka (Dikonfirmasi)',
      assigned: 'Ditugaskan ke Developer',
      in_progress: 'Sedang Dikerjakan',
      pending_review: 'Sedang Direview',
      resolved: 'Selesai',
      closed: 'Ditutup',
      rejected: 'Ditolak',
    };
    return map[status?.toLowerCase()] || status?.replace(/_/g, ' ');
  };

  if (loading) return <SkeletonTicketDetail />;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center flex flex-col items-center gap-4 bg-white p-8 border border-slate-200 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-500 shrink-0" />
        <h2 className="text-xl font-bold text-slate-900">Tiket Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-sm transition-colors cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  if (!ticket) return <div className="text-slate-500 text-sm text-left">Tiket tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto w-full text-left flex flex-col gap-6">
      
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-primary hover:text-primary-hover text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke dashboard</span>
        </button>
      </div>

      {/* Header Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex justify-between items-start shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs font-bold text-primary bg-primary-tint py-0.5 px-2 rounded-sm border border-primary/10">
              {ticket.ticket_id || `TCK-OLD-${ticket.id}`}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm">
              Kategori: {ticket.category || 'N/A'}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1">{ticket.title}</h2>
          <p className="text-xs text-slate-500 flex items-center gap-2 mt-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Dilaporkan oleh Anda</span>
            <span className="text-slate-300">|</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDateTime(ticket.created_at)}</span>
          </p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
          {getStatusLabel(ticket.status)}
        </span>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Description & Progress timeline */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
        {/* Pending Confirmation Info Banner */}
          {ticket.status === 'pending_confirmation' && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-700">Tiket Menunggu Konfirmasi</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                  Tiket bantuan kamu sudah diterima dan sedang ditinjau oleh tim Service Desk. Kamu akan mendapat notifikasi setelah dikonfirmasi atau jika ada masalah.
                </p>
              </div>
            </div>
          )}

          {/* Issue Details */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Deskripsi Masalah</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 border border-slate-200 border-dashed p-4 rounded-sm">
              {ticket.description}
            </p>
            
            {ticket.attachment_path && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center">
                <a
                  href={`/storage/${ticket.attachment_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh Lampiran Berkas</span>
                </a>
              </div>
            )}
          </div>

          {/* Public Progress Timeline */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Riwayat Perkembangan Bantuan</h3>
            <div className="flex flex-col gap-5">
              {ticket.progress_logs && ticket.progress_logs.length > 0 ? (
                ticket.progress_logs.map((log, idx) => (
                  <div key={log.id} className="flex gap-4 text-xs text-left">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0" />
                      {idx !== ticket.progress_logs.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900 font-bold">{log.user?.name || 'Tim Bantuan'}</strong>
                        <span className="text-[10px] text-slate-400">{formatDateTime(log.created_at)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-slate-500">Status Laporan:</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(log.new_status)}`}>
                          {log.new_status.replace('_', ' ')}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="mt-2 text-slate-700 bg-sky-50/80 border border-sky-200/80 p-3.5 rounded-sm leading-relaxed">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs py-4 text-center italic">
                  Belum ada catatan publik untuk tiket ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Client Support Info Card (No internal staff/hours data) */}
        <div>
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-4 text-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Penanganan Bantuan</h3>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm flex flex-col gap-2">
              <span className="text-slate-400 font-semibold block">Status Saat Ini</span>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold w-fit ${getStatusBadge(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tim teknis kami sedang memproses laporan Anda secara intensif. Setiap pembaruan resmi akan langsung ditampilkan pada lini masa di samping.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
