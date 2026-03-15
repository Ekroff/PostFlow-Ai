import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

  const { scheduled_at } = await req.json();

  const { data: post, error } = await supabase
    .from('posts')
    .update({ scheduled_at, status: 'scheduled' })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post });
}
