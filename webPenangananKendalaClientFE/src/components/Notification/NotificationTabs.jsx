import { NavLink } from 'react-router-dom';

const tabs = [
  { label: 'Pengaturan', to: '/settings/notifications', end: true },
  { label: 'Riwayat', to: '/settings/notifications/history', end: false },
];

export default function NotificationTabs() {
  return (
    <nav
      aria-label="Notification navigation"
      className="mb-6 flex gap-1 border-b border-slate-200"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
