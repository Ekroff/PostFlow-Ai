'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-10 shadow-sm text-center max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mb-6 text-gray-600 text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="rounded-xl bg-[#0077b5] px-6 py-3 font-semibold text-white hover:bg-[#006097]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
