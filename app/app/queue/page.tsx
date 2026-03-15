import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { KanbanBoard } from '@/components/KanbanBoard';

export default async function QueuePage() {
  const { userId } = await auth();
  const supabase = await createSupabaseServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, workspace_id, role')
    .eq('clerk_user_id', userId!)
    .single();

  const initialPosts = { draft: [], in_review: [], changes_requested: [], approved: [] } as Record<string, unknown[]>;

  if (user?.workspace_id) {
    const { data: posts } = await supabase
      .from('posts')
      .select('*, author:users(id, email)')
      .eq('workspace_id', user.workspace_id)
      .in('status', ['draft', 'in_review', 'changes_requested', 'approved'])
      .order('created_at', { ascending: false });

    for (const post of posts ?? []) {
      const status = post.status as string;
      if (status in initialPosts) {
        (initialPosts[status] as unknown[]).push(post);
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
        <p className="text-gray-500 mt-1">Manage drafts through the approval workflow.</p>
      </div>
      <KanbanBoard initialPosts={initialPosts} userRole={user?.role ?? 'author'} />
    </div>
  );
}
