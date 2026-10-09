import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing } from 'lucide-react';
import { useNotifications } from '../NotificationContext';
import { subscribeUserToPush, sendTestPushNotification } from '../utils/pushManager';

export default function NotificationBell() {
  const { items, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [pushLoading, setPushLoading] = useState(false);
  const ref = useRef(null);

  const handleSubscribePush = async () => {
    setPushLoading(true);
    setPushStatus('');
    try {
      await subscribeUserToPush();
      setPushStatus('✅ Push Notification aktif!');
    } catch (err) {
      setPushStatus(`❌ ${err.message || 'Gagal aktivasi push'}`);
    } finally {
      setPushLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setPushLoading(true);
    setPushStatus('');
    try {
      const res = await sendTestPushNotification();
      setPushStatus(`🚀 ${res.message || 'Push terkirim!'}`);
    } catch (err) {
      setPushStatus(`❌ ${err.response?.data?.message || 'Gagal kirim push'}`);
    } finally {
      setPushLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleItemClick(item) {
    if (!item.read) {
      markAsRead(item.id);
    }
  }

  const Icon = unreadCount > 0 ? BellRing : Bell;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        aria-label={`Notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ''}`}
      >
        <Icon size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-[#C62828] rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Notifikasi
            </h3>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-400 text-center">
              Belum ada notifikasi.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${item.read ? '' : 'bg-[#005662]/5'}`}
                  >
                    <p className="text-xs font-mono text-gray-500">
                      {item.ticket_id || '-'}
                    </p>
                    <p className="text-sm text-gray-800 mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.created_at).toLocaleString('id-ID')}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Web Push Notification Controls (PWA Phase 3) */}
          <div className="px-3 py-2 bg-slate-50 border-t border-gray-100 flex flex-col gap-1.5 shrink-0">
            {pushStatus && (
              <div className="text-[10px] font-semibold text-slate-700 bg-white p-1 rounded border border-slate-200">
                {pushStatus}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSubscribePush}
                disabled={pushLoading}
                className="flex-1 py-1 px-2 bg-[#005662] hover:bg-[#003d46] text-white rounded text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer text-center"
              >
                {pushLoading ? '...' : '🔔 Aktifkan Push'}
              </button>
              <button
                type="button"
                onClick={handleSendTestPush}
                disabled={pushLoading}
                className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer text-center"
              >
                🚀 Tes Push
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
            <Link
              to="/settings/notifications/history"
              className="text-xs text-[#005662] hover:underline"
            >
              Lihat semua notifikasi →
            </Link>
            <Link
              to="/settings/notifications"
              className="text-xs text-gray-500 hover:underline"
            >
              Pengaturan ⚙️
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export { NotificationBell };
