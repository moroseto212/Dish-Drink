import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FollowButton from '../components/FollowButton.jsx';
import Icon from '../components/Icon.jsx';
import { userApi } from '../api.js';

export default function Explore() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (keyword) => {
    setLoading(true);
    setError('');
    try {
      const data = await userApi.searchUsers(keyword);
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(q.trim());
  };

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Cari Teman</h1>
      <p className="mt-1 text-sm text-stone-500">
        Temukan pengguna lain dan ikuti resep-resep mereka.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <div className="relative flex-1">
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau email…"
            className="w-full rounded-full border border-cream-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-spice-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-spice-600/25 transition hover:bg-spice-700"
        >
          Cari
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading && users.length === 0 ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-cream-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-cream-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-cream-200" />
                  <div className="h-3 w-1/2 rounded bg-cream-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-cream-300 bg-white px-6 py-14 text-center">
           <Icon name="search" className="h-12 w-12 text-stone-300" />
          <h2 className="mt-4 text-lg font-bold text-stone-900">Tidak ada pengguna ditemukan</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
            Coba kata kunci lain, atau undang temanmu untuk bergabung di Dish &amp; Drink.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 rounded-2xl border border-cream-200 bg-white p-4 transition hover:border-spice-200 hover:shadow-md"
            >
              <Link to={`/u/${u.id}`} className="shrink-0">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-spice-600 text-lg font-bold text-white">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/u/${u.id}`} className="truncate text-sm font-bold text-stone-900 hover:text-spice-600">
                    {u.name}
                  </Link>
                </div>
                <p className="mt-0.5 truncate text-xs text-stone-500">
                  {u.bio || `${u._count?.recipes ?? 0} resep`}
                </p>
                <p className="text-xs text-stone-400">{u._count?.followers ?? 0} pengikut</p>
              </div>

              <FollowButton userId={u.id} initialFollowing={u.isFollowing} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
