import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifyApprovalToken } from '@/lib/jwt';

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
    const postId = await verifyApprovalToken(token);

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
