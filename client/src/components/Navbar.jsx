import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function Navbar({ transparent = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/feed?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur ${
        transparent ? 'border-transparent bg-transparent' : 'border-cream-200 bg-cream-50/90'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={user ? '/feed' : '/'} className="flex shrink-0 items-center gap-2">
          <Logo className="h-9 w-9" />
          <span className="text-lg font-extrabold tracking-tight text-stone-900">
            Dish <span className="text-spice-600">&amp;</span> Drink
          </span>
        </Link>

        {user && (
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari resep atau kreator…"
                className="w-full rounded-full border border-cream-300 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200"
              />
            </div>
          </form>
        )}

        <nav className="flex shrink-0 items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-cream-200"
                aria-label="Menu akun"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-9 w-9 rounded-full border border-cream-300 object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-spice-600 text-sm font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {menuOpen && (
                <>
                  <button
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Tutup"
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-lg">
                    <div className="border-b border-cream-200 px-4 py-3">
                      <p className="truncate text-sm font-bold text-stone-900">{user.name}</p>
                      <p className="truncate text-xs text-stone-500">{user.email}</p>
                    </div>
                    <Link
                      to="/feed"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-stone-700 transition hover:bg-cream-100"
                    >
                      Beranda (Feed)
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-stone-700 transition hover:bg-cream-100"
                    >
                      Profil Saya
                    </Link>
                    <Link
                      to="/recipes/new"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-stone-700 transition hover:bg-cream-100"
                    >
                      + Tambah Resep
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-stone-700 transition hover:bg-cream-100"
                    >
                      Pengaturan
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-ember-600 transition hover:bg-red-50"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-cream-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-ember-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ember-700"
              >
                Sign Up Gratis
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
