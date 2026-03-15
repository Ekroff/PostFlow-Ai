import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PLAN_LIMITS, PLAN_PRICES } from '@/lib/revenuecat';
import { NextResponse } from 'next/server';
import type { SubscriptionTier } from '@/types/database';

/**
 * GET /api/payments — Returns current plan info and available plans.
 *
 * RevenueCat integration is deferred. Subscription tier is stored on the
 * users table and will be synced via RevenueCat webhooks once configured.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('clerk_user_id', userId)
    .single();

  const tier = ((user?.subscription_tier) ?? 'free') as SubscriptionTier;

  return NextResponse.json({
    current_tier: tier,
    current_limits: PLAN_LIMITS[tier],
    current_price: PLAN_PRICES[tier],
    plans: Object.entries(PLAN_LIMITS).map(([planTier, limits]) => ({
      tier: planTier,
      price: PLAN_PRICES[planTier as SubscriptionTier],
      limits,
    })),
    // RevenueCat integration pending
    payment_provider: 'revenuecat',
    checkout_url: null,
  });
}
