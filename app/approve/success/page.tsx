export default function ApproveSuccessPage({
  searchParams,
}: {
  searchParams: { action?: string };
}) {
  const { action } = searchParams;
  const approved = action === 'approved';
  const rejected = action === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md shadow-sm">
        <div className="text-5xl mb-4">{approved ? '✅' : rejected ? '↩️' : '✅'}</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {approved
            ? 'Post approved!'
            : rejected
            ? 'Changes requested'
            : 'Action completed'}
        </h1>
        <p className="text-gray-500 text-sm">
          {approved
            ? 'The post has been approved and will publish at its scheduled time.'
            : rejected
            ? 'The author has been notified and will revise the post.'
            : 'Your action has been recorded.'}
        </p>
        <a
          href="/app/queue"
          className="inline-block mt-6 text-sm text-blue-700 font-semibold hover:underline"
        >
          View queue in PostFlow AI →
        </a>
      </div>
    </div>
  );
}
