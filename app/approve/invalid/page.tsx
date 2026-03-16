import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function ApproveInvalidPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-10 shadow-sm text-center max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Invalid or Expired Link</h1>
        <p className="mb-6 text-gray-600">
          This approval link is invalid or has expired. Approval links expire after 1 hour.
        </p>
        <Link
          href="/sign-in"
          className="inline-block rounded-xl bg-[#0077b5] px-6 py-3 font-semibold text-white hover:bg-[#006097]"
        >
          Sign in to manage posts
        </Link>
      </div>
    </div>
  );
}
