import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDateTime } from '../utils/dateUtils';

export const ServiceDeskDashboard = ({
  tickets,
  selectedTicket,
  setSelectedTicket,
  fetchTickets
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('belum_ditentukan');
  const [attachment, setAttachment] = useState(null);

  const [statusNote,       setStatusNote]       = useState('');
  const [sdSelfCloseNote,  setSdSelfCloseNote]  = useState('');
  const [showSdClose,      setShowSdClose]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('priority', priority);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      await axios.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAttachment(null);
      setShowCreateModal(false);
      await fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!statusNote.trim()) {
      alert('Please provide notes explaining the action.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/tickets/${selectedTicket.ticket_id || selectedTicket.id}/status`, {
        status,
        notes: statusNote
      });
      setStatusNote('');
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSdSelfClose = async (e) => {
    e.preventDefault();
    if (!sdSelfCloseNote.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`/tickets/${selectedTicket.ticket_id || selectedTicket.id}/status`, {
        status: 'closed',
        notes: '[SELF_RESOLVED] Tiket ditutup oleh Service Desk — masalah terselesaikan tanpa eskalasi. Alasan: ' + sdSelfCloseNote.trim(),
        is_internal: true,
      });
      setSdSelfCloseNote('');
      setShowSdClose(false);
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menutup tiket.');
    } finally {
      setSubmitting(false);
    }
  };

  // Keep selected ticket in sync with updated data
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

      {/* Left Pane - List & Create */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Reported Tickets</h3>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            + Create Ticket
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          {tickets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No tickets reported yet.</p>
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

      {/* Right Pane - Detail View */}
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

            {/* Walk-in Reporter Info — only shown for walk-in tickets */}
            {selectedTicket.reporter_name && (
              <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '10px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(251,191,36,0.25)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400e' }}>👤 Info Reporter Walk-in</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(251,191,36,0.25)', color: '#92400e', padding: '2px 8px', borderRadius: '999px' }}>Non-Sistem</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#92400e', display: 'block', marginBottom: '2px', fontSize: '0.7rem', fontWeight: '600' }}>Nama Client</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{selectedTicket.reporter_name}</span>
                  </div>
                  {selectedTicket.reporter_contact && (
                    <div>
                      <span style={{ color: '#92400e', display: 'block', marginBottom: '2px', fontSize: '0.7rem', fontWeight: '600' }}>Nomor Kontak</span>
                      <a href={`tel:${selectedTicket.reporter_contact}`} style={{ fontWeight: '700', color: 'var(--primary)', textDecoration: 'none' }}>
                        📱 {selectedTicket.reporter_contact}
                      </a>
                    </div>
                  )}
                  {selectedTicket.contact_method && (
                    <div>
                      <span style={{ color: '#92400e', display: 'block', marginBottom: '2px', fontSize: '0.7rem', fontWeight: '600' }}>Metode Kontak</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {selectedTicket.contact_method === 'whatsapp' && '💬 WhatsApp'}
                        {selectedTicket.contact_method === 'telepon'  && '📞 Telepon'}
                        {selectedTicket.contact_method === 'email'    && '📧 Email'}
                        {selectedTicket.contact_method === 'walk_in'  && '🚶 Datang Langsung'}
                        {selectedTicket.contact_method === 'lainnya'  && `📌 ${selectedTicket.contact_method_notes || 'Lainnya'}`}
                      </span>
                    </div>
                  )}
                </div>
                {/* Quick Contact Buttons */}
                {selectedTicket.reporter_contact && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {selectedTicket.contact_method === 'whatsapp' && (
                      <a
                        href={`https://wa.me/${selectedTicket.reporter_contact.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px', background: '#16a34a', color: '#fff', border: 'none', textAlign: 'center', textDecoration: 'none', borderRadius: '6px', fontWeight: '700' }}
                      >
                        💬 Hubungi via WhatsApp
                      </a>
                    )}
                    {selectedTicket.contact_method === 'telepon' && (
                      <a
                        href={`tel:${selectedTicket.reporter_contact}`}
                        className="btn"
                        style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px', background: '#2563eb', color: '#fff', border: 'none', textAlign: 'center', textDecoration: 'none', borderRadius: '6px', fontWeight: '700' }}
                      >
                        📞 Telepon Client
                      </a>
                    )}
                    {selectedTicket.contact_method === 'email' && (
                      <a
                        href={`mailto:${selectedTicket.reporter_contact}`}
                        className="btn"
                        style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px', background: '#7c3aed', color: '#fff', border: 'none', textAlign: 'center', textDecoration: 'none', borderRadius: '6px', fontWeight: '700' }}
                      >
                        📧 Kirim Email ke Client
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

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

            {/* Assignment Details */}
            {selectedTicket.assignments && selectedTicket.assignments.length > 0 && (
              <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>Assignment Info</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div><strong>PM:</strong> {selectedTicket.assignments[0].pm?.name}</div>
                  <div><strong>Programmer:</strong> {selectedTicket.assignments[0].programmer?.name}</div>
                  <div><strong>Estimated Time:</strong> {selectedTicket.assignments[0].estimated_hours} {selectedTicket.assignments[0].estimated_unit === 'days' ? 'Hari' : 'Jam'}</div>
                </div>
              </div>
            )}

            {/* ── SD: Tutup Langsung / Self-Resolve ── walk-in only, any active status */}
            {selectedTicket.reporter_name && !['closed', 'rejected'].includes(selectedTicket.status) && (
              <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: showSdClose ? '12px' : '0' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#b91c1c', marginBottom: '2px' }}>❌ Tutup Tiket Walk-in (Self-Resolved)</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Tutup kapanpun jika client walk-in konfirmasi masalah bukan kendala teknis — meski sudah dieskalasi ke PM/Programmer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSdClose(v => !v)}
                    className={showSdClose ? 'btn btn-secondary' : 'btn btn-danger'}
                    style={{ marginLeft: '12px', padding: '6px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                    disabled={submitting}
                  >
                    {showSdClose ? 'Batal' : 'Tutup Tiket'}
                  </button>
                </div>

                {showSdClose && (
                  <form onSubmit={handleSdSelfClose} style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: '12px' }}>
                    {selectedTicket.status !== 'open' && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.75rem', color: '#92400e' }}>
                        <span style={{ flexShrink: 0 }}>⚠️</span>
                        <span>
                          Tiket ini sudah berstatus <strong>{selectedTicket.status.replace(/_/g, ' ')}</strong>. Menutupnya akan membatalkan pengerjaan PM / Programmer.
                        </span>
                      </div>
                    )}
                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label className="form-label" style={{ color: '#b91c1c' }}>Alasan Penutupan <span style={{ color: '#ef4444' }}>*</span></label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Contoh: Client mengonfirmasi perangkat belum terhubung ke internet. Setelah dihubungkan, masalah teratasi sendiri."
                        value={sdSelfCloseNote}
                        onChange={(e) => setSdSelfCloseNote(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={submitting || !sdSelfCloseNote.trim()}
                      style={{ fontSize: '0.8rem' }}
                    >
                      {submitting ? 'Menutup...' : '❌ Konfirmasi Tutup Tiket'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Service Desk Action Form - Close or Reject */}
            {selectedTicket.status === 'resolved' && (
              <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.03)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--success)', marginBottom: '6px' }}>Client Verification / Action Required</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  The programmer has resolved this issue. Please verify with the client and either Close or Reject this ticket.
                </p>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Verification Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide details of the verification (e.g. client confirmed fix, or reasons for rejection)..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleUpdateStatus('closed')}
                    className="btn btn-success"
                    style={{ flex: 1 }}
                    disabled={submitting}
                  >
                    Close Ticket (Finish)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('rejected')}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                    disabled={submitting}
                  >
                    Reject (Re-open)
                  </button>
                </div>
              </div>
            )}

            {/* Progress Logs Timeline */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>Progress History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedTicket.progress_logs?.map((log, idx) => (
                  <div key={log.id} style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: log.new_status === 'closed' ? 'var(--text-muted)' : 'var(--primary)',
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
            <span style={{ fontSize: '3rem', marginBottom: '10px' }}></span>
            <p>Select a ticket from the left list to view its complete progress history and actions.</p>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '550px',
            padding: '30px',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Create New Support Ticket</h3>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="form-label">Ticket Title / Client Issue</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Database connection timeouts in Production"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Explain the technical problem, steps to reproduce, client impact..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    className="form-control"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Optional Attachment</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    style={{ padding: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Submit Ticket'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
