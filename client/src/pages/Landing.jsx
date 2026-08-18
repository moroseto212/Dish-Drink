import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Icon from '../components/Icon.jsx';

const sampleRecipes = [
  {
    title: 'Nasi Goreng Spesial',
    author: 'Bunda Rina',
    icon: 'food',
    from: 'from-orange-400',
    to: 'to-red-500',
    time: '20 mnt',
    likes: '1.2rb',
  },
  {
    title: 'Matcha Latte Hangat',
    author: 'Kopi Senja',
    icon: 'drink',
    from: 'from-amber-300',
    to: 'to-lime-600',
    time: '10 mnt',
    likes: '980',
  },
  {
    title: 'Chicken Quesadilla',
    author: 'Chef Andi',
    icon: 'food',
    from: 'from-red-400',
    to: 'to-orange-600',
    time: '30 mnt',
    likes: '2.4rb',
  },
];

function FeedPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-spice-200 via-ember-600/20 to-amber-200 blur-2xl" />

      <div className="relative space-y-4">
        {sampleRecipes.map((r, i) => (
          <div
            key={r.title}
            className={`overflow-hidden rounded-3xl border border-white/60 bg-white shadow-xl ${
              i === 1 ? 'rotate-2' : i === 2 ? '-rotate-1' : ''
            }`}
          >
            <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${r.from} ${r.to}`}>
              <Icon name={r.icon} className="h-14 w-14 text-white drop-shadow-lg" />
              <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                <><Icon name="clock" className="h-3.5 w-3.5 inline" /> {r.time}</>
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-bold text-stone-900">{r.title}</p>
                <p className="text-xs text-stone-500">oleh {r.author}</p>
              </div>
              <div className="flex items-center gap-3 text-stone-600">
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <svg viewBox="0 0 24 24" fill="#ef4444" className="h-4 w-4">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {r.likes}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V4m0 12.5l-3-3m3 3l3-3M4 20h16"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent }) {
  return (
    <div className="group rounded-3xl border border-cream-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md ${accent}`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{desc}</p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar transparent />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-spice-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-ember-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-spice-200 bg-spice-50 px-3 py-1.5 text-xs font-semibold text-spice-700">
              <span className="h-2 w-2 rounded-full bg-spice-500" />
              Platform resep hibrida ala Instagram
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Simpan resepmu.{' '}
              <span className="bg-gradient-to-r from-spice-600 to-ember-600 bg-clip-text text-transparent">
                Bagikan
              </span>{' '}
              hasil masakanmu.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
              <strong className="font-semibold text-stone-800">Dish &amp; Drink</strong> menggabungkan buku catatan
              resep pribadi yang privat dengan komunitas publik untuk berbagi inspirasi, berinteraksi, dan memamerkan
              hasil masakanmu — lengkap dengan foto.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ember-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-ember-600/30 transition hover:bg-ember-700"
              >
                Mulai Gratis Sekarang
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 bg-white px-7 py-3.5 text-base font-bold text-stone-700 shadow-sm transition hover:border-spice-300 hover:bg-cream-50"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <GoogleButton label="atau masuk dengan Google" className="max-w-xs" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-stone-500">
              <span className="flex items-center gap-1.5">
                <Check className="text-spice-600" /> 100% Gratis, tanpa paywall
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="text-spice-600" /> Tanpa batas pencarian
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="text-spice-600" /> Tanpa kartu kredit
              </span>
            </div>
          </div>

          <FeedPreview />
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-cream-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center md:grid-cols-4">
          {[
            { n: '100%', l: 'Gratis, selamanya' },
            { n: '∞', l: 'Resep bisa disimpan' },
            { n: 'Gratis', l: 'Cari resep terbaik' },
            { n: '24/7', l: 'Buku catatan resepmu' },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-3xl font-extrabold text-spice-600">{s.n}</p>
              <p className="mt-1 text-sm text-stone-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-spice-600">Fitur Unggulan</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            Semua yang kamu butuhkan untuk resep &amp; komunitas
          </h2>
          <p className="mt-4 text-stone-600">
            Dari buku catatan pribadi hingga komunitas publik — semua fitur utama bisa diakses tanpa biaya sepeser pun.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            accent="bg-spice-500 shadow-spice-500/30"
            title="Buku Resep Pribadi"
            desc="Simpan resep andalanmu sebagai catatan pribadi yang privat — hanya kamu yang bisa melihat."
            icon={<IconLock />}
          />
          <FeatureCard
            accent="bg-ember-600 shadow-ember-600/30"
            title="Komunitas Publik"
            desc="Bagikan resep & hasil masakan ke feed komunitas, berinteraksi lewat suka, simpan, dan komentar."
            icon={<IconUsers />}
          />
          <FeatureCard
            accent="bg-amber-500 shadow-amber-500/30"
            title="Foto & Cloudinary"
            desc="Pajang hasil masakanmu dengan foto cantik — penyimpanan gambar terkelola otomatis di cloud."
            icon={<IconCamera />}
          />
          <FeatureCard
            accent="bg-lime-600 shadow-lime-600/30"
            title="Pencarian Populer Gratis"
            desc="Temukan ribuan resep lewat pencarian bebas. Semua hasil tetap tampil penuh, tanpa paywall."
            icon={<IconSearch />}
          />
          <FeatureCard
            accent="bg-yellow-500 shadow-yellow-500/30"
            title="Urutan Resep Terbaik"
            desc="Resep dengan peringkat komunitas tertinggi otomatis naik ke atas — gratis dilihat semua."
            icon={<IconTrophy />}
          />
          <FeatureCard
            accent="bg-orange-500 shadow-orange-500/30"
            title="Masak Sekarang"
            desc="Tombol aksi satu ketukan untuk langsung mulai memasak resep favoritmu kapan saja."
            icon={<IconCook />}
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-cream-200 bg-cream-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-spice-600">Cara Kerja</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              Mulai dalam 3 langkah mudah
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                n: '1',
                t: 'Buat akun gratis',
                d: 'Daftar dengan email atau satu ketukan via Google. Tanpa kartu kredit, tanpa syarat.',
                icon: 'write',
              },
              {
                n: '2',
                t: 'Simpan atau bagikan resep',
                d: 'Tulis resep sebagai catatan pribadi, atau publikasikan ke komunitas beserta foto hasil masakanmu.',
                icon: 'food',
              },
              {
                n: '3',
                t: 'Jelajahi & berinteraksi',
                d: 'Cari resep populer, lihat urutan terbaik, suka, simpan, dan komentar dengan kreator lain.',
                icon: 'flame',
              },
            ].map((s) => (
              <div key={s.n} className="relative rounded-3xl border border-cream-200 bg-white p-7 text-center shadow-sm">
                <span className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-spice-600 text-sm font-bold text-white shadow">
                  {s.n}
                </span>
                 <Icon name={s.icon} className="h-10 w-10 text-spice-600" />
                <h3 className="mt-3 text-lg font-bold text-stone-900">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-spice-600 via-ember-600 to-red-600 px-6 py-16 text-center shadow-2xl shadow-ember-600/30">
          <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Siap mencoba? Gratis, mulai hari ini.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/90">
            Buka buku resep pribadimu dan bergabunglah dengan komunitas pecinta masak — semua fitur populer terbuka untuk
            semua.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-ember-700 shadow-lg transition hover:bg-cream-50"
            >
              Daftar Gratis
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-cream-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row">
          <p className="font-bold text-stone-700">
            Dish <span className="text-spice-600">&amp;</span> Drink
          </p>
          <p>© {new Date().getFullYear()} Dish &amp; Drink. Semua fitur 100% gratis.</p>
        </div>
      </footer>
    </div>
  );
}

function Check({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`h-4 w-4 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, viewBox: '0 0 24 24', className: 'h-6 w-6' };
function IconLock() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg {...iconProps}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg {...iconProps}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg {...iconProps}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M17 5h4v2a4 4 0 0 1-4 4M7 5H3v2a4 4 0 0 0 4 4" />
    </svg>
  );
}
function IconCook() {
  return (
    <svg {...iconProps}>
      <path d="M12 2v8" />
      <path d="M5 11h14v2a7 7 0 0 1-14 0z" />
      <path d="M19 11c0-2-1-3-3-3M5 11c0-2 1-3 3-3" />
    </svg>
  );
}
