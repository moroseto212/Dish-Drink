import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationApi, conversationApi } from '../api.js';
import Logo from './Logo.jsx';

const navItems = [
  { to: '/feed', label: 'Beranda', icon: 'home' },
  { to: '/saved', label: 'Tersimpan', icon: 'bookmark' },
  { to: '/explore', label: 'Cari Teman', icon: 'search' },
  { to: '/messages', label: 'Pesan', icon: 'chat' },
  { to: '/profile', label: 'Profil Saya', icon: 'user' },
  { to: '/settings', label: 'Pengaturan', icon: 'gear' },
];

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function Icon({ name, className = 'h-5 w-5' }) {
  const props = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, viewBox: '0 0 24 24', className };
  switch (name) {
    case 'home':
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      );
    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'gear':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5M21 12H9" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...props}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg {...props}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...props}>
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case 'close':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
        </svg>
      );
    default:
      return null;
  }
}

function SidebarBody({ onNavigate, notifications, unreadCount, msgUnread, bellOpen, onToggleBell }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onNavigate?.();
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-full flex-col">
      <Link to={user ? '/feed' : '/'} className="flex items-center gap-2 px-5 pt-5" onClick={onNavigate}>
        <Logo className="h-9 w-9" />
        <span className="text-lg font-extrabold tracking-tight text-stone-900">
          Dish <span className="text-spice-600">&amp;</span> Drink
        </span>
      </Link>

      <nav className="mt-8 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                isActive
                  ? 'bg-spice-100 text-spice-700'
                  : 'text-stone-600 hover:bg-cream-100 hover:text-stone-900'
              }`
            }
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span className="flex-1">{item.label}</span>
            {item.to === '/messages' && msgUnread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-600 px-1 text-[10px] font-bold text-white">
                {msgUnread > 99 ? '99+' : msgUnread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative border-t border-cream-200 p-4">
        {user ? (
          <>
            <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-spice-600 text-sm font-bold text-white">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-stone-900">{user.name}</p>
              <p className="truncate text-xs text-stone-500">{user.email}</p>
            </div>

            <div className="relative">
              <button
                onClick={onToggleBell}
                className={`rounded-lg p-2 transition ${
                  unreadCount > 0
                    ? 'text-ember-600 hover:bg-red-50'
                    : 'text-stone-400 hover:bg-cream-100 hover:text-stone-700'
                }`}
                title="Notifikasi"
                aria-label="Notifikasi"
              >
                <Icon name="bell" className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-stone-400 transition hover:bg-red-50 hover:text-ember-600"
              title="Keluar"
              aria-label="Keluar"
            >
              <Icon name="logout" className="h-5 w-5" />
            </button>
          </div>

          {bellOpen && (
            <div className="absolute bottom-full left-4 right-4 z-50 mb-2 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-2xl">
              <div className="border-b border-cream-200 px-4 py-3 text-sm font-extrabold text-stone-900">
                Notifikasi
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-stone-500">Belum ada notifikasi.</p>
                ) : (
                  <ul>
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <Link
                          to={n.actorId ? `/u/${n.actorId}` : '/profile'}
                          onClick={onNavigate}
                          className={`flex items-start gap-2 px-4 py-3 text-sm transition hover:bg-cream-50 ${
                            n.isRead ? '' : 'bg-spice-50'
                          }`}
                        >
                           <Icon name="user" className="h-4 w-4 text-stone-400" />
                          <span className="min-w-0 flex-1">
                            <span className={`block ${n.isRead ? 'text-stone-600' : 'font-bold text-stone-900'}`}>
                              {n.text}
                            </span>
                            <span className="text-xs text-stone-400">{timeAgo(n.createdAt)}</span>
                          </span>
                          {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ember-600" />}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          </>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              onClick={onNavigate}
              className="block rounded-xl bg-ember-600 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-ember-700"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={onNavigate}
              className="block rounded-xl border border-cream-300 px-4 py-2.5 text-center text-sm font-bold text-stone-700 transition hover:bg-cream-50"
            >
              Sign Up Gratis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [msgUnread, setMsgUnread] = useState(0);
  const location = useLocation();

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationApi.list();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // abaikan
    }
  }, [user]);

  const loadMsgUnread = useCallback(async () => {
    if (!user) return;
    try {
      const data = await conversationApi.unreadCount();
      setMsgUnread(data.unreadCount);
    } catch {
      // abaikan
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const timer = setInterval(loadNotifications, 20000);
    return () => clearInterval(timer);
  }, [user, loadNotifications]);

  useEffect(() => {
    if (!user) return;
    loadMsgUnread();
    const timer = setInterval(loadMsgUnread, 15000);
    return () => clearInterval(timer);
  }, [user, loadMsgUnread]);

  useEffect(() => {
    setMobileOpen(false);
    setBellOpen(false);
  }, [location.pathname]);

  const handleToggleBell = () => {
    const next = !bellOpen;
    setBellOpen(next);
    if (next && unreadCount > 0) {
      notificationApi.readAll().catch(() => {});
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const sidebarProps = {
    notifications,
    unreadCount,
    msgUnread,
    bellOpen,
    onToggleBell: handleToggleBell,
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-cream-200 bg-white md:block">
        <SidebarBody {...sidebarProps} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-stone-500 transition hover:bg-cream-100"
              aria-label="Tutup menu"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
            <SidebarBody {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-xl border border-cream-200 bg-white p-2.5 text-stone-700 shadow-sm transition hover:bg-cream-50 md:hidden"
        aria-label="Buka menu"
      >
        <Icon name="menu" className="h-5 w-5" />
      </button>

      <div className="md:pl-64">
        <div className="px-4 py-8 pt-16 md:px-8 md:py-10 md:pt-10">{children}</div>
      </div>
    </div>
  );
}
