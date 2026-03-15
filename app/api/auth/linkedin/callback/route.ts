import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getLinkedInProfile } from '@/lib/linkedin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // clerk userId
  const error = searchParams.get('error');

  if (error || !code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?linkedin=error`
    );
  }

  // Exchange code for tokens
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });

  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?linkedin=error`
    );
  }

  const tokens = await tokenRes.json();
  const profile = await getLinkedInProfile(tokens.access_token);

  const supabase = createSupabaseServerClient();
  await supabase
    .from('users')
    .update({
      linkedin_oauth_token: tokens.access_token,
      linkedin_refresh_token: tokens.refresh_token ?? null,
      linkedin_urn: profile ? `urn:li:person:${profile.id}` : null,
    })
    .eq('clerk_user_id', state);

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?linkedin=connected`
  );
}
