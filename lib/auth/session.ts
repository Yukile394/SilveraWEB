import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function createSessionToken(userId: string, role: 'user' | 'admin') {
  return await new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as { sub: string; role: 'user' | 'admin' };
  } catch {
    return null;
  }
}
