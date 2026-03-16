import Stripe from 'stripe';

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
  });
}

export const STRIPE_PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    name: 'Starter',
    price: 29,
    posts: 30,
    seats: 1,
  },
  growth: {
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || '',
    name: 'Growth',
    price: 79,
    posts: 150,
    seats: 5,
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    name: 'Pro',
    price: 149,
    posts: 500,
    seats: 15,
  },
  agency: {
    priceId: process.env.STRIPE_AGENCY_PRICE_ID || '',
    name: 'Agency',
    price: 299,
    posts: -1, // unlimited
    seats: 50,
  },
} as const;

export const PLAN_LIMITS = {
  free: { posts: 5, seats: 1, profiles: 1 },
  starter: { posts: 30, seats: 1, profiles: 1 },
  growth: { posts: 150, seats: 5, profiles: 3 },
  pro: { posts: 500, seats: 15, profiles: 10 },
  agency: { posts: -1, seats: 50, profiles: 50 },
} as const;
