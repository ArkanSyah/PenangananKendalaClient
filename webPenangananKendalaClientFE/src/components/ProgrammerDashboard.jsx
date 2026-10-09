import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDateTime } from '../utils/dateUtils';

export const ProgrammerDashboard = ({
  tickets,
  selectedTicket,
  setSelectedTicket,
  fetchTickets
}) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    if (!notes.trim()) {
      alert('Please fill in the technical implementation and testing notes.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/tickets/${selectedTicket.id}/status`, {
        status: newStatus,
        notes: notes
      });
      setNotes('');
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', flex: 1 }}>
      
      {/* Left Pane - My Tickets */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', textAlign: 'left' }}>Assigned Worklist</h3>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          {tickets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No tickets assigned to you yet.</p>
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
                    <span>Creator: {ticket.creator?.name}</span>
                    <span className={`badge badge-${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Detail View & Status Management */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflowY: 'auto', textAlign: 'left' }}>
        {selectedTicket ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
              <div>
                <span className={`badge badge-${selectedTicket.priority}`} style={{ marginBottom: '8px' }}>{selectedTicket.priority} Priority</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedTicket.title}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Created on {formatDateTime(selectedTicket.created_at)} by {selectedTicket.creator?.name}
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

            {/* Assignment Specs */}
            {selectedTicket.assignments && selectedTicket.assignments.length > 0 && (
              <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>Assignment & Estimation Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div><strong>Assigner (PM):</strong> {selectedTicket.assignments[0].pm?.name}</div>
                  <div><strong>Assigned Time:</strong> {selectedTicket.assignments[0].estimated_hours} {selectedTicket.assignments[0].estimated_unit === 'days' ? 'Hari' : 'Jam'}</div>
                </div>
              </div>
            )}

            {/* Programmer Transition Panel */}
            {(selectedTicket.status === 'assigned' || selectedTicket.status === 'in_progress') && (
              <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', border: '1px solid var(--secondary)', background: 'rgba(20, 184, 166, 0.03)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--secondary)', marginBottom: '8px' }}>
                  {selectedTicket.status === 'assigned' ? '🔧 Step 7.1: Begin System Analysis' : '🧪 Step 7.4: Submit Implementation & Testing Logs'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {selectedTicket.status === 'assigned' 
                    ? 'State you are starting technical analysis of the reported bug/feature.'
                    : 'Explain code changes made and testing done (e.g. unit tests passed, client verification method).'
                  }
                </p>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Task Log Note</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder={selectedTicket.status === 'assigned' ? "Analyzing data schema and replicating issue..." : "Modified model relation and ran unit tests. All tests green."}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {selectedTicket.status === 'assigned' ? (
                    <button
                      onClick={() => handleStatusUpdate('in_progress')}
                      className="btn btn-primary"
                      style={{ width: '100%', background: 'var(--secondary)' }}
                      disabled={submitting}
                    >
                      {submitting ? 'Starting...' : 'Accept & Start Implementation'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusUpdate('resolved')}
                      className="btn btn-success"
                      style={{ width: '100%' }}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Mark as Resolved (Done)'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Logs Timeline */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>History Logs</h4>
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
            <span style={{ fontSize: '3rem', marginBottom: '10px' }}>⚙️</span>
            <p>Select a assigned ticket from the left column to modify status and write developer logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};
