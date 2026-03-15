import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { openai, buildSystemPrompt, buildUserPrompt } from '@/lib/openai';
import { PLAN_LIMITS } from '@/lib/revenuecat';
import { NextRequest, NextResponse } from 'next/server';
import type { PostFormat, PostTone, PostLength, PostHookStyle, SubscriptionTier } from '@/types/database';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServerClient();

  // Get user with subscription info
  const { data: user } = await supabase
    .from('users')
    .select('id, workspace_id, subscription_tier')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Check usage limits
  const monthYear = new Date().toISOString().slice(0, 7);
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('user_id', user.id)
    .eq('action_type', 'generation')
    .eq('month_year', monthYear)
    .single();

  const tier = (user.subscription_tier ?? 'free') as SubscriptionTier;
  const limit = PLAN_LIMITS[tier].generationsPerMonth;
  const currentCount = usage?.count ?? 0;

  if (currentCount >= limit) {
    return NextResponse.json(
      { error: 'Monthly generation limit reached. Please upgrade your plan.' },
      { status: 429 }
    );
  }

  const { author_id, post_format, topic_text, tone, length, hook_style, source_content } =
    await req.json();

  if (!topic_text) {
    return NextResponse.json({ error: 'topic_text is required' }, { status: 400 });
  }

  // Fetch voice profile for the author
  const { data: profile } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', author_id ?? user.id)
    .single();

  // Build OpenAI prompt
  const systemPrompt = buildSystemPrompt(profile);
  const userPrompt = buildUserPrompt(
    (post_format ?? 'insight') as PostFormat,
    topic_text + (source_content ? `\n\nAdditional context:\n${source_content}` : ''),
    (tone ?? 'professional') as PostTone,
    (length ?? 'medium') as PostLength,
    hook_style as PostHookStyle | undefined
  );

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2000,
  });

  let result: Record<string, unknown>;
  try {
    result = JSON.parse(completion.choices[0].message.content!);
  } catch {
    return NextResponse.json({ error: 'AI returned malformed JSON. Please try again.' }, { status: 502 });
  }

  // Update usage tracking (upsert)
  await supabase.from('usage_tracking').upsert(
    {
      user_id: user.id,
      action_type: 'generation',
      month_year: monthYear,
      count: currentCount + 1,
    },
    { onConflict: 'user_id,action_type,month_year' }
  );

  return NextResponse.json({
    ...result,
    usage: { current: currentCount + 1, limit },
  });
}
