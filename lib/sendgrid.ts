export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@postflowai.com' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }
}

export function buildApprovalEmailHtml(params: {
  postContent: string;
  approveUrl: string;
  rejectUrl: string;
  authorName: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post Ready for Approval</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; margin-bottom: 24px;">
      <div style="background: #0077b5; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 18px;">
        PostFlow AI
      </div>
    </div>

    <h2 style="color: #111827; margin: 0 0 8px;">Post ready for your approval</h2>
    <p style="color: #6b7280; margin: 0 0 24px;">
      <strong>${params.authorName}</strong> has submitted a LinkedIn post for review.
    </p>

    <div style="background: #f3f4f6; border-left: 4px solid #0077b5; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <p style="color: #374151; line-height: 1.6; white-space: pre-wrap; margin: 0; font-size: 15px;">${params.postContent}</p>
    </div>

    <div style="display: flex; gap: 12px;">
      <a href="${params.approveUrl}"
         style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        ✓ Approve Post
      </a>
      <a href="${params.rejectUrl}"
         style="background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        ✗ Request Changes
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
      This approval link expires in 1 hour. Powered by PostFlow AI.
    </p>
  </div>
</body>
</html>
`.trim();
}

export function buildPublishFailureEmailHtml(postContent: string, error: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #dc2626;">⚠️ LinkedIn publish failed</h2>
  <p>A scheduled post failed to publish after 3 attempts.</p>
  <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <strong>Error:</strong> ${error}
  </div>
  <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
    <strong>Post content:</strong>
    <p style="white-space: pre-wrap;">${postContent}</p>
  </div>
  <p>Please review and reschedule the post in <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/queue">PostFlow AI</a>.</p>
</body>
</html>
`.trim();
}
