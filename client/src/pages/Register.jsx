import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/login?registered=1');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Logo className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight text-stone-900">
            Dish <span className="text-spice-600">&amp;</span> Drink
          </span>
        </Link>

        <div className="rounded-3xl border border-cream-200 bg-white p-8 shadow-xl shadow-spice-900/5">
          <h1 className="text-2xl font-extrabold text-stone-900">Buat akun gratis</h1>
          <p className="mt-1 text-sm text-stone-500">Mulai buku resep pribadimu hari ini. Tanpa biaya apa pun.</p>

          {error && (
            <div className="mt-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-stone-700">
                Nama
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-stone-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-stone-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ember-600 py-3 text-sm font-bold text-white shadow-md shadow-ember-600/25 transition hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Membuat akun…' : 'Daftar Gratis'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-spice-600 hover:text-spice-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
