import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABEL, PRIORITY_CONFIG } from '../../constants/statusMapping';

export default function TicketDetailModal({ ticket, onClose }) {
  const navigate = useNavigate();
  if (!ticket) return null;

  const priority =
    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.belum_ditentukan;

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
          <div>
            <span className="text-xs font-mono text-gray-500">
              {ticket.ticket_id}
            </span>
            <h2 className="text-lg font-semibold text-gray-800">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
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
