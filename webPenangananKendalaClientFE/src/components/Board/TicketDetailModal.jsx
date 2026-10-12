import { useState, useEffect } from 'react';
import { X, Pencil, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABEL, PRIORITY_CONFIG } from '../../constants/statusMapping';
import { useAuth } from '../../AuthContext';
import { canUserEditTitle } from '../../utils/boardUtils';
import { updateTicketTitle } from '../../api/tickets';

export default function TicketDetailModal({ ticket, onClose, onTicketUpdated }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentTitle, setCurrentTitle] = useState(ticket?.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(ticket?.title || '');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState(null);

  useEffect(() => {
    if (ticket) {
      setCurrentTitle(ticket.title || '');
      setDraftTitle(ticket.title || '');
      setIsEditingTitle(false);
      setTitleError(null);
    }
  }, [ticket]);

  if (!ticket) return null;

  const priority =
    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.belum_ditentukan;

  const handleSaveTitle = async () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      setTitleError('Judul tidak boleh kosong.');
      return;
    }
    if (trimmed.length > 255) {
      setTitleError('Judul maksimal 255 karakter.');
      return;
    }
    if (trimmed === currentTitle) {
      setIsEditingTitle(false);
      setTitleError(null);
      return;
    }
    setIsSavingTitle(true);
    setTitleError(null);
    try {
      const result = await updateTicketTitle(ticket.ticket_id, trimmed);
      setCurrentTitle(trimmed);
      setIsEditingTitle(false);
      if (onTicketUpdated) {
        onTicketUpdated(result.ticket || { ...ticket, title: trimmed });
      }
    } catch (err) {
      setTitleError(err.response?.data?.message || 'Gagal menyimpan judul.');
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleCancelEdit = () => {
    setDraftTitle(currentTitle);
    setIsEditingTitle(false);
    setTitleError(null);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 mr-4">
            <span className="text-xs font-mono text-gray-500">
              {ticket.ticket_id}
            </span>
            {isEditingTitle ? (
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    maxLength={255}
                    autoFocus
                    disabled={isSavingTitle}
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-base focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTitle}
                    disabled={isSavingTitle}
                    className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                    title="Simpan"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSavingTitle}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                    title="Batal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {titleError && (
                  <p className="mt-1 text-xs text-red-600">{titleError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {currentTitle}
                </h2>
                {canUserEditTitle(user) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftTitle(currentTitle);
                      setIsEditingTitle(true);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Edit judul"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${priority.badge}`}
            >
              {priority.label}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              {STATUS_LABEL[ticket.status] || ticket.status}
            </span>
            {ticket.category && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                {ticket.category}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Deskripsi
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Programmer
              </h4>
              <p className="text-gray-700">
                {ticket.claimed_programmer?.name || 'Belum di-assign'}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Client
              </h4>
              <p className="text-gray-700">{ticket.creator?.name || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Dibuat
              </h4>
              <p className="text-gray-700">
                {ticket.created_at
                  ? new Date(ticket.created_at).toLocaleString('id-ID')
                  : '-'}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Diperbarui
              </h4>
              <p className="text-gray-700">
                {ticket.updated_at
                  ? new Date(ticket.updated_at).toLocaleString('id-ID')
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Tutup
          </button>
          <button
		onClick={() => navigate(`/tickets/${ticket.ticket_id || ticket.id}`)}
            className="px-4 py-2 text-sm bg-[#005662] text-white hover:bg-[#003d46] rounded-lg"
          >
            Buka Detail Lengkap
          </button>
        </div>
      </div>
    </div>
  );
}
