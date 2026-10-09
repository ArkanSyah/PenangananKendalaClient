import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Loader2, Check } from 'lucide-react';
import axios from 'axios';

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'unread', label: 'Belum Dibaca' },
  { value: 'read', label: 'Sudah Dibaca' },
];

export default function NotificationHistory() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/notifications/in-app', {
          params: { page, per_page: 20, filter },
        });
        if (cancelled) return;
        setItems(res.data.items || []);
        setUnreadCount(res.data.unread_count || 0);
        setPagination(res.data.pagination || null);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Gagal memuat notifikasi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, filter]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        (item.message || '').toLowerCase().includes(q) ||
        (item.ticket_id || '').toLowerCase().includes(q) ||
        (item.title || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  function handleFilterChange(value) {
    setFilter(value);
    setPage(1);
  }

  async function handleMarkRead(id) {
    try {
      await axios.post(`/notifications/in-app/${id}/read`);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // gagal mark read; user bisa refresh manual
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Notifikasi</h1>
        {unreadCount > 0 && (
          <span className="text-xs px-2 py-1 rounded-full font-medium bg-[#C62828]/10 text-[#C62828]">
            {unreadCount} belum dibaca
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Semua notifikasi in-app Anda.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilterChange(f.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === f.value
                  ? 'bg-white text-[#005662] font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pesan atau ID tiket..."
            className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#005662]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-8">
          <Loader2 size={16} className="animate-spin" />
          <span>Memuat riwayat...</span>
        </div>
      ) : error ? (
        <div className="text-sm text-[#C62828] py-8">Error: {error}</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          {search ? 'Tidak ada hasil untuk pencarian.' : 'Belum ada notifikasi.'}
        </div>
      ) : (
        <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <div
                className={`px-4 py-3 flex items-start gap-3 ${
                  item.read ? '' : 'bg-[#005662]/5'
                }`}
              >
                <Bell
                  size={16}
                  className={`shrink-0 mt-0.5 ${
                    item.read ? 'text-gray-300' : 'text-[#005662]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-500">
                      {item.ticket_id || '-'}
                    </span>
                    {item.title && (
                      <span className="text-xs text-gray-600 truncate">
                        {item.title}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap break-words">
                    {item.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(item.id)}
                    className="shrink-0 text-xs text-[#005662] hover:underline flex items-center gap-1"
                    aria-label="Tandai sudah dibaca"
                  >
                    <Check size={14} />
                    <span>Tandai</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">
            Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.current_page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={pagination.current_page >= pagination.last_page}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link
          to="/settings/notifications"
          className="text-sm text-[#005662] hover:underline"
        >
          ← Kembali ke Pengaturan
        </Link>
      </div>
    </div>
  );
}
