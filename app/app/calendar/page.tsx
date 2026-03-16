'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Post } from '@/types/database';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-200 text-gray-700',
  in_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-emerald-100 text-emerald-800',
  publish_failed: 'bg-red-100 text-red-800',
};

export default function CalendarPage() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [posts, setPosts] = useState<Post[]>([]);

  const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    fetch(`/api/posts?month=${monthKey}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []));
  }, [monthKey]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const postsByDay: Record<number, Post[]> = {};
  posts.forEach((post) => {
    const dateStr = post.scheduled_at || post.published_at;
    if (dateStr) {
      const day = new Date(dateStr).getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="mt-1 text-gray-600">View and manage your scheduled content.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-lg font-semibold text-gray-900">
            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold uppercase text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 border-b border-r border-gray-100 bg-gray-50" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = postsByDay[day] || [];
            const isToday =
              day === today.getDate() &&
              viewDate.getMonth() === today.getMonth() &&
              viewDate.getFullYear() === today.getFullYear();

            return (
              <div
                key={day}
                className={`min-h-24 border-b border-r border-gray-100 p-2 ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? 'bg-[#0077b5] text-white' : 'text-gray-600'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className={`rounded px-1.5 py-0.5 text-xs truncate ${STATUS_COLORS[post.status] || 'bg-gray-100'}`}
                    >
                      {post.content.slice(0, 30)}...
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-xs text-gray-400">+{dayPosts.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${color}`} />
            <span className="text-xs text-gray-500 capitalize">{status.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
