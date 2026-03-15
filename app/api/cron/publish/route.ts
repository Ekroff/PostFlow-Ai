import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { publishToLinkedIn, refreshLinkedInToken } from '@/lib/linkedin';
import type { LinkedInPublishResult } from '@/lib/linkedin';
import { sendEmail } from '@/lib/sendgrid';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:users(id, linkedin_oauth_token, linkedin_refresh_token, linkedin_urn, email, workspace_id)')
    .eq('status', 'approved')
    .lte('scheduled_at', now);

  let published = 0;
  let failed = 0;

  for (const post of posts ?? []) {
    const author = post.author as {
      id: string;
      linkedin_oauth_token: string | null;
      linkedin_refresh_token: string | null;
      linkedin_urn: string | null;
      email: string;
      workspace_id: string;
    } | null;

    if (!author?.linkedin_oauth_token || !author?.linkedin_urn) {
      await supabase.from('posts').update({ status: 'publish_failed' }).eq('id', post.id);
      failed++;
      continue;
    }

    let token = author.linkedin_oauth_token;

    // Attempt to refresh token before publishing
    if (author.linkedin_refresh_token) {
      const refreshed = await refreshLinkedInToken(author.linkedin_refresh_token);
      if (refreshed) {
        token = refreshed.access_token;
        await supabase
          .from('users')
          .update({
            linkedin_oauth_token: refreshed.access_token,
            linkedin_refresh_token: refreshed.refresh_token,
          })
          .eq('id', author.id);
      }
    }

    // Retry up to 3 times with exponential backoff
    let result: LinkedInPublishResult = { success: false };
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      result = await publishToLinkedIn(post.content, token, author.linkedin_urn);
      if (result.success) break;
    }

    if (result.success) {
      await supabase.from('posts').update({
        status: 'published',
        linkedin_post_id: result.postId ?? null,
        published_at: now,
      }).eq('id', post.id);
      published++;
    } else {
      await supabase.from('posts').update({ status: 'publish_failed' }).eq('id', post.id);
      failed++;

      // Alert workspace admin
      const { data: admins } = await supabase
        .from('users')
        .select('email')
        .eq('workspace_id', author.workspace_id)
        .eq('role', 'admin');

      for (const admin of admins ?? []) {
        await sendEmail({
          to: admin.email,
          subject: '⚠️ LinkedIn post publish failed — PostFlow AI',
          html: `<p>A post failed to publish to LinkedIn after 3 attempts.</p>
<p><strong>Post ID:</strong> ${post.id}</p>
<p><strong>Error:</strong> ${result.error ?? 'Unknown error'}</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/app/queue">View in PostFlow AI →</a></p>`,
        });
      }
    }
  }

  return NextResponse.json({ processed: (posts?.length ?? 0), published, failed });
}
