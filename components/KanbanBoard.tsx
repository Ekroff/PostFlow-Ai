'use client';

import { useState } from 'react';
import { MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Post } from '@/types/database';

interface KanbanBoardProps {
  initialPosts: Record<string, unknown[]>;
  userRole: string;
}

const COLUMNS = [
  { key: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  { key: 'in_review', label: 'In Review', color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
  { key: 'changes_requested', label: 'Changes Requested', color: 'bg-red-50 text-red-700', dot: 'bg-red-400' },
  { key: 'approved', label: 'Approved', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
];

export function KanbanBoard({ initialPosts, userRole }: KanbanBoardProps) {
  const [posts, setPosts] = useState<Record<string, Post[]>>(
    initialPosts as Record<string, Post[]>
  );
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const canApprove = ['admin', 'editor'].includes(userRole);

  async function handleApprove(post: Post, action: 'approve' | 'request_changes') {
    setActionLoading(true);
    try {
      await fetch(`/api/posts/${post.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment: comment || undefined }),
      });

      const newStatus = action === 'approve' ? 'approved' : 'changes_requested';
      setPosts((prev) => {
        const updated = { ...prev };
        const oldCol = post.status as string;
        updated[oldCol] = (updated[oldCol] ?? []).filter((p) => p.id !== post.id);
        updated[newStatus] = [...(updated[newStatus] ?? []), { ...post, status: newStatus } as Post];
        return updated;
      });
      setActivePost(null);
      setComment('');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendForReview(post: Post) {
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_review' }),
    });
    setPosts((prev) => {
      const updated = { ...prev };
      updated['draft'] = (updated['draft'] ?? []).filter((p) => p.id !== post.id);
      updated['in_review'] = [...(updated['in_review'] ?? []), { ...post, status: 'in_review' } as Post];
      return updated;
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="flex flex-col min-h-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 ${col.color}`}>
              <span className={`w-2 h-2 rounded-full ${col.dot}`} />
              <span className="text-sm font-semibold">{col.label}</span>
              <span className="ml-auto text-xs opacity-70">{(posts[col.key] ?? []).length}</span>
            </div>

            <div className="flex-1 space-y-3">
              {(posts[col.key] ?? []).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  canApprove={canApprove}
                  onSelect={() => setActivePost(activePost?.id === post.id ? null : post)}
                  isSelected={activePost?.id === post.id}
                  onSendForReview={() => handleSendForReview(post)}
                />
              ))}
              {(posts[col.key] ?? []).length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                  No posts
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Post detail panel */}
      {activePost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setActivePost(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{activePost.format_type}</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activePost.author && typeof activePost.author === 'object' && 'email' in activePost.author
                    ? String((activePost.author as { email: string }).email)
                    : ''} · {new Date(activePost.created_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setActivePost(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{activePost.content}</p>
            </div>

            {canApprove && activePost.status === 'in_review' && (
              <div className="space-y-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment (optional)..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(activePost, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprove(activePost, 'request_changes')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    <XCircle size={14} />
                    Request changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PostCard({
  post,
  onSelect,
  isSelected,
  onSendForReview,
}: {
  post: Post;
  canApprove: boolean;
  onSelect: () => void;
  isSelected: boolean;
  onSendForReview: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
        isSelected ? 'border-blue-600 shadow-md' : 'border-gray-100 hover:border-gray-200'
      }`}
      onClick={onSelect}
    >
      <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed">{post.content}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">
          {post.char_count ?? 0} chars
        </span>
        <div className="flex items-center gap-2">
          {post.hashtags?.length > 0 && (
            <span className="text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {post.hashtags.length} tags
            </span>
          )}
          <MessageSquare size={12} className="text-gray-300" />
        </div>
      </div>
      {post.status === 'draft' && (
        <button
          onClick={(e) => { e.stopPropagation(); onSendForReview(); }}
          className="mt-3 w-full text-xs bg-gray-900 text-white py-1.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Send for review
        </button>
      )}
    </div>
  );
}


