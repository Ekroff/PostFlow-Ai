import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail, buildApprovalEmailHtml } from '@/lib/sendgrid';
import { generateApprovalToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, record, old_record } = body;

  // Only process INSERT/UPDATE events where status became 'in_review'
  if (
    !(type === 'UPDATE' || type === 'INSERT') ||
    record?.status !== 'in_review' ||
    old_record?.status === 'in_review'
  ) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseServerClient();

  // Get post author and workspace admins/editors who should review
  const { data: post } = await supabase
    .from('posts')
    .select('*, author:users(email)')
    .eq('id', record.id)
    .single();

  if (!post) return NextResponse.json({ ok: true });

  const { data: reviewers } = await supabase
    .from('users')
    .select('email')
    .eq('workspace_id', post.workspace_id)
    .in('role', ['admin', 'editor']);

  if (!reviewers?.length) return NextResponse.json({ ok: true });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const approveToken = await generateApprovalToken(post.id);
  const approveUrl = `${appUrl}/api/approve?token=${approveToken}&action=approve`;
  const rejectUrl = `${appUrl}/api/approve?token=${approveToken}&action=reject`;
  const authorEmail = (post.author as { email: string } | null)?.email ?? 'Your colleague';

  for (const reviewer of reviewers) {
    await sendEmail({
      to: reviewer.email,
      subject: '📝 LinkedIn post awaiting your approval — PostFlow AI',
      html: buildApprovalEmailHtml({
        postContent: post.content,
        authorName: authorEmail,
        approveUrl,
        rejectUrl,
        appUrl,
      }),
    });
  }

  return NextResponse.json({ ok: true, notified: reviewers.length });
}
