import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { NotificationBell } from './NotificationBell';
import { canUserArchive } from '../utils/boardUtils';
import {
  LayoutDashboard,
  ClipboardList,
  FilePlus,
  UserCheck,
  CheckSquare,
  BarChart3,
  LogOut,
  UserPlus,
  Crown,
  Hand,
  UserCheck2,
  Shield,
  Users,
  ActivitySquare,
  Kanban,
  BellRing,
  Archive,
  Menu,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const mainRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Headroom topbar scroll listener
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      const currentY = main.scrollTop;
      const diff = currentY - lastScrollY.current;

      if (Math.abs(diff) < 10) return;

      if (diff > 0 && currentY > 60) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentY;
    };

    main.addEventListener('scroll', handleScroll, { passive: true });
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  // Escape key close & focus return
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        hamburgerButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'service_desk':    return 'Service Desk';
      case 'project_manager': return 'Project Manager';
      case 'programmer':      return 'Programmer';
      case 'owner':           return 'Company Owner';
      case 'client':          return 'Client / Reporter';
      case 'admin':           return 'System Administrator';
      default:                return role;
    }
  };

  const getNavigationMenu = (role) => {
    // end:true forces exact-path matching so parent paths
    // don't show as active when on a child route (e.g. /tickets/tasks)
    const defaultMenu = [
      { name: 'Dashboard Overview', path: '/',        icon: LayoutDashboard, end: true },
      { name: 'All Tickets',        path: '/tickets', icon: ClipboardList,   end: true },
      { name: 'Notifikasi',         path: '/settings/notifications', icon: BellRing },
    ];

    switch (role) {
      case 'service_desk':
        return [
          ...defaultMenu,
          { name: 'Eskalasi Tiket',  path: '/tickets/create',  icon: FilePlus  },
          { name: 'Tiket Walk-in',   path: '/tickets/walk-in', icon: UserPlus  },
        ];
      case 'project_manager':
        return [
          ...defaultMenu,
          { name: 'Assign Ticket', path: '/tickets/assign', icon: UserCheck },
          { name: 'Ticket Claim Approval', path: '/tickets/claim-approval', icon: UserCheck2 },
        ];
      case 'programmer':
        return [
          ...defaultMenu,
          { name: 'Available Tickets', path: '/tickets/available', icon: Hand },
          { name: 'My Tasks', path: '/tickets/tasks', icon: CheckSquare },
        ];
      case 'owner':
        return [
          ...defaultMenu,
          { name: 'Board',              path: '/board',         icon: Kanban },
          { name: 'Arsip',              path: '/archive',       icon: Archive },
          { name: 'Laporan Issues (PM)', path: '/owner/issues', icon: Crown },
          { name: 'System Reports',       path: '/reports',      icon: BarChart3 },
        ];
      case 'client':
        return [
          { name: 'Dashboard Overview', path: '/',              icon: LayoutDashboard, end: true },
          { name: 'Buat Tiket',         path: '/client/create', icon: FilePlus },
          { name: 'Riwayat Tiket',      path: '/tickets',       icon: ClipboardList,   end: true },
          { name: 'Notifikasi',         path: '/settings/notifications', icon: BellRing },
        ];
      case 'admin':
        return [
          { name: 'Admin Dashboard',   path: '/admin',              icon: Shield,          end: true },
          { name: 'Manajemen Pengguna', path: '/admin/users',        icon: Users },
          { name: 'Log Aktivitas',      path: '/admin/activity-logs', icon: ActivitySquare },
          { name: 'Board',              path: '/board',               icon: Kanban },
          { name: 'Arsip',              path: '/archive',             icon: Archive },
          { name: 'Notifikasi',         path: '/settings/notifications', icon: BellRing },
        ];
      default:
        return defaultMenu;
    }
  };

  const baseMenuItems = getNavigationMenu(user?.role);
  const menuItems = canUserArchive(user) && !baseMenuItems.some((item) => item.path === '/archive')
    ? [...baseMenuItems, { name: 'Arsip', path: '/archive', icon: Archive }]
    : baseMenuItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas font-sans text-slate-800">

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        id="sidebar-navigation"
        className={`
          fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-slate-200 bg-white
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:z-auto
          flex flex-col justify-between shadow-sm text-left
        `}
      >
        <div>
          {/* Sidebar Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">
              <span className="text-primary">Ticketing</span>Flow
            </span>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Primary navigation" className="p-4 flex flex-col gap-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-sm font-bold text-[11px] uppercase tracking-wider transition-all duration-150 border-l-4 outline-none group ${
                      isActive
                        ? 'bg-primary/5 text-primary [border-left-color:var(--color-primary)]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 [border-left-color:transparent]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <IconComponent
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive
                            ? 'text-primary'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer - User info & Logout */}
        <div className="p-4 border-t border-slate-200/70 flex items-center justify-between gap-3">
          <div
            onClick={() => navigate('/profile')}
            title="Pengaturan Profil & Keamanan"
            className="flex items-center gap-2.5 min-w-0 flex-1 p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs font-display shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-900 truncate leading-tight font-display group-hover:text-primary transition-colors">{user?.name}</span>
              <span className="block text-[10px] font-medium text-slate-400 truncate mt-0.5">
                {getRoleDisplay(user?.role)}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50/80 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area & Topbar */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header
          className={`
            flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6
            transition-all duration-200 ease-in-out
            ${isHeaderVisible ? 'mt-0' : '-mt-14'}
          `}
        >
          <button
            ref={hamburgerButtonRef}
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
            aria-label="Buka menu navigasi"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar-navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto bg-canvas p-4 md:p-8 flex flex-col items-stretch">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
