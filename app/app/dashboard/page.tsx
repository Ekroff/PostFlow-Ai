import Link from 'next/link';
import { Sparkles, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back! Here&apos;s your content overview.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Posts this month', value: '—', icon: Sparkles, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending review', value: '—', icon: Clock, color: 'text-orange-600 bg-orange-50' },
          { label: 'Published', value: '—', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Failed', value: '—', icon: XCircle, color: 'text-red-600 bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/app/generate"
              className="flex items-center justify-between rounded-lg bg-[#0077b5] px-4 py-3 text-white hover:bg-[#006097]"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Generate new posts</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app/queue"
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Review queue</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app/settings"
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Set up voice profile</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Getting Started</h2>
          <div className="space-y-4">
            {[
              { step: 1, label: 'Set up your brand voice profile', done: false, href: '/app/settings' },
              { step: 2, label: 'Connect your LinkedIn account', done: false, href: '/app/settings' },
              { step: 3, label: 'Generate your first post', done: false, href: '/app/generate' },
              { step: 4, label: 'Schedule or publish', done: false, href: '/app/queue' },
            ].map((item) => (
              <Link key={item.step} href={item.href} className="flex items-center gap-3 group">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-[#0077b5]'}`}>
                  {item.done ? '✓' : item.step}
                </div>
                <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-[#0077b5]'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
