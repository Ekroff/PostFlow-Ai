import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BarChart3, FileText, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();
  const supabase = createSupabaseServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, workspace_id, email, role, subscription_tier')
    .eq('clerk_user_id', userId!)
    .single();

  const stats = { draft: 0, in_review: 0, approved: 0, published: 0 };

  if (user?.workspace_id) {
    const { data: posts } = await supabase
      .from('posts')
      .select('status')
      .eq('workspace_id', user.workspace_id);

    posts?.forEach((p) => {
      if (p.status in stats) stats[p.status as keyof typeof stats]++;
    });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s your content overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Drafts', value: stats.draft, icon: <FileText size={20} />, color: 'text-gray-500', bg: 'bg-gray-100' },
          { label: 'In Review', value: stats.in_review, icon: <Clock size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approved', value: stats.approved, icon: <CheckCircle2 size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Published', value: stats.published, icon: <BarChart3 size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`${s.bg} ${s.color} rounded-lg p-2 w-fit mb-3`}>{s.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link
            href="/app/generate"
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-colors"
          >
            <span className="text-xl">✨</span>
            <div>
              <div className="font-semibold">Generate a post</div>
              <div className="text-xs text-blue-200">AI creates 3 variations</div>
            </div>
          </Link>
          <Link
            href="/app/queue"
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <span className="text-xl">👀</span>
            <div>
              <div className="font-semibold text-gray-900">Review queue</div>
              <div className="text-xs text-gray-500">{stats.in_review} pending</div>
            </div>
          </Link>
          <Link
            href="/app/calendar"
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <span className="text-xl">📅</span>
            <div>
              <div className="font-semibold text-gray-900">Content calendar</div>
              <div className="text-xs text-gray-500">{stats.approved} ready to schedule</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
