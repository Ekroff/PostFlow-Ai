import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const jwtSecret = process.env.JWT_SIGNING_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SIGNING_SECRET environment variable is required in production');
}
const secret = new TextEncoder().encode(jwtSecret ?? 'dev-secret');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'approve' | 'reject'

  if (!token || !action) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/queue?error=invalid_link`
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const postId = payload.post_id as string;

    if (!postId) throw new Error('No post_id in token');

    if (action === 'reject') {
      // Redirect to a reject page with a comment form
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/approve/reject?token=${token}&post_id=${postId}`
      );
    }

    const supabase = createSupabaseServerClient();
    await supabase
      .from('posts')
      .update({ status: 'approved' })
      .eq('id', postId);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/approve/success?action=approved`
    );
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/queue?error=expired_link`
    );
  }
}

/** Helper: generate a signed approval URL token */
export async function generateApprovalToken(postId: string): Promise<string> {
  return new SignJWT({ post_id: postId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);
}
