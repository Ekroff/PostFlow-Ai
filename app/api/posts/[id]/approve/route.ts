import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/sendgrid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const { data: user } = await supabase
    .from('users')
    .select('id, role, workspace_id, email')
    .eq('clerk_user_id', userId)
    .single();

  if (!user || !['admin', 'editor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — admin or editor role required' }, { status: 403 });
  }

  const { action, comment } = await req.json();
  // action: 'approve' | 'request_changes'

  const newStatus = action === 'approve' ? 'approved' : 'changes_requested';

  const { data: post, error } = await supabase
    .from('posts')
    .update({ status: newStatus })
    .eq('id', id)
    .select('*, author:users(email)')
    .single();

  if (error || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  // Add comment if provided
  if (comment) {
    await supabase.from('post_comments').insert({
      post_id: id,
      user_id: user.id,
      content: comment,
    });
  }

  // Notify the post author by email
  const authorEmail = (post.author as { email: string } | null)?.email;
  if (authorEmail) {
    await sendEmail({
      to: authorEmail,
      subject: `Your post has been ${action === 'approve' ? 'approved ✓' : 'returned for changes'}`,
      html: `<p>Your LinkedIn post has been <strong>${action === 'approve' ? 'approved' : 'returned for changes'}</strong>.</p>
${comment ? `<p>Reviewer comment: ${comment}</p>` : ''}
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/app/queue">View in PostFlow AI →</a></p>`,
    });
  }

  return NextResponse.json({ post });
}
