import { STATUS_ORDER, PRIORITY_CONFIG, DRAG_ALLOWED_ROLES } from '../constants/statusMapping';

export function groupTicketsByStatus(tickets) {
  const grouped = {};
  STATUS_ORDER.forEach((status) => {
    grouped[status] = [];
  });
  tickets.forEach((ticket) => {
    if (grouped[ticket.status]) {
      grouped[ticket.status].push(ticket);
    }
  });
  return grouped;
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 30) return `${diffDay} hari lalu`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} bulan lalu`;
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} tahun lalu`;
}

export function getPriorityConfig(priority) {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.belum_ditentukan;
}

export function canUserDrag(user) {
  if (!user || !user.role) return false;
  return DRAG_ALLOWED_ROLES.includes(user.role);
}

export function loadBoardLayout() {
  try {
    const raw = sessionStorage.getItem('board-layout');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveBoardLayout(layout) {
  try {
    sessionStorage.setItem('board-layout', JSON.stringify(layout));
  } catch {
    // Storage penuh atau diblokir; layout hilang saat refresh, tidak fatal.
  }
}

export function applyLayout(grouped, layout) {
  if (!layout) return grouped;
  const result = {};
  Object.keys(grouped).forEach((status) => {
    const allCards = grouped[status];
    const orderIds = layout[status] || [];
    const ordered = [];
    const remaining = [...allCards];
    orderIds.forEach((id) => {
      const idx = remaining.findIndex((t) => t.id === id);
      if (idx !== -1) {
        ordered.push(remaining[idx]);
        remaining.splice(idx, 1);
      }
    });
    result[status] = [...ordered, ...remaining];
  });
  return result;
}
