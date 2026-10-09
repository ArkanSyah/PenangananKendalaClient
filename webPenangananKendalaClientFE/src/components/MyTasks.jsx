import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';
import { SkeletonTaskCards } from './SkeletonLoader';

export const MyTasks = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error("Failed to load programmer tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTasks = tickets.filter(t => ['assigned', 'in_progress', 'pending_review'].includes(t.status));
  const finishedTasks = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'assigned': return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'pending_review': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'closed': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-8 text-left w-full max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">My Backlog Tasks</h2>
          <p className="text-xs text-slate-500 mt-1">Tickets assigned to you for analysis, coding, and testing</p>
        </div>
        <SkeletonTaskCards count={4} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8 text-left w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Backlog Tasks</h2>
        <p className="text-sm text-slate-500">Tickets assigned to you for analysis, coding, and testing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Tasks Column */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
            Active Sprint ({openTasks.length})
          </h3>
          
          {openTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-xs">
              No active tasks in your queue.
            </div>
          ) : (
            openTasks.map(ticket => (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 rounded-lg flex overflow-hidden hover:border-primary hover:bg-primary-tint transition-all duration-150 text-left"
              >

                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="font-mono text-xs font-bold text-primary bg-primary-tint/50 px-2 py-0.5 rounded-sm">
                        {ticket.ticket_id || `TCK-OLD-${ticket.id}`}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{ticket.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-normal">{ticket.description}</p>
                    
                    {/* PM Feedback Banner if returned TIDAK OK */}
                    {ticket.progress_logs?.some(l => l.notes?.includes('[PM_REVIEW_TIDAK_OK]')) && (
                      <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-sm text-xs mb-3 font-medium flex flex-col gap-0.5 text-left">
                        <span className="font-bold flex items-center gap-1.5 text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>Perlu Perbaikan (PM Review TIDAK OK)</span>
                        </span>
                        <span className="text-[11px] italic text-red-900 leading-normal">
                          "{ticket.progress_logs.find(l => l.notes?.includes('[PM_REVIEW_TIDAK_OK]'))?.notes?.replace('[PM_REVIEW_TIDAK_OK] ', '')}"
                        </span>
                      </div>
                    )}

                    {/* Pending Review waiting banner */}
                    {ticket.status === 'pending_review' && !ticket.progress_logs?.some(l => l.notes?.includes('[PM_REVIEW_TIDAK_OK]')) && (
                      <div className="bg-orange-50 border border-orange-200 text-orange-800 p-2.5 rounded-sm text-xs mb-3 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Menunggu persetujuan PM — pengerjaan sudah diajukan.</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3.5 mt-2 text-slate-500">
                    <span>Estimasi: <strong className="font-semibold text-slate-700">{ticket.assignments?.[0]?.estimated_hours || 0} {ticket.assignments?.[0]?.estimated_unit === 'days' ? 'Hari' : 'Jam'}</strong></span>
                    <Link
                      to={`/tickets/${ticket.ticket_id || ticket.id}`}
                      className="py-1 px-3.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-[11px] rounded-sm transition-colors cursor-pointer"
                    >
                      Update Status
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed Tasks Column */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
            Resolved & Completed ({finishedTasks.length})
          </h3>

          {finishedTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-xs">
              No resolved tasks found.
            </div>
          ) : (
            finishedTasks.map(ticket => (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 rounded-lg flex overflow-hidden opacity-75 text-left"
              >

                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                        {ticket.ticket_id || `TCK-OLD-${ticket.id}`}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 mb-1">{ticket.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3.5 leading-normal">{ticket.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3.5 mt-2 text-slate-500">
                    <span>Estimasi: <strong className="font-semibold text-slate-700">{ticket.assignments?.[0]?.estimated_hours || 0} {ticket.assignments?.[0]?.estimated_unit === 'days' ? 'Hari' : 'Jam'}</strong></span>
                    <Link
                      to={`/tickets/${ticket.ticket_id || ticket.id}`}
                      className="py-1 px-3 text-slate-500 hover:text-primary font-bold text-[11px] hover:underline"
                    >
                      View Logs
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
