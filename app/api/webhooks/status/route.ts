import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signApprovalToken } from '@/lib/jwt';
import { sendEmail, buildApprovalEmailHtml } from '@/lib/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { record, old_record } = body;

    // Only trigger when status changes to 'in_review'
    if (record?.status !== 'in_review' || old_record?.status === 'in_review') {
      return NextResponse.json({ success: true });
    }

    const supabase = await createSupabaseServerClient();

    // Get author info
    const { data: author } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', record.author_id)
      .single();

    // Get workspace admins/editors to notify
    const { data: reviewers } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('workspace_id', record.workspace_id)
      .in('role', ['admin', 'editor']);

    if (!reviewers?.length) {
      return NextResponse.json({ success: true });
    }

    const token = await signApprovalToken(record.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (const reviewer of reviewers) {
      const approveUrl = `${appUrl}/api/approve?token=${token}&action=approve`;
      const rejectUrl = `${appUrl}/api/approve?token=${token}&action=reject`;

      const html = buildApprovalEmailHtml({
        postContent: record.content,
        approveUrl,
        rejectUrl,
        authorName: author?.full_name || author?.email || 'A team member',
      });

      await sendEmail(reviewer.email, `[PostFlow AI] Post ready for approval`, html);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
