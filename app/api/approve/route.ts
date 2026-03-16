import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifyApprovalToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const action = request.nextUrl.searchParams.get('action');

  if (!token || !action) {
    return NextResponse.redirect(new URL('/approve/invalid', request.url));
  }

  try {
    const { postId } = await verifyApprovalToken(token);
    const supabase = await createSupabaseServerClient();

    if (action === 'approve') {
      await supabase.from('posts').update({ status: 'approved' }).eq('id', postId);
      return NextResponse.redirect(new URL('/approve/success', request.url));
    } else {
      return NextResponse.redirect(
        new URL(`/approve/reject?postId=${postId}&token=${token}`, request.url)
      );
    }
  } catch {
    return NextResponse.redirect(new URL('/approve/invalid', request.url));
  }
}

export async function POST(request: NextRequest) {
  const { token, comment } = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  try {
    const { postId } = await verifyApprovalToken(token);
    const supabase = await createSupabaseServerClient();

    await supabase
      .from('posts')
      .update({ status: 'changes_requested' })
      .eq('id', postId);

    if (comment) {
      const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase.from('post_comments').insert({
          post_id: postId,
          user_id: post.author_id,
          content: `[Email Review] ${comment}`,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
