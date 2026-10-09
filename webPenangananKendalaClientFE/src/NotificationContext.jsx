import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 15000;

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchInApp = useCallback(async () => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('/notifications/in-app');
      setItems(res.data.items || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return undefined;
    }

    fetchInApp();
    const id = setInterval(fetchInApp, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user, fetchInApp]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.post(`/notifications/in-app/${notificationId}/read`);
      setItems((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // gagal mark read; akan refresh di polling berikutnya
    }
  }, []);

  const refresh = useCallback(() => {
    fetchInApp();
  }, [fetchInApp]);

  const value = {
    items,
    unreadCount,
    loading,
    markAsRead,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
