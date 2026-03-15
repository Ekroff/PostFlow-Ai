import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifyApprovalToken } from '@/lib/jwt';

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'approve' | 'reject'

  if (!token || !action) {
    return NextResponse.redirect(`${appUrl()}/app/queue?error=invalid_link`);
  }

  try {
    const postId = await verifyApprovalToken(token);

    if (action === 'reject') {
      // Redirect to the reject page where reviewer adds a comment
      return NextResponse.redirect(
        `${appUrl()}/approve/reject?token=${encodeURIComponent(token)}&post_id=${postId}`
      );
    }

    const supabase = await createSupabaseServerClient();
    await supabase.from('posts').update({ status: 'approved' }).eq('id', postId);

    return NextResponse.redirect(`${appUrl()}/approve/success?action=approved`);
  } catch {
    return NextResponse.redirect(`${appUrl()}/app/queue?error=expired_link`);
  }
}

/** POST — called by /approve/reject page with { comment } in body */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const postId = await verifyApprovalToken(token);
    const { comment } = await req.json();

    const supabase = await createSupabaseServerClient();
    await supabase.from('posts').update({ status: 'changes_requested' }).eq('id', postId);

    if (comment) {
      const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (post?.author_id) {
        await supabase.from('post_comments').insert({
          post_id: postId,
          user_id: post.author_id,
          content: `[Email Review] ${comment}`,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
