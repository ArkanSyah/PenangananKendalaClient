import { useState } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';

export default function DeleteTicketModal({ ticket, onConfirm, onCancel, isDeleting }) {
  const [reason, setReason] = useState('');

  if (!ticket) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-slate-900">Hapus Tiket</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
            disabled={isDeleting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Tiket <span className="font-semibold">{ticket.ticket_id}</span> — {ticket.title} akan dipindahkan ke arsip.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Alasan (opsional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Alasan penghapusan..."
            className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            disabled={isDeleting}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isDeleting}
              className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
