const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export async function publishToLinkedIn(
  content: string,
  accessToken: string,
  authorUrn: string
): Promise<LinkedInPublishResult> {
  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, postId: data.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function refreshLinkedInToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    });

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getLinkedInProfile(accessToken: string): Promise<{
  id: string;
  name: string;
  picture?: string;
} | null> {
  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/me?projection=(id,localizedFirstName,localizedLastName,profilePicture)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return {
      id: data.id,
      name: `${data.localizedFirstName} ${data.localizedLastName}`,
      picture: data.profilePicture?.displayImage,
    };
  } catch {
    return null;
  }
}
