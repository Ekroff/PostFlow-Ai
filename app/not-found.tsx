import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-[#0077b5]">404</p>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-gray-600">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#0077b5] px-6 py-3 font-semibold text-white hover:bg-[#006097]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
