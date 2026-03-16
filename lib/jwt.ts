import { jwtVerify, SignJWT } from 'jose';

function getSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SIGNING_SECRET;
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SIGNING_SECRET environment variable is required in production');
  }
  return new TextEncoder().encode(jwtSecret ?? 'dev-secret');
}

/** Generate a signed JWT token for email approval links (1 hour TTL) */
export async function generateApprovalToken(postId: string): Promise<string> {
  return new SignJWT({ post_id: postId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(getSecret());
}

/** Verify a signed approval JWT and return the post_id */
export async function verifyApprovalToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, getSecret());
  const postId = payload.post_id as string;
  if (!postId) throw new Error('No post_id in token');
  return postId;
}
