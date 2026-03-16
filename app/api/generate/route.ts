import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generatePosts } from '@/lib/openai';
import { PLAN_LIMITS } from '@/lib/stripe';
import type { SubscriptionTier } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic, format, tone, length, hookStyle, sourceContent } = body;

    if (!topic || !format || !tone || !length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Get user and check usage limits
    const { data: user } = await supabase
      .from('users')
      .select('id, workspace_id, subscription_tier')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('posts_generated')
      .eq('user_id', user.id)
      .eq('month_year', monthYear)
      .single();

    const tier = (user.subscription_tier as SubscriptionTier) || 'free';
    const limit = PLAN_LIMITS[tier].posts;
    const used = usage?.posts_generated || 0;

    if (limit !== -1 && used >= limit) {
      return NextResponse.json(
        { error: 'Monthly generation limit reached. Please upgrade your plan.' },
        { status: 429 }
      );
    }

    // Get voice profile
    const { data: voiceProfile } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Generate posts
    const result = await generatePosts({
      topic,
      format,
      tone,
      length,
      hookStyle,
      sourceContent,
      voiceProfile,
    });

    // Save posts to database
    const savedPosts = await Promise.all(
      result.variations.map(
        async (variation: {
          content: string;
          char_count: number;
          hook_type: string;
          hashtags: string[];
        }) => {
          const { data: post } = await supabase
            .from('posts')
            .insert({
              workspace_id: user.workspace_id!,
              author_id: user.id,
              content: variation.content,
              status: 'draft',
              post_format: format,
              tone,
              length_preference: length,
              hook_style: variation.hook_type,
              hashtags: variation.hashtags,
              char_count: variation.char_count,
              voice_match_score: result.voice_match_score,
              generation_topic: topic,
            })
            .select()
            .single();
          return post;
        }
      )
    );

    // Track usage
    await supabase.from('usage_tracking').upsert(
      {
        user_id: user.id,
        workspace_id: user.workspace_id!,
        month_year: monthYear,
        posts_generated: used + 1,
      },
      { onConflict: 'user_id,month_year' }
    );

    return NextResponse.json({
      posts: savedPosts,
      variations: result.variations,
      voice_match_score: result.voice_match_score,
      meta: result.meta,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Failed to generate posts' }, { status: 500 });
  }
}
