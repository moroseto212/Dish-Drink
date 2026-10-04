import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi, uploadApi, authApi } from '../api.js';
import Icon from '../components/Icon.jsx';

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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleChangePassword = async () => {
    setError('');
    setPwSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPwSuccess('Password berhasil diubah.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authApi.deleteAccount();
      setUser(null);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
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
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-spice-100 text-lg"><Icon name="user" className="h-5 w-5 text-spice-600" /></span>
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
                  <Icon name="camera" className="h-4 w-4" />
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

          {/* Ubah Password */}
          {user?.hasPassword && (
            <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-lg"><Icon name="lock" className="h-5 w-5 text-amber-600" /></span>
                Ubah Password
              </h2>

              {pwSuccess && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {pwSuccess}
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="current-pw" className="mb-1.5 block text-sm font-semibold text-stone-700">Password lama</label>
                  <input
                    id="current-pw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-pw" className="mb-1.5 block text-sm font-semibold text-stone-700">Password baru</label>
                  <input
                    id="new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirm-pw" className="mb-1.5 block text-sm font-semibold text-stone-700">Konfirmasi password baru</label>
                  <input
                    id="confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    className={inputClass}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {pwLoading ? 'Mengubah…' : 'Ubah Password'}
                </button>
              </div>
            </section>
          )}

          {/* Hapus Akun */}
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-red-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-lg"><Icon name="warning" className="h-5 w-5 text-red-600" /></span>
              Zona Berbahaya
            </h2>
            <p className="mt-2 text-sm text-red-700">
              Menghapus akun akan menghapus semua data kamu secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="mt-4 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700"
            >
              Hapus Akun Saya
            </button>
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-cream-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-xl"><Icon name="trash" className="h-5 w-5 text-red-600" /></span>
              <h3 className="text-lg font-extrabold text-stone-900">Hapus Akun?</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">
              Semua data, resep, komentar, dan percakapan kamu akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-cream-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Menghapus…' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
