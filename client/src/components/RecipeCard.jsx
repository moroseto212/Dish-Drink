import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { recipeApi } from '../api.js';
import Icon from './Icon.jsx';

export default function RecipeCard({ recipe }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(!!recipe.liked);
  const [saved, setSaved] = useState(!!recipe.saved);
  const [likesCount, setLikesCount] = useState(recipe._count?.likes ?? 0);
  const [savesCount, setSavesCount] = useState(recipe._count?.saves ?? 0);
  const [busy, setBusy] = useState(false);

  const totalTime =
    recipe.prepTime || recipe.cookTime
      ? (recipe.prepTime || 0) + (recipe.cookTime || 0)
      : null;

  const requireAuth = (e) => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth() || busy) return;
    setBusy(true);
    try {
      if (liked) {
        const data = await recipeApi.unlike(recipe.id);
        setLiked(false);
        setLikesCount(data.likesCount);
      } else {
        const data = await recipeApi.like(recipe.id);
        setLiked(true);
        setLikesCount(data.likesCount);
      }
    } catch {
      // abaikan
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth() || busy) return;
    setBusy(true);
    try {
      if (saved) {
        const data = await recipeApi.unsave(recipe.id);
        setSaved(false);
        setSavesCount(data.savesCount);
      } else {
        const data = await recipeApi.save(recipe.id);
        setSaved(true);
        setSavesCount(data.savesCount);
      }
    } catch {
      // abaikan
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-cream-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      {recipe.coverUrl ? (
        <img
          src={recipe.coverUrl}
          alt={recipe.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-spice-300 to-ember-600">
          <Icon name={recipe.category === 'DRINK' ? 'drink' : 'food'} className="h-16 w-16 text-white/80" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 transition group-hover:from-black/85" />

      {recipe.category && (
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-stone-800 shadow backdrop-blur">
          <Icon name={recipe.category === 'DRINK' ? 'drink' : 'food'} className="h-3.5 w-3.5" />
          {recipe.category === 'DRINK' ? 'Minuman' : 'Makanan'}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-white drop-shadow-sm transition group-hover:text-amber-200">
          {recipe.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-white/85">
          {totalTime && (
            <span className="flex items-center gap-1">
              <Icon name="clock" className="h-3.5 w-3.5" /> {totalTime} mnt
            </span>
          )}
          <button
            type="button"
            onClick={toggleLike}
            disabled={busy}
            className="flex items-center gap-1 transition hover:scale-110"
            title={liked ? 'Batalkan suka' : 'Suka'}
          >
            {liked ? (
              <Icon name="heart-filled" className={`h-3.5 w-3.5 ${liked ? 'text-red-500' : ''}`} />
            ) : (
              <Icon name="heart" className="h-3.5 w-3.5" />
            )}
            {likesCount}
          </button>
          <button
            type="button"
            onClick={toggleSave}
            disabled={busy}
            className={`flex items-center gap-1 transition hover:scale-110 ${saved ? 'text-amber-300' : 'opacity-80'}`}
            title={saved ? 'Batalkan simpan' : 'Simpan'}
          >
            <Icon name={saved ? 'bookmark-filled' : 'bookmark'} className="h-3.5 w-3.5" />
            {savesCount}
          </button>
          <span className="flex items-center gap-1">
            <Icon name="chat" className="h-3.5 w-3.5 text-sky-300" /> {recipe._count?.comments ?? 0}
          </span>
        </div>

        {recipe.author && (
          <div className="mt-2.5 flex items-center gap-2">
            {recipe.author.avatarUrl ? (
              <img
                src={recipe.author.avatarUrl}
                alt={recipe.author.name}
                className="h-6 w-6 rounded-full border border-white/40 object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-spice-600 text-[10px] font-bold text-white">
                {recipe.author.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
            <span className="truncate text-xs font-medium text-white/90">oleh {recipe.author.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
