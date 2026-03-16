import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const month = searchParams.get('month');

    const supabase = await createSupabaseServerClient();

    const { data: user } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user?.workspace_id) {
      return NextResponse.json({ posts: [] });
    }

    let query = supabase
      .from('posts')
      .select('*, users!posts_author_id_fkey(full_name, avatar_url, email)')
      .eq('workspace_id', user.workspace_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (month) {
      const [year, monthIndex] = month.split('-').map(Number);
      const startDate = `${month}-01`;
      const lastDay = new Date(year, monthIndex, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
      query = query.gte('scheduled_at', startDate).lte('scheduled_at', endDate);
    }

    const { data: posts, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
