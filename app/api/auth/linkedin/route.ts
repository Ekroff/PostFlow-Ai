import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
    scope: 'openid profile email w_member_social',
    state: userId, // use clerk userId as state for CSRF
  });

  return NextResponse.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  );
}
