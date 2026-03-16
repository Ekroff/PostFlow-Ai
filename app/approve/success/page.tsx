import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ApproveSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-10 shadow-sm text-center max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Post Approved!</h1>
        <p className="mb-6 text-gray-600">
          The post has been approved and is ready for publishing.
        </p>
        <Link
          href="/app/queue"
          className="inline-block rounded-xl bg-[#0077b5] px-6 py-3 font-semibold text-white hover:bg-[#006097]"
        >
          View Queue
        </Link>
      </div>
    </div>
  );
}
