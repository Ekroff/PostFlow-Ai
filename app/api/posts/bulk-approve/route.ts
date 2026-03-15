import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('clerk_user_id', userId)
    .single();

  if (!user || !['admin', 'editor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { post_ids } = await req.json();
  if (!Array.isArray(post_ids) || post_ids.length === 0) {
    return NextResponse.json({ error: 'post_ids array is required' }, { status: 400 });
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .update({ status: 'approved' })
    .in('id', post_ids)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts, updated: posts?.length ?? 0 });
}
