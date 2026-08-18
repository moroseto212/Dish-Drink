import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';
import Icon from '../components/Icon.jsx';

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userApi
      .savedRecipes()
      .then((data) => setRecipes(data.recipes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Resep Tersimpan</h1>
      <p className="mt-1 text-sm text-stone-500">Semua resep yang sudah kamu simpan.</p>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-3xl bg-cream-200">
              <div className="aspect-[4/3]" />
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center py-16 text-center">
          <Icon name="bookmark" className="h-12 w-12 text-stone-300" />
          <h2 className="mt-4 text-lg font-bold text-stone-900">Belum ada resep tersimpan</h2>
          <p className="mt-2 max-w-sm text-sm text-stone-500">
            Simpan resep favoritmu dan semuanya akan muncul di sini.
          </p>
          <Link
            to="/feed"
            className="mt-6 rounded-full bg-ember-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-ember-600/25 transition hover:bg-ember-700"
          >
            Jelajahi Resep
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </main>
  );
}
