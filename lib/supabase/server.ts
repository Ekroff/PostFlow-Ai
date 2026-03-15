import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/** Chainable no-op query builder returned when Supabase env vars are absent in development. */
function makeNoopBuilder(): Record<string, unknown> {
  const noop: Record<string, unknown> = {};
  const chain = () => noop;
  noop.select = chain;
  noop.insert = async () => ({ data: null, error: null });
  noop.update = chain;
  noop.upsert = async () => ({ data: null, error: null });
  noop.delete = chain;
  noop.eq = chain;
  noop.in = chain;
  noop.gte = chain;
  noop.lte = chain;
  noop.order = async () => ({ data: [], error: null });
  noop.single = async () => ({ data: null, error: null });
  noop.then = (resolve: (v: { data: null; error: null }) => unknown) =>
    Promise.resolve({ data: null, error: null }).then(resolve);
  return noop;
}

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    // In development without env vars, return a no-op stub so pages render their empty states
    return { from: () => makeNoopBuilder() } as unknown as ReturnType<
      typeof createServerClient<Database>
    >;
  }

  const cookieStore = cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
