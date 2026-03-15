import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { analyseVoiceProfile } from '@/lib/openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sample_posts } = await req.json();
  if (!sample_posts) {
    return NextResponse.json({ error: 'sample_posts is required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const analysis = await analyseVoiceProfile(sample_posts);

  // Upsert brand profile with AI analysis results
  const { data, error } = await supabase
    .from('brand_profiles')
    .upsert(
      {
        user_id: user.id,
        product_name: '',
        product_description: '',
        primary_audience: '',
        ...analysis,
        sample_posts_raw: sample_posts,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data, analysis });
}
