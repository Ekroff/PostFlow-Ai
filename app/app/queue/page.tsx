'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Send, Calendar } from 'lucide-react';
import type { Post } from '@/types/database';

const STATUS_COLUMNS = [
  { key: 'draft', label: 'Draft', icon: Clock, color: 'bg-gray-100 text-gray-600' },
  { key: 'in_review', label: 'In Review', icon: Send, color: 'bg-yellow-100 text-yellow-700' },
  { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { key: 'changes_requested', label: 'Changes Needed', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  { key: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'bg-blue-100 text-blue-700' },
] as const;

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .finally(() => setLoading(false));
  }, []);

  const postsByStatus = (status: string) => posts.filter((p) => p.status === status);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0077b5] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
        <p className="mt-1 text-gray-600">Manage your posts through the approval workflow.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {STATUS_COLUMNS.map(({ key, label, icon: Icon, color }) => {
          const columnPosts = postsByStatus(key);
          return (
            <div key={key} className="min-h-48">
              <div className="mb-3 flex items-center gap-2">
                <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
                  <span className="flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                </div>
                <span className="text-xs text-gray-400">({columnPosts.length})</span>
              </div>

              <div className="space-y-3">
                {columnPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <p className="line-clamp-3 text-sm text-gray-700">{post.content}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      {post.scheduled_at && (
                        <span className="text-xs text-[#0077b5]">
                          📅 {new Date(post.scheduled_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {post.char_count && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Characters</span>
                          <span>{post.char_count}/3000</span>
                        </div>
                        <div className="h-1 rounded-full bg-gray-100">
                          <div
                            className="h-1 rounded-full bg-[#0077b5]"
                            style={{ width: `${Math.min(100, (post.char_count / 3000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {columnPosts.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-gray-100 p-6 text-center">
                    <p className="text-xs text-gray-400">No posts</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
