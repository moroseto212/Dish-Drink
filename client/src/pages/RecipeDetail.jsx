import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { recipeApi } from '../api.js';

const difficultyLabel = { EASY: 'Mudah', MEDIUM: 'Sedang', HARD: 'Sulit' };
const difficultyColor = {
  EASY: 'bg-lime-100 text-lime-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
};

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    recipeApi
      .get(id)
      .then((data) => setRecipe(data.recipe))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const refreshRecipe = async () => {
    try {
      const data = await recipeApi.get(id);
      setRecipe(data.recipe);
    } catch (err) {
      setError(err.message);
    }
  };

  const requireAuth = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || actionBusy || !recipe) return;
    setActionBusy(true);
    try {
      if (recipe.liked) {
        const data = await recipeApi.unlike(recipe.id);
        setRecipe((prev) => ({ ...prev, liked: false, _count: { ...prev._count, likes: data.likesCount } }));
      } else {
        const data = await recipeApi.like(recipe.id);
        setRecipe((prev) => ({ ...prev, liked: true, _count: { ...prev._count, likes: data.likesCount } }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleSave = async () => {
    if (!requireAuth() || actionBusy || !recipe) return;
    setActionBusy(true);
    try {
      if (recipe.saved) {
        const data = await recipeApi.unsave(recipe.id);
        setRecipe((prev) => ({ ...prev, saved: false, _count: { ...prev._count, saves: data.savesCount } }));
      } else {
        const data = await recipeApi.save(recipe.id);
        setRecipe((prev) => ({ ...prev, saved: true, _count: { ...prev._count, saves: data.savesCount } }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!requireAuth() || !recipe) return;
    const content = commentText.trim();
    if (!content || commentBusy) return;
    setCommentBusy(true);
    try {
      await recipeApi.addComment(recipe.id, content);
      await refreshRecipe();
      setCommentText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCommentBusy(false);
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!requireAuth() || !recipe) return;
    const content = replyText.trim();
    if (!content || commentBusy) return;
    setCommentBusy(true);
    try {
      await recipeApi.addComment(recipe.id, content, parentId);
      await refreshRecipe();
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCommentBusy(false);
    }
  };

  const startReply = (comment) => {
    if (!requireAuth()) return;
    if (replyingTo === comment.id) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setReplyingTo(comment.id);
      setReplyText(comment.user.name ? `@${comment.user.name} ` : '');
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete || !recipe) return;
    try {
      await recipeApi.deleteComment(recipe.id, commentToDelete);
      await refreshRecipe();
    } catch (err) {
      setError(err.message);
    } finally {
      setCommentToDelete(null);
    }
  };

  const renderComment = (c, depth = 0) => {
    const mine = user && c.user.id === user.id;
    const isReplying = replyingTo === c.id;
    return (
      <li key={c.id} className={depth > 0 ? 'mt-3' : ''}>
        <div className={`flex items-start gap-3 ${depth > 0 ? 'pl-8 sm:pl-10' : ''}`}>
          {c.user.avatarUrl ? (
            <img src={c.user.avatarUrl} alt={c.user.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spice-600 text-xs font-bold text-white">
              {c.user.name?.charAt(0)?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1 rounded-2xl bg-cream-50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <Link to={`/u/${c.user.id}`} className="truncate text-sm font-bold text-stone-900 hover:text-spice-600">
                {c.user.name}
              </Link>
              <span className="text-[11px] text-stone-400">
                {new Date(c.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-700">{c.content}</p>
            <div className="mt-1.5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => startReply(c)}
                className="text-xs font-semibold text-spice-600 transition hover:text-spice-700"
              >
                Balas
              </button>
              {mine && (
                <button
                  type="button"
                  onClick={() => handleDeleteComment(c.id)}
                  className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        {isReplying && (
          <form
            onSubmit={(e) => handleReply(e, c.id)}
            className="mt-2 flex items-center gap-2 pl-8 sm:pl-10"
          >
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Balas ${c.user.name}…`}
              autoFocus
              className="flex-1 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200"
            />
            <button
              type="submit"
              disabled={commentBusy || !replyText.trim()}
              className="rounded-full bg-ember-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-ember-700 disabled:opacity-50"
            >
              Kirim
            </button>
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              className="rounded-full border border-cream-300 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-cream-50"
            >
              Batal
            </button>
          </form>
        )}

        {(c.replies || []).length > 0 && (
          <ul className="mt-3 space-y-3">
            {c.replies.map((r) => renderComment(r, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
    <main className="mx-auto max-w-4xl">
        <Link to="/feed" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-spice-600 hover:text-spice-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Feed
        </Link>

        {loading && <p className="py-16 text-center text-sm font-semibold text-stone-500">Memuat resep…</p>}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {recipe && (
          <article className="overflow-hidden rounded-[2rem] border border-cream-200 bg-white shadow-lg">
            <div className="relative aspect-[16/9] w-full bg-cream-200">
              {recipe.coverUrl ? (
                <img src={recipe.coverUrl} alt={recipe.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-spice-300 to-ember-600 text-8xl">
                  🍽️
                </div>
              )}
              {recipe.visibility === 'PRIVATE' && (
                <span className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  🔒 Privat
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">{recipe.title}</h1>
              <p className="mt-1.5 text-sm text-stone-500">
                oleh{' '}
                <Link to={`/u/${recipe.author?.id}`} className="font-semibold text-stone-700 hover:text-spice-600">
                  {recipe.author?.name}
                </Link>
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-spice-100 px-3 py-1.5 text-spice-700">
                  {recipe.category === 'DRINK' ? '🥤 Minuman' : '🍚 Makanan'}
                </span>
                {recipe.difficulty && (
                  <span className={`rounded-full px-3 py-1.5 ${difficultyColor[recipe.difficulty]}`}>
                    {difficultyLabel[recipe.difficulty]}
                  </span>
                )}
                {recipe.prepTime && (
                  <span className="rounded-full bg-cream-200 px-3 py-1.5 text-stone-700">Persiapan {recipe.prepTime} mnt</span>
                )}
                {recipe.cookTime && (
                  <span className="rounded-full bg-cream-200 px-3 py-1.5 text-stone-700">Memasak {recipe.cookTime} mnt</span>
                )}
                {recipe.servings && (
                  <span className="rounded-full bg-cream-200 px-3 py-1.5 text-stone-700">🍽 {recipe.servings} porsi</span>
                )}
              </div>

              {recipe.description && (
                <p className="mt-6 whitespace-pre-line leading-relaxed text-stone-700">{recipe.description}</p>
              )}

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <section>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-spice-100 text-base">🥕</span>
                    Bahan-bahan
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {(recipe.ingredients || []).map((ing, i) => {
                      const item = typeof ing === 'string' ? { name: ing } : ing;
                      return (
                        <li key={i} className="flex items-start gap-3 text-sm text-stone-700">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-spice-500" />
                          <span>
                            {item.amount && <strong className="mr-1.5 text-stone-900">{item.amount}</strong>}
                            {item.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember-100 text-base">👨‍🍳</span>
                    Langkah memasak
                  </h2>
                  <ol className="mt-4 space-y-4">
                    {(recipe.steps || []).map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed text-stone-700">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ember-600 text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-cream-200 pt-6 text-sm font-semibold text-stone-500">
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={actionBusy}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 transition ${
                    recipe.liked
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-cream-300 bg-white text-stone-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill={recipe.liked ? '#ef4444' : 'none'} stroke="#ef4444" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {recipe._count?.likes ?? 0} Suka
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={actionBusy}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 transition ${
                    recipe.saved
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-cream-300 bg-white text-stone-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill={recipe.saved ? '#f59e0b' : 'none'} stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {recipe._count?.saves ?? 0} Simpan
                </button>
                <span className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2 text-stone-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {recipe._count?.comments ?? 0} Komentar
                </span>
              </div>

              {/* Komentar */}
              <section className="mt-8 border-t border-cream-200 pt-6">
                <h2 className="text-lg font-bold text-stone-900">Komentar ({recipe._count?.comments ?? 0})</h2>

                <form onSubmit={handleComment} className="mt-4 flex items-center gap-3">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spice-600 text-xs font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={user ? 'Tulis komentar…' : 'Masuk untuk berkomentar'}
                    readOnly={!user}
                    onFocus={() => !user && requireAuth()}
                    className="flex-1 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200"
                  />
                  <button
                    type="submit"
                    disabled={!user || commentBusy || !commentText.trim()}
                    className="rounded-full bg-ember-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ember-700 disabled:opacity-50"
                  >
                    Kirim
                  </button>
                </form>

                <ul className="mt-6 space-y-5">
                  {(recipe.comments || []).map((c) => renderComment(c))}
                  {(recipe.comments || []).length === 0 && (
                    <li className="py-6 text-center text-sm text-stone-500">Belum ada komentar. Jadilah yang pertama!</li>
                  )}
                </ul>
              </section>
            </div>
          </article>
        )}
      </main>

      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCommentToDelete(null)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-cream-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-xl">🗑️</span>
              <h3 className="text-lg font-extrabold text-stone-900">Hapus komentar?</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">
              Komentar ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                className="rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-cream-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteComment}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
