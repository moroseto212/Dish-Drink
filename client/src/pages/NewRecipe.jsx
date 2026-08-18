import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeApi, uploadApi } from '../api.js';

const difficultyOptions = [
  { value: 'EASY', label: 'Mudah', emoji: '🌱' },
  { value: 'MEDIUM', label: 'Sedang', emoji: '🍳' },
  { value: 'HARD', label: 'Sulit', emoji: '🔥' },
];

function SectionTitle({ emoji, title }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-spice-100 text-lg">{emoji}</span>
      {title}
    </h2>
  );
}

const inputClass =
  'w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200';

export default function NewRecipe() {
  const navigate = useNavigate();

  const [category, setCategory] = useState('FOOD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [ingredients, setIngredients] = useState([{ amount: '', name: '' }]);
  const [steps, setSteps] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateIngredient = (i, field, value) =>
    setIngredients((prev) => prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)));

  const addIngredient = () => setIngredients((prev) => [...prev, { amount: '', name: '' }]);
  const removeIngredient = (i) => setIngredients((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const updateStep = (i, value) => setSteps((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  const addStep = () => setSteps((prev) => [...prev, '']);
  const removeStep = (i) => setSteps((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const handlePickCover = (e) => {
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
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanIngredients = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => ({ amount: ing.amount.trim(), name: ing.name.trim() }));

    const cleanSteps = steps.filter((s) => s.trim());

    if (!title.trim()) return fail('Judul resep wajib diisi');
    if (cleanIngredients.length === 0) return fail('Minimal satu bahan wajib diisi');
    if (cleanSteps.length === 0) return fail('Minimal satu langkah wajib diisi');

    try {
      let coverUrl = null;
      if (coverFile) {
        const uploadData = await uploadApi.cover(coverFile);
        coverUrl = uploadData.url;
      }

      await recipeApi.create({
        title,
        description,
        coverUrl,
        category,
        ingredients: cleanIngredients,
        steps: cleanSteps,
        prepTime: prepTime ? parseInt(prepTime, 10) : null,
        cookTime: cookTime ? parseInt(cookTime, 10) : null,
        servings: servings ? parseInt(servings, 10) : null,
        difficulty,
        visibility,
      });
      navigate('/profile');
    } catch (err) {
      fail(err.message);
    }

    function fail(msg) {
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Tambah Resep Baru</h1>
        <p className="mt-1 text-sm text-stone-500">
          Simpan sebagai catatan pribadi, atau bagikan ke komunitas.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Kategori */}
          <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
            <SectionTitle emoji="🍱" title="Jenis resep" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('FOOD')}
                className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-base font-bold transition ${
                  category === 'FOOD'
                    ? 'border-spice-500 bg-spice-50 text-spice-700'
                    : 'border-cream-200 bg-cream-50 text-stone-500 hover:border-cream-300'
                }`}
              >
                🍚 Makanan
              </button>
              <button
                type="button"
                onClick={() => setCategory('DRINK')}
                className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-base font-bold transition ${
                  category === 'DRINK'
                    ? 'border-spice-500 bg-spice-50 text-spice-700'
                    : 'border-cream-200 bg-cream-50 text-stone-500 hover:border-cream-300'
                }`}
              >
                🥤 Minuman
              </button>
            </div>
          </section>

          {/* Info dasar */}
          <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
            <SectionTitle emoji="📝" title="Informasi dasar" />
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Judul resep *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="cth: Nasi Goreng Spesial" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Cerita singkat tentang resep ini…"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Foto resep</label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 sm:w-56">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Pratinjau foto resep" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl">
                        {category === 'DRINK' ? '🥤' : '🍽️'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="cover-file"
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
                    <input id="cover-file" type="file" accept="image/*" onChange={handlePickCover} className="hidden" />
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="mt-2 block rounded-full border border-cream-300 bg-white px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-cream-50"
                      >
                        Hapus Foto
                      </button>
                    )}
                    <p className="mt-2 text-xs text-stone-400">
                      JPG, PNG, atau GIF. Maksimal 5MB. Kosongkan untuk memakai placeholder otomatis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detail waktu & porsi */}
          <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
            <SectionTitle emoji="⏱️" title="Waktu & porsi" />
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Persiapan (mnt)</label>
                <input type="number" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="10" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Memasak (mnt)</label>
                <input type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="20" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Porsi</label>
                <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="2" className={inputClass} />
              </div>
            </div>

            <p className="mt-5 mb-1.5 text-sm font-semibold text-stone-700">Tingkat kesulitan</p>
            <div className="grid grid-cols-3 gap-3">
              {difficultyOptions.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition ${
                    difficulty === d.value
                      ? 'border-spice-500 bg-spice-50 text-spice-700'
                      : 'border-cream-200 bg-cream-50 text-stone-500 hover:border-cream-300'
                  }`}
                >
                  {d.emoji} {d.label}
                </button>
              ))}
            </div>
          </section>

          {/* Bahan */}
          <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <SectionTitle emoji="🥕" title="Bahan-bahan" />
              <button
                type="button"
                onClick={addIngredient}
                className="rounded-full bg-spice-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-spice-700"
              >
                + Tambah Bahan
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-center text-sm font-bold text-stone-400">{i + 1}</span>
                  <input
                    value={ing.amount}
                    onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                    placeholder="Takaran (cth: 2 sdm)"
                    className={`${inputClass} w-2/5`}
                  />
                  <input
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                    placeholder="Nama bahan *"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                    aria-label="Hapus bahan"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Langkah */}
          <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <SectionTitle emoji="👨‍🍳" title="Langkah memasak" />
              <button
                type="button"
                onClick={addStep}
                className="rounded-full bg-spice-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-spice-700"
              >
                + Tambah Langkah
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    rows={2}
                    placeholder={`Tulis langkah ke-${i + 1}…`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                    aria-label="Hapus langkah"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Privasi */}
          <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
            <SectionTitle emoji="🔒" title="Privasi resep" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                  visibility === 'PRIVATE' ? 'border-spice-500 bg-spice-50' : 'border-cream-200 bg-cream-50 hover:border-cream-300'
                }`}
              >
                <p className="text-sm font-bold text-stone-900">🔒 Privat</p>
                <p className="mt-1 text-xs text-stone-500">Hanya kamu yang bisa melihat (buku catatan pribadi).</p>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                  visibility === 'PUBLIC' ? 'border-spice-500 bg-spice-50' : 'border-cream-200 bg-cream-50 hover:border-cream-300'
                }`}
              >
                <p className="text-sm font-bold text-stone-900">🌍 Publik</p>
                <p className="mt-1 text-xs text-stone-500">Muncul di feed komunitas & bisa dilihat semua orang.</p>
              </button>
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
              {loading ? 'Menyimpan…' : 'Simpan Resep'}
            </button>
          </div>
        </form>
      </main>
  );
}
