import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">Page not found / Page introuvable</p>
      <Link href="/" className="px-6 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors">
        Go Home / Retour à l&apos;accueil
      </Link>
    </div>
  );
}
