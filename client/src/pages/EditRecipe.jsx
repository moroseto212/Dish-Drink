import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { recipeApi, uploadApi } from '../api.js';
import { UNIT_GROUPS, parseLegacyIngredient } from '../constants.js';
import Icon from '../components/Icon.jsx';

const difficultyOptions = [
  { value: 'EASY', label: 'Mudah', icon: 'seedling' },
  { value: 'MEDIUM', label: 'Sedang', icon: 'food' },
  { value: 'HARD', label: 'Sulit', icon: 'flame' },
];

function SectionTitle({ iconName, title }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-spice-100 text-lg"><Icon name={iconName} className="h-5 w-5 text-spice-600" /></span>
      {title}
    </h2>
  );
}

const inputClass =
  'w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200';

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const [category, setCategory] = useState('FOOD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [ingredients, setIngredients] = useState([{ amount: '', unit: '', name: '' }]);
  const [steps, setSteps] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    recipeApi
      .get(id)
      .then((data) => {
        const r = data.recipe;
        if (user && r.authorId !== user.id) {
          setIsOwner(false);
          return;
        }
        setIsOwner(true);
        setCategory(r.category || 'FOOD');
        setTitle(r.title || '');
        setDescription(r.description || '');
        setExistingCoverUrl(r.coverUrl || '');
        setCoverPreview(r.coverUrl || '');
        setPrepTime(r.prepTime ? String(r.prepTime) : '');
        setCookTime(r.cookTime ? String(r.cookTime) : '');
        setServings(r.servings ? String(r.servings) : '');
        setDifficulty(r.difficulty || 'MEDIUM');
        setVisibility(r.visibility || 'PRIVATE');
        if (r.ingredients?.length) {
          setIngredients(
            r.ingredients.map((ing) => parseLegacyIngredient(ing))
          );
        }
        if (r.steps?.length) setSteps(r.steps);
      })
      .catch((err) => {
        if (err.message?.includes('404') || err.message?.includes('tidak ditemukan')) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setInitialLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const updateIngredient = (i, field, value) =>
    setIngredients((prev) => prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)));
  const addIngredient = () => setIngredients((prev) => [...prev, { amount: '', unit: '', name: '' }]);
  const removeIngredient = (i) => setIngredients((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  const updateStep = (i, value) => setSteps((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  const addStep = () => setSteps((prev) => [...prev, '']);
  const removeStep = (i) => setSteps((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const handlePickCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran foto maksimal 5MB.'); return; }
    setError('');
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview('');
    setExistingCoverUrl('');
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanIngredients = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => ({
        amount: ing.amount.trim(),
        unit: ing.unit || '',
        name: ing.name.trim(),
      }));
    const cleanSteps = steps.filter((s) => s.trim());

    if (!title.trim()) return fail('Judul resep wajib diisi');
    if (cleanIngredients.length === 0) return fail('Minimal satu bahan wajib diisi');
    if (cleanSteps.length === 0) return fail('Minimal satu langkah wajib diisi');

    try {
      let coverUrl = existingCoverUrl || null;
      if (coverFile) {
        const uploadData = await uploadApi.cover(coverFile);
        coverUrl = uploadData.url;
      } else if (!coverPreview) {
        coverUrl = null;
      }

      await recipeApi.update(id, {
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
      setIsDirty(false);
      setToast('Perubahan berhasil disimpan!');
      setTimeout(() => navigate(`/recipes/${id}`), 800);
    } catch (err) {
      fail(err.message);
    }

    function fail(msg) { setError(msg); setLoading(false); }
  };

  if (initialLoading) {
    return <main className="mx-auto max-w-3xl"><p className="py-16 text-center text-sm font-semibold text-stone-500">Memuat resep…</p></main>;
  }

  if (isOwner === false) {
    return (
      <main className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <Icon name="lock" className="mx-auto h-10 w-10 text-red-400" />
          <h2 className="mt-3 text-lg font-extrabold text-stone-900">Anda tidak memiliki akses</h2>
          <p className="mt-1 text-sm text-stone-500">Hanya pemilik resep yang bisa mengubahnya.</p>
          <button onClick={() => navigate(-1)} className="mt-4 rounded-full bg-spice-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-spice-700">Kembali</button>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-cream-200 bg-white p-8 text-center">
          <Icon name="food" className="mx-auto h-10 w-10 text-stone-300" />
          <h2 className="mt-3 text-lg font-extrabold text-stone-900">Resep tidak ditemukan</h2>
          <p className="mt-1 text-sm text-stone-500">Resep yang kamu cari mungkin sudah dihapus.</p>
          <button onClick={() => navigate('/feed')} className="mt-4 rounded-full bg-spice-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-spice-700">Kembali ke Feed</button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Edit Resep</h1>
      <p className="mt-1 text-sm text-stone-500">Perbarui informasi resepmu.</p>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</div>
      )}

      {toast && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">{toast}</div>
      )}

      <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="mt-8 space-y-8">
        <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
          <SectionTitle iconName="food" title="Jenis resep" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setCategory('FOOD')} className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-base font-bold transition ${category === 'FOOD' ? 'border-spice-500 bg-spice-50 text-spice-700' : 'border-cream-200 bg-cream-50 text-stone-500 hover:border-cream-300'}`}>
              <Icon name="food" className="h-5 w-5 inline" /> Makanan
            </button>
            <button type="button" onClick={() => setCategory('DRINK')} className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-base font-bold transition ${category === 'DRINK' ? 'border-spice-500 bg-spice-50 text-spice-700' : 'border-cream-200 bg-cream-50 text-stone-500 hover:border-cream-300'}`}>
              <Icon name="drink" className="h-5 w-5 inline" /> Minuman
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
          <SectionTitle iconName="write" title="Informasi dasar" />
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-700">Judul resep *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="cth: Nasi Goreng Spesial" className={inputClass} />
              <p className="mt-1 text-right text-xs text-stone-400">{title.length}/100</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-700">Deskripsi</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} placeholder="Cerita singkat tentang resep ini…" className={inputClass} />
              <p className="mt-1 text-right text-xs text-stone-400">{description.length}/1000</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-700">Foto resep</label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 sm:w-56">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Pratinjau" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      {category === 'DRINK' ? <Icon name="drink" className="h-12 w-12" /> : <Icon name="food" className="h-12 w-12" />}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="cover-file" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-spice-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-spice-700">
                    <Icon name="camera" className="h-4 w-4" />
                    Ganti Foto
                  </label>
                  <input id="cover-file" type="file" accept="image/*" onChange={handlePickCover} className="hidden" />
                  {coverPreview && (
                    <button type="button" onClick={handleRemoveCover} className="mt-2 block rounded-full border border-cream-300 bg-white px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-cream-50">
                      Hapus Foto
                    </button>
                  )}
                  <p className="mt-2 text-xs text-stone-400">JPG, PNG, atau GIF. Maksimal 5MB.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
          <SectionTitle iconName="timer" title="Waktu & porsi" />
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
              <button key={d.value} type="button" onClick={() => setDifficulty(d.value)} className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition ${difficulty === d.value ? 'border-spice-500 bg-spice-50 text-spice-700' : 'border-cream-200 bg-cream-50 text-stone-500 hover:border-cream-300'}`}>
                <Icon name={d.icon} className="h-4 w-4 inline" /> {d.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <SectionTitle iconName="ingredients" title="Bahan-bahan" />
            <button type="button" onClick={addIngredient} className="rounded-full bg-spice-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-spice-700">+ Tambah Bahan</button>
          </div>
          <p className="mb-3 text-xs text-stone-500">Setiap bahan harus memiliki jumlah, satuan, dan nama.</p>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-spice-100 text-xs font-bold text-spice-600">{i + 1}</span>
                  <input type="number" min="0" step="any" value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', e.target.value)} placeholder="Jml" className="w-16 shrink-0 rounded-lg border border-cream-300 bg-white px-2.5 py-2 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200" />
                  <select value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} className="w-36 shrink-0 rounded-lg border border-cream-300 bg-white px-2.5 py-2 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200">
                    <option value="">Satuan</option>
                    {UNIT_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.units.map((u) => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeIngredient(i)} className="ml-auto shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-50" aria-label="Hapus bahan">
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
                <input value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} placeholder="Nama bahan *" className="mt-2 w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <SectionTitle iconName="steps" title="Langkah memasak" />
            <button type="button" onClick={addStep} className="rounded-full bg-spice-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-spice-700">+ Tambah Langkah</button>
          </div>
          <div className="mt-4 space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember-600 text-xs font-bold text-white">{i + 1}</span>
                <textarea value={step} onChange={(e) => updateStep(i, e.target.value)} rows={2} placeholder={`Tulis langkah ke-${i + 1}…`} className={inputClass} />
                <button type="button" onClick={() => removeStep(i)} className="shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-50" aria-label="Hapus langkah">
                  <Icon name="x" className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
          <SectionTitle iconName="lock" title="Privasi resep" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setVisibility('PRIVATE')} className={`rounded-2xl border-2 px-4 py-4 text-left transition ${visibility === 'PRIVATE' ? 'border-spice-500 bg-spice-50' : 'border-cream-200 bg-cream-50 hover:border-cream-300'}`}>
              <p className="text-sm font-bold text-stone-900"><Icon name="lock" className="h-4 w-4 inline" /> Privat</p>
              <p className="mt-1 text-xs text-stone-500">Hanya kamu yang bisa melihat.</p>
            </button>
            <button type="button" onClick={() => setVisibility('PUBLIC')} className={`rounded-2xl border-2 px-4 py-4 text-left transition ${visibility === 'PUBLIC' ? 'border-spice-500 bg-spice-50' : 'border-cream-200 bg-cream-50 hover:border-cream-300'}`}>
              <p className="text-sm font-bold text-stone-900"><Icon name="globe" className="h-4 w-4 inline" /> Publik</p>
              <p className="mt-1 text-xs text-stone-500">Muncul di feed komunitas.</p>
            </button>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate(-1)} className="rounded-full border border-cream-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:bg-cream-50">Batal</button>
          <button type="submit" disabled={loading} className="rounded-full bg-ember-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-ember-600/25 transition hover:bg-ember-700 disabled:opacity-60">
            {loading ? 'Menyimpan…' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </main>
  );
}
