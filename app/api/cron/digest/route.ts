import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/sendgrid';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: workspaces } = await supabase.from('workspaces').select('id, name');

  for (const workspace of workspaces || []) {
    const { data: publishedPosts } = await supabase
      .from('posts')
      .select('content, published_at, char_count')
      .eq('workspace_id', workspace.id)
      .eq('status', 'published')
      .gte('published_at', oneWeekAgo);

    const { data: upcomingPosts } = await supabase
      .from('posts')
      .select('content, scheduled_at')
      .eq('workspace_id', workspace.id)
      .in('status', ['approved', 'scheduled'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5);

    const { data: admins } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('workspace_id', workspace.id)
      .eq('role', 'admin');

    for (const admin of admins || []) {
      const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>📊 Your Weekly LinkedIn Content Digest</h2>
  <p>Hi ${admin.full_name || 'there'},</p>

  <h3>Published this week: ${publishedPosts?.length || 0} posts</h3>
  ${(publishedPosts || [])
    .map(
      (p) =>
        `<p style="border-left: 3px solid #0077b5; padding-left: 12px; color: #374151;">${p.content.slice(0, 100)}...</p>`
    )
    .join('')}

  <h3>Coming up: ${upcomingPosts?.length || 0} posts scheduled</h3>
  ${(upcomingPosts || [])
    .map(
      (p) =>
        `<p style="border-left: 3px solid #16a34a; padding-left: 12px; color: #374151;">📅 ${new Date(p.scheduled_at!).toLocaleDateString()} — ${p.content.slice(0, 80)}...</p>`
    )
    .join('')}

  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard">View dashboard →</a></p>
  <p style="color: #9ca3af; font-size: 12px;">PostFlow AI Weekly Digest</p>
</body>
</html>`;

      await sendEmail(
        admin.email,
        `📊 PostFlow AI — Weekly Digest for ${workspace.name}`,
        html
      );
    }
  }

  return NextResponse.json({ success: true });
}
