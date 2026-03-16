/**
 * RevenueCat Integration (Payments)
 *
 * Payment implementation is deferred — RevenueCat will be configured
 * once the app is deployed and billing is ready to activate.
 *
 * RevenueCat handles:
 * - Subscription management
 * - Plan gating (Starter / Growth / Pro / Agency)
 * - Cross-platform entitlements
 *
 * See: https://www.revenuecat.com/docs
 */

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro' | 'agency';

export interface PlanLimits {
  generationsPerMonth: number;
  linkedInProfiles: number;
  seats: number;
  voiceProfiles: number;
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free: {
    generationsPerMonth: 5,
    linkedInProfiles: 1,
    seats: 1,
    voiceProfiles: 1,
  },
  starter: {
    generationsPerMonth: 30,
    linkedInProfiles: 1,
    seats: 1,
    voiceProfiles: 1,
  },
  growth: {
    generationsPerMonth: 150,
    linkedInProfiles: 3,
    seats: 5,
    voiceProfiles: 5,
  },
  pro: {
    generationsPerMonth: 500,
    linkedInProfiles: 10,
    seats: 15,
    voiceProfiles: 15,
  },
  agency: {
    generationsPerMonth: 99999,
    linkedInProfiles: 99999,
    seats: 50,
    voiceProfiles: 99999,
  },
};

export const PLAN_PRICES: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 29,
  growth: 79,
  pro: 149,
  agency: 299,
};

/**
 * TODO: Implement RevenueCat entitlement check.
 * For now, subscription tier is stored directly on the users table in Supabase
 * and updated via RevenueCat webhooks once integrated.
 */
export async function checkEntitlement(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tier: SubscriptionTier
): Promise<boolean> {
  // RevenueCat integration pending — always returns true in dev
  return true;
}
