import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';
import FollowButton from '../components/FollowButton.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi } from '../api.js';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const profileId = id || currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSelf = profile?.isSelf || (!id && !!currentUser);

  const handleFollowToggle = (following) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: following,
            _count: { ...prev._count, followers: (prev._count?.followers ?? 0) + (following ? 1 : -1) },
          }
        : prev
    );
  };

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    setError('');
    setProfile(null);
    setRecipes([]);

    Promise.all([userApi.getProfile(profileId), userApi.getUserRecipes(profileId)])
      .then(([profileData, recipesData]) => {
        setProfile(profileData.profile);
        setRecipes(recipesData.recipes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [profileId]);

  return (
    <main className="mx-auto max-w-5xl">
      {loading && <p className="py-16 text-center text-sm font-semibold text-stone-500">Memuat profil…</p>}

        {error && (
          <div className="rounded-3xl border border-dashed border-cream-300 bg-white px-6 py-16 text-center">
            <Icon name="lock" className="h-12 w-12 text-stone-300" />
            <h2 className="mt-4 text-lg font-bold text-stone-900">Tidak dapat menampilkan profil</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{error}</p>
            {!id && (
              <Link
                to="/settings"
                className="mt-5 inline-block rounded-full bg-spice-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-spice-700"
              >
                Buka Pengaturan
              </Link>
            )}
          </div>
        )}

        {profile && !error && (
          <>
            {/* Header profil */}
            <div className="overflow-hidden rounded-[2rem] border border-cream-200 bg-white shadow-lg">
              <div className="h-32 bg-gradient-to-r from-spice-500 via-ember-500 to-red-500" />

              <div className="px-6 pb-6 sm:px-8">
                <div className="-mt-12">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                  ) : (
                    <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-spice-600 text-4xl font-bold text-white shadow-lg">
                      {profile.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">{profile.name}</h1>
                    {!isSelf && currentUser && (
                      <div className="flex items-center gap-2">
                        {profile.isFollowing && profile.isFollowedBy && (
                          <Link
                            to={`/messages?user=${profile.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-1.5 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-cream-50"
                          >
                            <Icon name="chat" className="h-3.5 w-3.5" /> Chat
                          </Link>
                        )}
                        <FollowButton
                          key={`${profile.id}-${profile.isFollowing}`}
                          userId={profile.id}
                          initialFollowing={profile.isFollowing}
                          onToggle={handleFollowToggle}
                        />
                      </div>
                    )}
                    {isSelf && (
                      <Link
                        to="/recipes/new"
                        className="inline-flex items-center gap-1.5 rounded-full bg-ember-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-ember-600/25 transition hover:bg-ember-700"
                      >
                        <Icon name="plus" className="h-3.5 w-3.5" />
                        Tambah Resep
                      </Link>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {profile.bio || 'Belum ada bio.'}
                  </p>
                </div>

                <div className="mt-6 flex gap-6 overflow-x-auto border-t border-cream-200 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8">
                  <div>
                    <p className="text-xl font-extrabold text-spice-600">{recipes.length}</p>
                    <p className="text-xs font-medium text-stone-500">Resep{isSelf ? ' (semua)' : ' publik'}</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-spice-600">{profile._count?.following ?? 0}</p>
                    <p className="text-xs font-medium text-stone-500">Mengikuti</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-spice-600">{profile._count?.followers ?? 0}</p>
                    <p className="text-xs font-medium text-stone-500">Pengikut</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-spice-600">{profile._count?.saves ?? 0}</p>
                    <p className="text-xs font-medium text-stone-500">Disimpan orang</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-spice-600">{profile._count?.likes ?? 0}</p>
                    <p className="text-xs font-medium text-stone-500">Total suka</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar resep */}
            <div className="mt-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
                <Icon name="book" className="h-5 w-5 text-stone-700" />
                {isSelf ? 'Resep Saya' : `Resep oleh ${profile.name}`}
              </h2>

              {recipes.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-cream-300 bg-white px-6 py-14 text-center">
                   <Icon name="food" className="h-12 w-12 text-stone-300" />
                  <h3 className="mt-3 text-lg font-bold text-stone-900">
                    {isSelf ? 'Belum ada resep' : 'Belum ada resep publik'}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                    {isSelf
                      ? 'Mulai catat resep andalanmu — bisa privat sebagai buku catatan, atau publik untuk dibagikan.'
                      : 'Pengguna ini belum membagikan resep publik.'}
                  </p>
                  {isSelf && (
                    <Link
                      to="/recipes/new"
                      className="mt-5 inline-block rounded-full bg-ember-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-ember-600/25 transition hover:bg-ember-700"
                    >
                      + Tambah Resep Pertama
                    </Link>
                  )}
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recipes.map((r) => (
                    <div key={r.id} className="relative">
                      {isSelf && (
                        <span
                          className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-semibold shadow ${
                            r.visibility === 'PUBLIC'
                              ? 'bg-lime-100 text-lime-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {r.visibility === 'PUBLIC' ? <><Icon name="globe" className="h-3 w-3 inline" /> Publik</> : <><Icon name="lock" className="h-3 w-3 inline" /> Privat</>}
                        </span>
                      )}
                      <RecipeCard recipe={r} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
  );
}
