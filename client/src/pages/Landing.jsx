import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Icon from '../components/Icon.jsx';

const sampleRecipes = [
  {
    title: 'Nasi Goreng Spesial',
    author: 'Bunda Rina',
    image: '/images/nasi-goreng-spesial.jpeg',
    time: '20 mnt',
    likes: '1.2rb',
  },
  {
    title: 'Matcha Latte Hangat',
    author: 'Kopi Senja',
    image: '/images/matcha-latte-hangat.jpeg',
    time: '10 mnt',
    likes: '980',
  },
  {
    title: 'Chicken Quesadilla',
    author: 'Chef Andi',
    image: '/images/chicken-quesadilla.jpeg',
    time: '30 mnt',
    likes: '2.4rb',
  },
];

function FeedPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-spice-200 via-ember-600/20 to-amber-200 blur-2xl" />

      <div className="relative space-y-4 overflow-hidden">
        {sampleRecipes.map((r, i) => (
          <div
            key={r.title}
            className={`overflow-hidden rounded-3xl border border-white/60 bg-white shadow-xl ${
              i === 1 ? 'rotate-2' : i === 2 ? '-rotate-1' : ''
            }`}
          >
            <div className="relative h-40">
              <img src={r.image} alt={r.title} className="h-full w-full object-cover" />
              <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                <Icon name="clock" className="h-3.5 w-3.5 inline" /> {r.time}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-bold text-stone-900">{r.title}</p>
                <p className="text-xs text-stone-500">oleh {r.author}</p>
              </div>
              <div className="flex items-center gap-3 text-stone-600">
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <Icon name="heart-filled" className="h-4 w-4 text-red-500" />
                  {r.likes}
                </span>
                <Icon name="download" className="h-4 w-4" />
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
    <div className="group rounded-3xl border border-cream-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6">
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

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 pt-10 sm:gap-12 sm:pb-20 sm:pt-14 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-spice-200 bg-spice-50 px-3 py-1.5 text-xs font-semibold text-spice-700">
              <span className="h-2 w-2 rounded-full bg-spice-500" />
              Platform resep hibrida ala Instagram
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Simpan resepmu.{' '}
              <span className="bg-gradient-to-r from-spice-600 to-ember-600 bg-clip-text text-transparent">
                Bagikan
              </span>{' '}
              hasil masakanmu.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
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
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 bg-white px-7 py-3.5 text-base font-bold text-stone-700 shadow-sm transition hover:border-spice-300 hover:bg-cream-50"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-stone-500">
              <span className="flex items-center gap-1.5">
                <Icon name="check" className="h-4 w-4 text-spice-600" /> 100% Gratis, tanpa paywall
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check" className="h-4 w-4 text-spice-600" /> Tanpa batas pencarian
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check" className="h-4 w-4 text-spice-600" /> Tanpa kartu kredit
              </span>
            </div>
          </div>

          <FeedPreview />
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-cream-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 text-center sm:grid-cols-2 md:grid-cols-4">
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
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-spice-600">Fitur Unggulan</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
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
            icon={<Icon name="lock" className="h-6 w-6" />}
          />
          <FeatureCard
            accent="bg-ember-600 shadow-ember-600/30"
            title="Komunitas Publik"
            desc="Bagikan resep & hasil masakan ke feed komunitas, berinteraksi lewat suka, simpan, dan komentar."
            icon={<Icon name="users" className="h-6 w-6" />}
          />
          <FeatureCard
            accent="bg-amber-500 shadow-amber-500/30"
            title="Foto & Cloudinary"
            desc="Pajang hasil masakanmu dengan foto cantik — penyimpanan gambar terkelola otomatis di cloud."
            icon={<Icon name="camera" className="h-6 w-6" />}
          />
          <FeatureCard
            accent="bg-lime-600 shadow-lime-600/30"
            title="Pencarian Populer Gratis"
            desc="Temukan ribuan resep lewat pencarian bebas. Semua hasil tetap tampil penuh, tanpa paywall."
            icon={<Icon name="search" className="h-6 w-6" />}
          />
          <FeatureCard
            accent="bg-yellow-500 shadow-yellow-500/30"
            title="Urutan Resep Terbaik"
            desc="Resep dengan peringkat komunitas tertinggi otomatis naik ke atas — gratis dilihat semua."
            icon={<Icon name="trophy" className="h-6 w-6" />}
          />
          <FeatureCard
            accent="bg-orange-500 shadow-orange-500/30"
            title="Masak Sekarang"
            desc="Tombol aksi satu ketukan untuk langsung mulai memasak resep favoritmu kapan saja."
            icon={<Icon name="cooking-pot" className="h-6 w-6" />}
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-cream-200 bg-cream-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-spice-600">Cara Kerja</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
              Mulai dalam 3 langkah mudah
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                n: '1',
                t: 'Buat akun gratis',
                d: 'Daftar dengan email gratis. Tanpa kartu kredit, tanpa syarat.',
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
              <div key={s.n} className="relative rounded-3xl border border-cream-200 bg-white p-5 text-center shadow-sm sm:p-7">
                <span className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-spice-600 text-sm font-bold text-white shadow">
                  {s.n}
                </span>
                 <div className="flex justify-center"><Icon name={s.icon} className="h-10 w-10 text-spice-600" /></div>
                <h3 className="mt-3 text-lg font-bold text-stone-900">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-spice-600 via-ember-600 to-red-600 px-5 py-10 text-center shadow-2xl shadow-ember-600/30 sm:rounded-[2.5rem] sm:px-6 sm:py-16">
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

