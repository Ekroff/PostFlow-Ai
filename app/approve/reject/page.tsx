'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { XCircle, Loader2 } from 'lucide-react';

function RejectForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, comment }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <XCircle className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Changes Requested</h1>
        <p className="text-gray-600">Your feedback has been sent to the author.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
        <XCircle className="h-8 w-8 text-orange-600" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 text-center">Request Changes</h1>
      <p className="mb-6 text-center text-gray-600">
        Add a note to explain what needs to be changed.
      </p>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="Describe what changes are needed..."
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : 'Send Feedback'}
      </button>
    </div>
  );
}

export default function RejectPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>}>
          <RejectForm />
        </Suspense>
      </div>
    </div>
  );
}
