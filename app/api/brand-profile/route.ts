import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ profile: null });
    }

    const { data: profile } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error('Get brand profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createSupabaseServerClient();

    const { data: user } = await supabase
      .from('users')
      .select('id, workspace_id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user?.workspace_id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let profile;
    if (existing) {
      const { data } = await supabase
        .from('brand_profiles')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();
      profile = data;
    } else {
      const { data } = await supabase
        .from('brand_profiles')
        .insert({ ...body, user_id: user.id, workspace_id: user.workspace_id })
        .select()
        .single();
      profile = data;
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Save brand profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
