import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { post_id, feedback } = await req.json();
  // feedback: 'approved' | 'rejected'

  const supabase = createSupabaseServerClient();
  const { data: post } = await supabase
    .from('posts')
    .select('performance_data')
    .eq('id', post_id)
    .single();

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const updated = {
    ...(post.performance_data as Record<string, unknown>),
    voice_feedback: feedback,
    feedback_at: new Date().toISOString(),
  };

  await supabase.from('posts').update({ performance_data: updated }).eq('id', post_id);

  return NextResponse.json({ ok: true });
}
