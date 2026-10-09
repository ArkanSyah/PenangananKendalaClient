import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart3,
  Ticket,
  Clock,
  Code2,
  CheckCircle2,
  Archive,
  Activity,
  ArrowRight,
  FileText,
  User
} from 'lucide-react';
import { SkeletonStatCards, SkeletonTimelineFeed } from './SkeletonLoader';

export const Reports = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error("Failed to load reporting data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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

  const getAllLogs = () => {
    const logs = [];
    tickets.forEach(ticket => {
      if (ticket.progress_logs) {
        ticket.progress_logs.forEach(log => {
          logs.push({
            ...log,
            ticketTitle: ticket.title,
            ticketCustomId: ticket.ticket_id || `TCK-OLD-${ticket.id}`,
            ticketId: ticket.id
          });
        });
      }
    });
    return logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const logsFeed = getAllLogs();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return 'bg-sky-50 text-sky-700 border border-sky-200/80';
      case 'assigned': return 'bg-purple-50 text-purple-700 border border-purple-200/80';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border border-amber-200/80';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
      case 'closed': return 'bg-slate-100 text-slate-700 border border-slate-200/80';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-200/80';
      default: return 'bg-slate-50 text-slate-700 border border-slate-200/80';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-8 text-left w-full max-w-5xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span>System Reports & Metrics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time business performance overview and operational audit feed</p>
        </div>
        <SkeletonStatCards count={5} />
        <SkeletonTimelineFeed count={4} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8 text-left w-full max-w-5xl mx-auto">
      {/* Page Heading Hierarchy: H2 */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-primary" />
          <span>System Reports & Metrics</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Real-time business performance overview and operational audit feed</p>
      </div>

      {/* Section 1: KPI Stat Cards */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 font-display flex items-center gap-2">
            <span>Key Performance Indicators</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Total: {stats.total} tickets</span>
        </div>

        {/* Stat Cards - Top Accent Lines (No clashing bottom borders) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          
          {/* Card 1: Total */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Issues</h4>
              <Ticket className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 font-display">{stats.total}</span>
          </div>

          {/* Card 2: Open Queue */}
          <div className="bg-white border border-slate-200/80 border-t-2 border-t-sky-500 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Open Queue</h4>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>
            <span className="text-3xl font-extrabold text-sky-600 font-display">{stats.open}</span>
          </div>

          {/* Card 3: In Development */}
          <div className="bg-white border border-slate-200/80 border-t-2 border-t-amber-500 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In Development</h4>
              <Code2 className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-3xl font-extrabold text-amber-600 font-display">{stats.active}</span>
          </div>

          {/* Card 4: Pending Verify */}
          <div className="bg-white border border-slate-200/80 border-t-2 border-t-primary rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider">Pending Verify</h4>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-3xl font-extrabold text-primary font-display">{stats.resolved}</span>
          </div>

          {/* Card 5: Closed */}
          <div className="bg-white border border-slate-200/80 border-t-2 border-t-emerald-500 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Closed (Resolved)</h4>
              <Archive className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-3xl font-extrabold text-emerald-600 font-display">{stats.closed}</span>
          </div>
        </div>
      </section>

      {/* Section 2: Seamless Unboxed Activity Timeline Feed (NO Outer Card Container, NO Inner Card Slop) */}
      <section className="flex flex-col gap-5 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-primary" />
            <span>Recent Operational Activity Feed</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{logsFeed.length} audit entries</span>
        </div>

        {logsFeed.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 opacity-50" />
            <p className="text-sm">No logged activity found in audit trail.</p>
          </div>
        ) : (
          /* Timeline List - Completely Unboxed & Clean */
          <div className="flex flex-col gap-6 max-w-4xl pt-1">
            {logsFeed.map((log) => (
              <div key={log.id} className="flex gap-4 text-sm text-left group">
                
                {/* Timeline Connector Line & Dot */}
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10 mt-1 shrink-0" />
                  <div className="w-px flex-1 bg-slate-200 my-1 group-last:hidden" />
                </div>

                {/* Log Item Content (Clean, unboxed text flow) */}
                <div className="flex-1 pb-5 border-b border-slate-100 group-last:border-none">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                        <User className="w-3.5 h-3.5 text-slate-400 inline shrink-0" />
                        {log.user?.name}
                      </span>
                      <span className="text-[10px] font-mono font-semibold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tracking-wider">
                        {log.user?.role?.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Ticket Information Row */}
                  <div className="mt-1.5 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                    <span>Ticket:</span>
                    <strong className="font-mono text-primary font-bold">
                      {log.ticketCustomId}
                    </strong>
                    <span className="text-slate-300">—</span>
                    <span className="font-medium text-slate-800 truncate max-w-md">{log.ticketTitle}</span>
                  </div>

                  {/* Status Transition Row */}
                  <div className="mt-1.5 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">Status transition:</span>
                    <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{log.previous_status || 'null'}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(log.new_status)}`}>
                      {log.new_status}
                    </span>
                  </div>

                  {/* Unboxed Notes (Plain text with left subtle border accent, NO inner card container or background box) */}
                  {log.notes && (
                    <p className="mt-2.5 text-xs text-slate-700 italic border-l-2 border-slate-300 pl-3 py-0.5 leading-relaxed">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
