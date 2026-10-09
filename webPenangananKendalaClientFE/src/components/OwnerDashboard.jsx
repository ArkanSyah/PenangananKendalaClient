import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

export const OwnerDashboard = ({
  tickets,
  selectedTicket,
  setSelectedTicket
}) => {
  const getStats = () => {
    const stats = { total: 0, open: 0, active: 0, escalated_owner: 0, resolved: 0, closed: 0 };
    tickets.forEach(ticket => {
      stats.total++;
      if (ticket.status === 'open') stats.open++;
      else if (ticket.status === 'escalated_to_owner') stats.escalated_owner++;
      else if (ticket.status === 'assigned' || ticket.status === 'in_progress') stats.active++;
      else if (ticket.status === 'resolved') stats.resolved++;
      else if (ticket.status === 'closed') stats.closed++;
    });
    return stats;
  };

  const stats = getStats();

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <h5 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Total Tickets</h5>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.total}</span>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid #ea580c' }}>
          <h5 style={{ fontSize: '0.75rem', color: '#ea580c', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Crown style={{ width: '14px', height: '14px' }} /> Escalated to Owner
          </h5>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>{stats.escalated_owner}</span>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid var(--info)' }}>
          <h5 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Open</h5>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--info)' }}>{stats.open}</span>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid var(--warning)' }}>
          <h5 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Active Dev</h5>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--warning)' }}>{stats.active}</span>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid var(--secondary)' }}>
          <h5 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Resolved</h5>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{stats.resolved}</span>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid var(--success)' }}>
          <h5 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Closed</h5>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>{stats.closed}</span>
        </div>
      </div>

      {/* Main Split Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', flex: 1 }}>
        {/* Left Pane - Tickets list */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', textAlign: 'left' }}>Overview Monitoring Desk</h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
            {tickets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No tickets found.</p>
            ) : (
              tickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`glass-panel glass-panel-hover ${selectedTicket?.id === ticket.id ? 'active-ticket' : ''}`}
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  overflow: 'hidden'
                }}
              >
                <div className={`priority-bar priority-bar-${ticket.priority}`} />
                <div style={{ flex: 1, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{ticket.title}</h4>
                    <span className={`badge badge-${ticket.priority}`}>{ticket.priority}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '10px' }}>
                    {ticket.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>By: {ticket.creator?.name}</span>
                    <span className={`badge badge-${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Right Pane - Detail Timeline */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', overflowY: 'auto', textAlign: 'left' }}>
          {selectedTicket ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
                <div>
                  <span className={`badge badge-${selectedTicket.priority}`} style={{ marginBottom: '8px' }}>{selectedTicket.priority} Priority</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedTicket.title}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Reported by {selectedTicket.creator?.name} on {formatDateTime(selectedTicket.created_at)}
                  </p>
                </div>
                <span className={`badge badge-${selectedTicket.status}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.attachment_path && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Attachment</h4>
                  <a
                    href={`/storage/${selectedTicket.attachment_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', fontSize: '0.85rem', padding: '6px 12px' }}
                  >
                    View Attached File
                  </a>
                </div>
              )}

              {/* Assignment details (Read Only) */}
              {selectedTicket.assignments && selectedTicket.assignments.length > 0 && (
                <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.01)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>Assignment & Resources</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                    <div><strong>Project Manager:</strong> {selectedTicket.assignments[0].pm?.name}</div>
                    <div><strong>Programmer Assigned:</strong> {selectedTicket.assignments[0].programmer?.name}</div>
                    <div><strong>Estimated Allocation:</strong> {selectedTicket.assignments[0].estimated_hours} {selectedTicket.assignments[0].estimated_unit === 'days' ? 'Hari' : 'Jam'}</div>
                  </div>
                </div>
              )}

              {/* Progress Logs Timeline */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>Operational Progress Logs</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedTicket.progress_logs?.map((log, idx) => (
                    <div key={log.id} style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          marginTop: '6px'
                        }} />
                        {idx !== selectedTicket.progress_logs.length - 1 && (
                          <div style={{ width: '1px', flex: 1, background: 'var(--border-glass)', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{log.user?.name} ({log.user?.role?.replace('_', ' ')})</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {formatDateTime(log.created_at)}
                          </span>
                        </div>
                        <div style={{ marginTop: '2px' }}>
                          Changed status to <span className={`badge badge-${log.new_status}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{log.new_status}</span>
                        </div>
                        {log.notes && (
                          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', background: 'rgba(255,255,255,0.01)', padding: '6px 8px', borderRadius: '4px', border: '1px dashed var(--border-glass)' }}>
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column' }}>
              <Crown style={{ width: '48px', height: '48px', opacity: 0.6, marginBottom: '10px', color: '#ea580c' }} />
              <p>Select any ticket to audit its historical process logs and assignments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
