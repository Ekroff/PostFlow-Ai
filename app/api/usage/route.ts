import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PLAN_LIMITS } from '@/lib/stripe';
import type { SubscriptionTier } from '@/types/database';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    const monthYear = new Date().toISOString().slice(0, 7);

    const { data: user } = await supabase
      .from('users')
      .select('id, subscription_tier')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('posts_generated')
      .eq('user_id', user.id)
      .eq('month_year', monthYear)
      .single();

    const tier = (user.subscription_tier as SubscriptionTier) || 'free';
    const limits = PLAN_LIMITS[tier];

    return NextResponse.json({
      postsGenerated: usage?.posts_generated || 0,
      postsLimit: limits.posts,
      tier,
    });
  } catch (error) {
    console.error('Usage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
