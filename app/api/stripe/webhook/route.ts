import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SubscriptionTier } from '@/types/database';

const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_STARTER_PRICE_ID || 'starter']: 'starter',
  [process.env.STRIPE_GROWTH_PRICE_ID || 'growth']: 'growth',
  [process.env.STRIPE_PRO_PRICE_ID || 'pro']: 'pro',
  [process.env.STRIPE_AGENCY_PRICE_ID || 'agency']: 'agency',
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.created'
  ) {
    const subscription = event.data.object as {
      customer: string;
      items: { data: { price: { id: string } }[] };
      id: string;
    };
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = PRICE_TO_TIER[priceId] || 'free';

    await supabase
      .from('workspaces')
      .update({
        subscription_tier: tier,
        stripe_subscription_id: subscription.id,
      })
      .eq('stripe_customer_id', subscription.customer);
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as { customer: string };
    await supabase
      .from('workspaces')
      .update({ subscription_tier: 'free' })
      .eq('stripe_customer_id', subscription.customer);
  }

  return NextResponse.json({ received: true });
}
