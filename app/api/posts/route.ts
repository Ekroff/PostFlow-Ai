import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { PostStatus } from '@/types/database';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, workspace_id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user?.workspace_id) return NextResponse.json({ posts: [] });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const author_id = searchParams.get('author_id');
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('posts')
    .select('*, author:users(id, email)')
    .eq('workspace_id', user.workspace_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status as PostStatus);
  if (author_id) query = query.eq('author_id', author_id);

  const { data: posts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, workspace_id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
  }

  const body = await req.json();
  const { content, format_type, topic_text, hashtags, char_count } = body;

  if (!content || !format_type) {
    return NextResponse.json({ error: 'content and format_type are required' }, { status: 400 });
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      workspace_id: user.workspace_id,
      author_id: user.id,
      content,
      format_type,
      topic_text,
      hashtags: hashtags ?? [],
      char_count: char_count ?? content.length,
      status: 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post }, { status: 201 });
}
