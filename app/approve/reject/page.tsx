'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function RejectForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/approve?token=${encodeURIComponent(token)}&action=reject_with_comment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment }),
        }
      );
      if (res.ok) {
        router.push('/approve/success?action=rejected');
      } else {
        setError('Failed to submit. The link may have expired.');
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900">Invalid link</h1>
        <p className="text-gray-500 text-sm mt-2">This approval link is missing or invalid.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">↩️</div>
        <h1 className="text-xl font-bold text-gray-900">Request changes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Please describe what needs to be revised.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Feedback for the author <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="e.g. 'The hook is too generic — can we make it more specific to our product?'"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !comment.trim()}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Submit feedback
      </button>
    </form>
  );
}

export default function RejectPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full shadow-sm">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          }
        >
          <RejectForm />
        </Suspense>
      </div>
    </div>
  );
}
