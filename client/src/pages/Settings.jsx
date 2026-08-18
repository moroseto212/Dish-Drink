import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi, uploadApi } from '../api.js';

const inputClass =
  'w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200';

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5MB.');
      return;
    }
    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let newUser = user;
      if (avatarFile) {
        const uploadData = await uploadApi.avatar(avatarFile);
        newUser = uploadData.user;
        setUser(uploadData.user);
      }
      const data = await userApi.updateMe({
        name,
        bio,
      });
      setUser({ ...newUser, ...data.user });
      setAvatarFile(null);
      setSuccess('Pengaturan berhasil disimpan.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-stone-500">Kelola profilmu.</p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Profil */}
          <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-spice-100 text-lg">👤</span>
              Informasi Profil
            </h2>

            {/* Foto profil */}
            <div className="mt-4 flex items-center gap-5">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Foto profil"
                    className="h-20 w-20 rounded-full border-4 border-cream-200 object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-cream-200 bg-spice-600 text-3xl font-bold text-white">
                    {(name || user?.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="avatar-file"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-spice-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-spice-700"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                    />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Pilih Foto dari Galeri
                </label>
                <input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handlePickAvatar}
                  className="hidden"
                />
                <p className="mt-2 text-xs text-stone-400">
                  JPG, PNG, atau GIF. Maksimal 5MB.
                  {avatarFile && (
                    <span className="ml-1 font-semibold text-spice-600">Foto baru dipilih, simpan untuk mengunggah.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-stone-700">
                  Nama tampilan
                </label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="bio" className="mb-1.5 block text-sm font-semibold text-stone-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cerita singkat tentang dapurmu…"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-cream-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:bg-cream-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ember-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-ember-600/25 transition hover:bg-ember-700 disabled:opacity-60"
            >
              {loading ? 'Menyimpan…' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </main>
  );
}
