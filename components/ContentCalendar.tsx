'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from 'date-fns';
import type { Post } from '@/types/database';

interface ContentCalendarProps {
  posts: unknown[];
  userRole: string;
  currentMonth: number;
  currentYear: number;
}

export function ContentCalendar({ posts: initialPosts, currentMonth, currentYear }: ContentCalendarProps) {
  const [displayDate, setDisplayDate] = useState(new Date(currentYear, currentMonth, 1));
  const [posts] = useState<Post[]>(initialPosts as Post[]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const monthStart = startOfMonth(displayDate);
  const monthEnd = endOfMonth(displayDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart); // 0 = Sunday

  const postsOnDay = (date: Date) =>
    posts.filter((p) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), date));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-lg">
          {format(displayDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDisplayDate(subMonths(displayDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setDisplayDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setDisplayDate(addMonths(displayDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-24 border-b border-r border-gray-50" />
        ))}

        {days.map((day) => {
          const dayPosts = postsOnDay(day);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`h-24 border-b border-r border-gray-50 p-2 ${
                isToday ? 'bg-blue-50/50' : 'hover:bg-gray-50'
              } transition-colors`}
            >
              <span className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                isToday ? 'bg-blue-700 text-white' : 'text-gray-600'
              }`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 2).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPost(p)}
                    className={`w-full text-left text-xs px-1.5 py-0.5 rounded font-medium truncate transition-colors ${
                      p.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {p.content.slice(0, 20)}…
                  </button>
                ))}
                {dayPosts.length > 2 && (
                  <span className="text-xs text-gray-400">+{dayPosts.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-blue-100" /> Scheduled
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-green-100" /> Published
        </div>
      </div>

      {/* Post detail modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {selectedPost.status === 'published'
                  ? <CheckCircle2 size={16} className="text-green-600" />
                  : <Clock size={16} className="text-blue-600" />}
                <span className="text-sm font-semibold text-gray-700 capitalize">
                  {selectedPost.status}
                </span>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
            </div>
            {selectedPost.scheduled_at && (
              <p className="text-xs text-gray-400 mb-3">
                Scheduled: {format(new Date(selectedPost.scheduled_at), 'PPpp')}
              </p>
            )}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
