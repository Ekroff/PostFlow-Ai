import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { publishToLinkedIn, refreshLinkedInToken } from '@/lib/linkedin';
import { sendEmail, buildPublishFailureEmailHtml } from '@/lib/sendgrid';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: duePosts, error } = await supabase
    .from('posts')
    .select(
      '*, users!posts_author_id_fkey(id, email, full_name, linkedin_urn, linkedin_access_token, linkedin_refresh_token, linkedin_token_expires_at)'
    )
    .eq('status', 'approved')
    .lte('scheduled_at', new Date().toISOString())
    .not('scheduled_at', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!duePosts?.length) {
    return NextResponse.json({ published: 0 });
  }

  let publishedCount = 0;
  const errors: string[] = [];

  for (const post of duePosts) {
    const author = post.users as {
      id: string;
      email: string;
      full_name: string | null;
      linkedin_urn: string | null;
      linkedin_access_token: string | null;
      linkedin_refresh_token: string | null;
      linkedin_token_expires_at: string | null;
    };

    if (!author?.linkedin_access_token || !author?.linkedin_urn) {
      await supabase.from('posts').update({ status: 'publish_failed' }).eq('id', post.id);
      errors.push(`Post ${post.id}: No LinkedIn credentials`);
      continue;
    }

    let accessToken = author.linkedin_access_token;

    // Refresh token if expiring within 5 minutes
    if (author.linkedin_token_expires_at && author.linkedin_refresh_token) {
      const expiresAt = new Date(author.linkedin_token_expires_at).getTime();
      if (expiresAt - Date.now() < 5 * 60 * 1000) {
        try {
          const refreshed = await refreshLinkedInToken(author.linkedin_refresh_token);
          accessToken = refreshed.access_token;
          await supabase
            .from('users')
            .update({
              linkedin_access_token: refreshed.access_token,
              linkedin_refresh_token: refreshed.refresh_token,
              linkedin_token_expires_at: new Date(
                Date.now() + refreshed.expires_in * 1000
              ).toISOString(),
            })
            .eq('id', author.id);
        } catch {
          // Continue with existing token
        }
      }
    }

    // Retry up to 3 times
    let published = false;
    let lastError = '';

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await publishToLinkedIn(accessToken, author.linkedin_urn, post.content);

        await supabase
          .from('posts')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            linkedin_post_id: result.id,
          })
          .eq('id', post.id);

        publishedCount++;
        published = true;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error';
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
      }
    }

    if (!published) {
      await supabase
        .from('posts')
        .update({
          status: 'publish_failed',
          publish_attempts: post.publish_attempts + 1,
        })
        .eq('id', post.id);

      // Alert workspace admins
      const { data: admins } = await supabase
        .from('users')
        .select('email')
        .eq('workspace_id', post.workspace_id)
        .eq('role', 'admin');

      for (const admin of admins || []) {
        await sendEmail(
          admin.email,
          '[PostFlow AI] Post publish failed',
          buildPublishFailureEmailHtml(post.content, lastError)
        );
      }

      errors.push(`Post ${post.id}: ${lastError}`);
    }
  }

  return NextResponse.json({ published: publishedCount, errors });
}
