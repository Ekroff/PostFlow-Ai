import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => {
  const secret = process.env.JWT_SIGNING_SECRET;
  if (!secret) throw new Error('JWT_SIGNING_SECRET is not set');
  return new TextEncoder().encode(secret);
};

export async function signApprovalToken(postId: string): Promise<string> {
  return new SignJWT({ postId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyApprovalToken(token: string): Promise<{ postId: string }> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { postId: string };
}
