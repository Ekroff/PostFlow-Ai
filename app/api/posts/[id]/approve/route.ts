import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, comment } = body; // action: 'approve' | 'request_changes'

    const supabase = await createSupabaseServerClient();

    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_user_id', userId)
      .single();

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'changes_requested';

    const { data: post, error } = await supabase
      .from('posts')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (comment) {
      await supabase.from('post_comments').insert({
        post_id: id,
        user_id: user.id,
        content: comment,
      });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
