import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PLAN_LIMITS } from '@/lib/revenuecat';
import { NextResponse } from 'next/server';
import type { SubscriptionTier } from '@/types/database';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, subscription_tier')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const monthYear = new Date().toISOString().slice(0, 7);
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('action_type, count')
    .eq('user_id', user.id)
    .eq('month_year', monthYear);

  const tier = (user.subscription_tier ?? 'free') as SubscriptionTier;
  const limits = PLAN_LIMITS[tier];
  const generationsUsed = usage?.find((u) => u.action_type === 'generation')?.count ?? 0;

  return NextResponse.json({
    tier,
    limits,
    usage: { generations: generationsUsed },
    month_year: monthYear,
  });
}
