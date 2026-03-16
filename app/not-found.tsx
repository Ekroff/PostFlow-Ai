import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-extrabold text-blue-700 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
