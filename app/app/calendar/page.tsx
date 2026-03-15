import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ContentCalendar } from '@/components/ContentCalendar';

export default async function CalendarPage() {
  const { userId } = await auth();
  const supabase = await createSupabaseServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, workspace_id, role')
    .eq('clerk_user_id', userId!)
    .single();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  let scheduledPosts: unknown[] = [];
  if (user?.workspace_id) {
    const { data: posts } = await supabase
      .from('posts')
      .select('*, author:users(id, email)')
      .eq('workspace_id', user.workspace_id)
      .in('status', ['approved', 'scheduled', 'published'])
      .gte('scheduled_at', startOfMonth)
      .lte('scheduled_at', endOfMonth)
      .order('scheduled_at', { ascending: true });

    scheduledPosts = posts ?? [];
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
        <p className="text-gray-500 mt-1">Schedule and visualise your upcoming LinkedIn posts.</p>
      </div>
      <ContentCalendar
        posts={scheduledPosts}
        userRole={user?.role ?? 'author'}
        currentMonth={now.getMonth()}
        currentYear={now.getFullYear()}
      />
    </div>
  );
}
