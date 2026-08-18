import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';
import Icon from '../components/Icon.jsx';
import { recipeApi } from '../api.js';

export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadedRef = useRef(false);

  const load = useCallback(
    async (p, isNewSearch) => {
      setLoading(true);
      setError('');
      try {
        const data = await recipeApi.list({ search, sort, page: p, limit: 12 });
        setRecipes((prev) => (isNewSearch ? data.recipes : [...prev, ...data.recipes]));
        setPage(p);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [search, sort]
  );

  useEffect(() => {
    if (loadedRef.current) {
      load(1, true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (search) next.set('search', search);
        else next.delete('search');
        next.set('sort', sort);
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      load(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(1, true);
  };

  return (
    <main className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Feed Komunitas</h1>
            <p className="text-sm text-stone-500">Resep publik terbaru &amp; terbaik dari para kreator.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari resep…"
                className="w-48 rounded-full border border-cream-300 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200 sm:w-64"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 outline-none transition focus:border-spice-400"
            >
              <option value="newest">Terbaru</option>
              <option value="best">Terbaik</option>
              <option value="oldest">Terlama</option>
            </select>
          </form>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading && recipes.length === 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-cream-200 bg-white">
                <div className="aspect-[4/3] bg-cream-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-cream-200" />
                  <div className="h-3 w-1/2 rounded bg-cream-200" />
                  <div className="h-3 w-2/3 rounded bg-cream-200" />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-cream-300 bg-white px-6 py-16 text-center">
            <Icon name="food" className="h-12 w-12 text-stone-300" />
            <h2 className="mt-4 text-lg font-bold text-stone-900">Belum ada resep ditemukan</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
              Coba ubah kata kunci pencarian atau masak resep pertamamu dan bagikan ke komunitas!
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>

            {page < totalPages && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => load(page + 1, false)}
                  disabled={loading}
                  className="rounded-full border border-cream-300 bg-white px-7 py-2.5 text-sm font-bold text-stone-700 shadow-sm transition hover:border-spice-300 hover:bg-cream-50 disabled:opacity-60"
                >
                  {loading ? 'Memuat…' : 'Muat lebih banyak'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
  );
}
