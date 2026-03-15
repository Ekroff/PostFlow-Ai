export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.SENDGRID_FROM_EMAIL || 'notifications@postflow.ai' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function buildApprovalEmailHtml({
  postContent,
  authorName,
  approveUrl,
  rejectUrl,
  appUrl,
}: {
  postContent: string;
  authorName: string;
  approveUrl: string;
  rejectUrl: string;
  appUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post Awaiting Your Approval</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #0a66c2; padding: 24px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 600;">PostFlow AI</h1>
      <p style="color: #cce3f5; margin: 4px 0 0; font-size: 14px;">LinkedIn Post Approval Request</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #333; font-size: 16px; margin-top: 0;">
        <strong>${authorName}</strong> has submitted a LinkedIn post for your review.
      </p>
      <div style="background: #f8f9fa; border-left: 4px solid #0a66c2; border-radius: 0 8px 8px 0; padding: 20px; margin: 24px 0; white-space: pre-wrap; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
${postContent}
      </div>
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <a href="${approveUrl}" style="display: inline-block; background: #0a66c2; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          ✓ Approve Post
        </a>
        <a href="${rejectUrl}" style="display: inline-block; background: #fff; color: #e53e3e; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; border: 2px solid #e53e3e;">
          ✗ Request Changes
        </a>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        These links expire in 1 hour. 
        <a href="${appUrl}/app/queue" style="color: #0a66c2;">View in PostFlow AI →</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
