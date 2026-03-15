import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServerClient();
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, author:users(id, email), post_versions(*), post_comments(*, user:users(id, email))')
    .eq('id', params.id)
    .single();

  if (error || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServerClient();
  const body = await req.json();
  const { content, status, hashtags, topic_text } = body;

  // Fetch existing post to create version record
  const { data: existing } = await supabase
    .from('posts')
    .select('content, post_versions(version_num)')
    .eq('id', params.id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  // Save version if content changed
  if (content && content !== existing.content) {
    const versionNums = (existing.post_versions as unknown as Array<{ version_num: number }>) ?? [];
    const nextVersion = versionNums.length > 0
      ? Math.max(...versionNums.map((v) => v.version_num)) + 1
      : 1;

    await supabase.from('post_versions').insert({
      post_id: params.id,
      content: existing.content,
      edited_by: user?.id,
      version_num: nextVersion,
    });
  }

  const updatePayload: Record<string, unknown> = {};
  if (content !== undefined) updatePayload.content = content;
  if (status !== undefined) updatePayload.status = status;
  if (hashtags !== undefined) updatePayload.hashtags = hashtags;
  if (topic_text !== undefined) updatePayload.topic_text = topic_text;
  if (content !== undefined) updatePayload.char_count = content.length;

  const { data: post, error } = await supabase
    .from('posts')
    .update(updatePayload)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServerClient();

  // Only admins can delete
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_user_id', userId)
    .single();

  if (!user || !['admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase.from('posts').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
