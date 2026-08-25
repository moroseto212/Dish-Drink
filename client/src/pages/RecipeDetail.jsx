import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { recipeApi, conversationApi } from '../api.js';
import { formatIngredient, parseLegacyIngredient } from '../constants.js';
import Icon from '../components/Icon.jsx';

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
  const [ratingBusy, setRatingBusy] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [showDeleteRecipe, setShowDeleteRecipe] = useState(false);
  const [deleteRecipeLoading, setDeleteRecipeLoading] = useState(false);

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTarget, setTimerTarget] = useState(null);
  const timerRef = useRef(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);

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

  const handleRate = async (value) => {
    if (!requireAuth() || ratingBusy || !recipe) return;
    setRatingBusy(true);
    try {
      if (recipe.myRating === value) {
        const data = await recipeApi.unrate(recipe.id);
        setRecipe((prev) => ({ ...prev, myRating: data.myRating, avgRating: data.avgRating, ratingCount: data.ratingCount }));
      } else {
        const data = await recipeApi.rate(recipe.id, value);
        setRecipe((prev) => ({ ...prev, myRating: data.myRating, avgRating: data.avgRating, ratingCount: data.ratingCount }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRatingBusy(false);
    }
  };

  const toggleShoppingItem = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyShoppingList = () => {
    if (!recipe) return;
    const lines = recipe.ingredients.map((ing) => `- ${formatIngredient(ing)}`);
    const text = `Belanjaan untuk: ${recipe.title}\n\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const startTimer = (minutes) => {
    const totalSec = minutes * 60;
    setTimerSeconds(totalSec);
    setTimerTarget(Date.now() + totalSec * 1000);
    setTimerRunning(true);
  };

  const toggleTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setTimerTarget(Date.now() + timerSeconds * 1000);
      setTimerRunning(true);
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimerTarget(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (timerRunning && timerTarget) {
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((timerTarget - Date.now()) / 1000));
        setTimerSeconds(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimerRunning(false);
          try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==').play(); } catch {}
          alert('Timer selesai!');
        }
      }, 200);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timerTarget]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalTime = (recipe?.prepTime || 0) + (recipe?.cookTime || 0);

  const openShareModal = async () => {
    if (!requireAuth()) return;
    setShowShareModal(true);
    try {
      const data = await conversationApi.list();
      setConversations(data.conversations);
    } catch (err) {
      setError(err.message);
    }
  };

  const shareToChat = async (convId) => {
    if (!recipe) return;
    setShareLoading(true);
    try {
      await conversationApi.send(convId, `[recipe]${recipe.id}[/recipe]`);
      setShowShareModal(false);
      navigate(`/messages`);
    } catch (err) {
      setError(err.message);
    } finally {
      setShareLoading(false);
    }
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

  const handleDeleteRecipe = async () => {
    if (!recipe) return;
    setDeleteRecipeLoading(true);
    try {
      await recipeApi.remove(recipe.id);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
      setDeleteRecipeLoading(false);
      setShowDeleteRecipe(false);
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
          <Icon name="chevron-left" className="h-4 w-4" />
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
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-spice-300 to-ember-600">
                  <Icon name="food" className="h-16 w-16 text-white/80" />
                </div>
              )}
              {recipe.visibility === 'PRIVATE' && (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  <Icon name="lock" className="h-3.5 w-3.5" /> Privat
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">{recipe.title}</h1>
                  <p className="mt-1.5 text-sm text-stone-500">
                    oleh{' '}
                    <Link to={`/u/${recipe.author?.id}`} className="font-semibold text-stone-700 hover:text-spice-600">
                      {recipe.author?.name}
                    </Link>
                  </p>
                </div>
                {user && recipe.authorId === user.id && (
                  <div className="flex shrink-0 gap-2">
                    <Link
                      to={`/recipes/${recipe.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-cream-50"
                    >
                      <Icon name="write" className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowDeleteRecipe(true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-50"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" /> Hapus
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 rounded-full bg-spice-100 px-3 py-1.5 text-spice-700">
                  {recipe.category === 'DRINK' ? <><Icon name="drink" className="h-3.5 w-3.5 inline" /> Minuman</> : <><Icon name="food" className="h-3.5 w-3.5 inline" /> Makanan</>}
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
                  <span className="flex items-center gap-1 rounded-full bg-cream-200 px-3 py-1.5 text-stone-700"><Icon name="food" className="h-3.5 w-3.5" /> {recipe.servings} porsi</span>
                )}
              </div>

              {recipe.description && (
                <p className="mt-6 whitespace-pre-line leading-relaxed text-stone-700">{recipe.description}</p>
              )}

              {/* Timer */}
              {(recipe.cookTime || recipe.prepTime) && (
                <div className="mt-6 rounded-2xl border border-cream-200 bg-cream-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="flex items-center gap-1.5 text-sm font-bold text-stone-900"><Icon name="timer" className="h-4 w-4" /> Timer Memasak</h3>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {timerRunning ? (
                          <span className="font-mono text-lg font-extrabold text-ember-600">{formatTime(timerSeconds)}</span>
                        ) : timerSeconds > 0 ? (
                          <span className="font-mono text-lg font-extrabold text-stone-400">{formatTime(timerSeconds)}</span>
                        ) : (
                          `Total ${totalTime} menit`
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {timerSeconds > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={toggleTimer}
                            className={`rounded-full px-4 py-2 text-xs font-bold text-white transition ${
                              timerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {timerRunning ? <><Icon name="pause" className="h-4 w-4 inline" /> Jeda</> : <><Icon name="play" className="h-4 w-4 inline" /> Lanjut</>}
                          </button>
                          <button
                            type="button"
                            onClick={resetTimer}
                            className="rounded-full border border-cream-300 bg-white px-3 py-2 text-xs font-bold text-stone-600 transition hover:bg-cream-50"
                          >
                            <Icon name="reset" className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {!timerRunning && timerSeconds === 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recipe.prepTime && (
                        <button
                          type="button"
                          onClick={() => startTimer(recipe.prepTime)}
                          className="rounded-full border border-spice-200 bg-white px-3 py-1.5 text-xs font-bold text-spice-700 transition hover:bg-spice-50"
                        >
                          Persiapan {recipe.prepTime} mnt
                        </button>
                      )}
                      {recipe.cookTime && (
                        <button
                          type="button"
                          onClick={() => startTimer(recipe.cookTime)}
                          className="rounded-full border border-ember-200 bg-white px-3 py-1.5 text-xs font-bold text-ember-700 transition hover:bg-ember-50"
                        >
                          Memasak {recipe.cookTime} mnt
                        </button>
                      )}
                      {totalTime > 0 && (
                        <button
                          type="button"
                          onClick={() => startTimer(totalTime)}
                          className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-50"
                        >
                          Total {totalTime} mnt
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <section>
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-spice-100"><Icon name="ingredients" className="h-5 w-5 text-spice-600" /></span>
                      Bahan-bahan
                    </h2>
                    <button
                      type="button"
                      onClick={() => { setShowShoppingList(true); setCheckedItems({}); }}
                      className="rounded-full bg-spice-100 px-3 py-1.5 text-xs font-bold text-spice-700 transition hover:bg-spice-200"
                    >
                      <><Icon name="cart" className="h-5 w-5 inline" /> Daftar Belanja</>
                    </button>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {(recipe.ingredients || []).map((ing, i) => {
                      const item = parseLegacyIngredient(ing);
                      const hasQty = item.amount || item.unit;
                      return (
                        <li key={i} className="flex items-center gap-3 rounded-xl bg-cream-50 px-4 py-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-spice-100 text-xs font-bold text-spice-600">
                            {i + 1}
                          </span>
                          {hasQty && (
                            <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-stone-700 shadow-sm ring-1 ring-cream-200">
                              {item.amount}{item.amount && item.unit ? ' ' : ''}{item.unit}
                            </span>
                          )}
                          <span className="text-sm font-medium text-stone-800">{item.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember-100"><Icon name="steps" className="h-5 w-5 text-ember-600" /></span>
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
                  {recipe.liked ? (
                    <Icon name="heart-filled" className="h-4 w-4 text-red-500" />
                  ) : (
                    <Icon name="heart" className="h-4 w-4 text-red-500" />
                  )}
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
                  {recipe.saved ? (
                    <Icon name="bookmark-filled" className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Icon name="bookmark" className="h-4 w-4" />
                  )}
                  {recipe._count?.saves ?? 0} Simpan
                </button>
                <span className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2 text-stone-600">
                  <Icon name="chat" className="h-4 w-4" />
                  {recipe._count?.comments ?? 0} Komentar
                </span>
                {user && (
                  <button
                    type="button"
                    onClick={openShareModal}
                    className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2 text-stone-600 transition hover:border-spice-300 hover:bg-spice-50 hover:text-spice-700"
                  >
                    <Icon name="share" className="h-4 w-4" />
                    Bagikan
                  </button>
                )}
              </div>

              {/* Rating */}
              <div className="mt-5 flex items-center gap-3 border-t border-cream-200 pt-5">
                <span className="text-sm font-semibold text-stone-600">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      disabled={ratingBusy}
                      onClick={() => handleRate(v)}
                      className="text-2xl transition hover:scale-125"
                      title={`${v} bintang`}
                    >
                      {recipe.myRating && v <= recipe.myRating ? (
                        <Icon name="star-filled" className="h-6 w-6 text-amber-400" />
                      ) : (
                        <Icon name="star" className="h-6 w-6 text-stone-300" />
                      )}
                    </button>
                  ))}
                </div>
                {recipe.avgRating && (
                  <span className="text-sm font-bold text-amber-600">
                    {recipe.avgRating} <span className="font-normal text-stone-400">({recipe.ratingCount} rating)</span>
                  </span>
                )}
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

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-md max-h-[80vh] overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-stone-900"><Icon name="share" className="h-5 w-5" /> Bagikan ke Chat</h3>
              <button onClick={() => setShowShareModal(false)} className="rounded-full p-1 text-stone-400 transition hover:bg-cream-100 hover:text-stone-600">
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(80vh - 8rem)' }}>
              {conversations.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">Belum ada percakapan.</p>
              ) : (
                <ul className="space-y-2">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => shareToChat(c.id)}
                        disabled={shareLoading}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-cream-50 disabled:opacity-50"
                      >
                        {c.otherUser?.avatarUrl ? (
                          <img src={c.otherUser.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-spice-600 text-sm font-bold text-white">
                            {c.otherUser?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                        <span className="truncate text-sm font-bold text-stone-900">{c.otherUser?.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {showShoppingList && recipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShoppingList(false)} />
          <div className="relative w-full max-w-md max-h-[80vh] overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-stone-900"><Icon name="cart" className="h-5 w-5" /> Daftar Belanja</h3>
              <button onClick={() => setShowShoppingList(false)} className="rounded-full p-1 text-stone-400 transition hover:bg-cream-100 hover:text-stone-600">
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(80vh - 8rem)' }}>
              <p className="mb-3 text-xs font-semibold text-stone-400">{recipe.title}</p>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => {
                  const item = parseLegacyIngredient(ing);
                  const checked = !!checkedItems[idx];
                  const hasQty = item.amount || item.unit;
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => toggleShoppingItem(idx)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          checked ? 'bg-green-50 text-green-700 line-through' : 'bg-cream-50 text-stone-700 hover:bg-cream-100'
                        }`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                          checked ? 'border-green-500 bg-green-500 text-white' : 'border-stone-300'
                        }`}>
                          {checked && <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        {hasQty && (
                          <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold ring-1 ring-cream-200">
                            {item.amount}{item.amount && item.unit ? ' ' : ''}{item.unit}
                          </span>
                        )}
                        <span className="text-sm font-medium">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-cream-200 px-6 py-4">
              <button
                type="button"
                onClick={copyShoppingList}
                className="w-full rounded-full bg-spice-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-spice-700"
              >
                <><Icon name="copy" className="h-5 w-5 inline" /> Salin ke Clipboard</>
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteRecipe(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-cream-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100"><Icon name="trash" className="h-5 w-5 text-red-500" /></span>
              <h3 className="text-lg font-extrabold text-stone-900">Hapus Resep?</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">
              Resep "{recipe?.title}" akan dihapus permanen beserta semua komentar, suka, dan simpan. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowDeleteRecipe(false)} className="rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-cream-50">Batal</button>
              <button type="button" onClick={handleDeleteRecipe} disabled={deleteRecipeLoading} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700 disabled:opacity-50">
                {deleteRecipeLoading ? 'Menghapus…' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCommentToDelete(null)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-cream-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100"><Icon name="trash" className="h-5 w-5 text-red-500" /></span>
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
