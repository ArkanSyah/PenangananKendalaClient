import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, RotateCcw, Loader2, ArrowLeft } from 'lucide-react';
import { fetchArchivedTickets, restoreTicket } from '../api/tickets';

export default function ArchivePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [restoringId, setRestoringId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArchivedTickets({ q: query, page });
      setItems(data.data || []);
      setLastPage(data.last_page || 1);
    } catch {
      setError('Gagal memuat data arsip.');
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleRestore = async (ticketId) => {
    setRestoringId(ticketId);
    try {
      await restoreTicket(ticketId);
      await load();
    } catch {
      setError('Gagal mengembalikan tiket.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/board')}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Archive className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-semibold text-slate-900">Arsip Tiket</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berdasarkan ID atau judul..."
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
        >
          Cari
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Tidak ada data arsip.
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">ID Tiket</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Judul</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Dihapus oleh</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Tanggal</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-600">{item.ticket_id}</td>
                  <td className="px-4 py-3 text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 text-slate-600">{item.status}</td>
                  <td className="px-4 py-3 text-slate-600">{item.archived_by?.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.archived_at ? new Date(item.archived_at).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRestore(item.ticket_id)}
                      disabled={restoringId === item.ticket_id}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 cursor-pointer"
                    >
                      {restoringId === item.ticket_id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      Pulihkan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lastPage > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="px-3 py-1 text-sm text-slate-600">
            Halaman {page} dari {lastPage}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 cursor-pointer"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
