import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code) {
    // Initiate OAuth flow
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      state: userId,
      scope: 'openid profile email w_member_social r_liteprofile',
    });
    return NextResponse.redirect(
      `https://www.linkedin.com/oauth/v2/authorization?${params}`
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get LinkedIn profile info
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const profile = profileResponse.ok ? await profileResponse.json() : null;

    const supabase = await createSupabaseServerClient();
    await supabase
      .from('users')
      .update({
        linkedin_urn: profile?.sub || state,
        linkedin_access_token: tokens.access_token,
        linkedin_refresh_token: tokens.refresh_token,
        linkedin_token_expires_at: new Date(
          Date.now() + tokens.expires_in * 1000
        ).toISOString(),
      })
      .eq('clerk_user_id', userId);

    return NextResponse.redirect(
      new URL('/app/settings?linkedin=connected', request.url)
    );
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(
      new URL('/app/settings?linkedin=error', request.url)
    );
  }
}
