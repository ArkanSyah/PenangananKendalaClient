import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing } from 'lucide-react';
import { useNotifications } from '../NotificationContext';

export default function NotificationBell() {
  const { items, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

          <div className="border-t border-gray-100 px-4 py-2">
            <Link
              to="/settings/notifications/history"
              className="text-xs text-[#005662] hover:underline"
            >
              Lihat semua notifikasi →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export { NotificationBell };
