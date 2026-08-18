import { useEffect, useState } from 'react';
import { userApi } from '../api.js';

export default function FollowButton({ userId, initialFollowing = false, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (following) {
        await userApi.unfollow(userId);
      } else {
        await userApi.follow(userId);
      }
      const next = !following;
      setFollowing(next);
      onToggle?.(next);
    } catch {
      // abaikan kesalahan, biarkan tombol apa adanya
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
        following
          ? 'border border-cream-300 bg-white text-stone-700 hover:bg-cream-50'
          : 'bg-ember-600 text-white shadow-md shadow-ember-600/25 hover:bg-ember-700'
      }`}
    >
      {loading ? '…' : following ? 'Mengikuti' : 'Ikuti'}
    </button>
  );
}
