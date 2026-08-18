import GoogleIcon from './GoogleIcon.jsx';

export default function GoogleButton({ label = 'Lanjutkan dengan Google', className = '' }) {
  return (
    <a
      href="/api/auth/google"
      className={`inline-flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-cream-50 hover:shadow ${className}`}
    >
      <GoogleIcon />
      {label}
    </a>
  );
}
