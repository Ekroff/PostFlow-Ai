import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/sendgrid';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all workspaces
  const { data: workspaces } = await supabase.from('workspaces').select('id, name');

  for (const workspace of workspaces ?? []) {
    const { data: stats } = await supabase
      .from('posts')
      .select('status')
      .eq('workspace_id', workspace.id)
      .gte('created_at', oneWeekAgo);

    const published = stats?.filter((p) => p.status === 'published').length ?? 0;
    const pending = stats?.filter((p) => ['draft', 'in_review'].includes(p.status)).length ?? 0;

    // Get admins for this workspace
    const { data: admins } = await supabase
      .from('users')
      .select('email')
      .eq('workspace_id', workspace.id)
      .eq('role', 'admin');

    for (const admin of admins ?? []) {
      await sendEmail({
        to: admin.email,
        subject: `📊 Your weekly PostFlow AI digest — ${workspace.name}`,
        html: `
<h2>Weekly Content Digest</h2>
<p>Here's a summary for <strong>${workspace.name}</strong> over the past 7 days:</p>
<ul>
  <li>✅ <strong>${published}</strong> posts published</li>
  <li>🕐 <strong>${pending}</strong> posts pending review</li>
</ul>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard">View Dashboard →</a></p>`,
      });
    }
  }

  return NextResponse.json({ ok: true, workspaces: workspaces?.length ?? 0 });
}
