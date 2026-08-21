import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { createSessionToken } from '@/lib/auth/session';

const schema = z.object({
  minecraft_nick: z.string().min(3).max(16),
  password: z.string().min(8),
});

// Basit rate limit: aynı nick için son 1 dakikada 5'ten fazla deneme engellenir.
const attempts = new Map<string, number[]>();
function rateLimited(key: string) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter((t) => now - t < 60_000);
  list.push(now);
  attempts.set(key, list);
  return list.length > 5;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz bilgiler' }, { status: 400 });
  }

  const { minecraft_nick, password } = parsed.data;

  if (rateLimited(minecraft_nick.toLowerCase())) {
    return NextResponse.json({ error: 'Çok fazla deneme, biraz sonra tekrar dene' }, { status: 429 });
  }

  const db = createAdminClient();
  const { data: user } = await db
    .from('users')
    .select('id, password_hash, role, account_status')
    .eq('minecraft_nick', minecraft_nick)
    .maybeSingle();

  // Zamanlama saldırılarını zorlaştırmak için hash yoksa bile karşılaştırma yap
  const validHash = user?.password_hash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid';
  const ok = await bcrypt.compare(password, validHash);

  if (!user || !ok) {
    return NextResponse.json({ error: 'Nick veya şifre hatalı' }, { status: 401 });
  }

  if (user.account_status !== 'active') {
    return NextResponse.json({ error: 'Hesabın askıya alınmış' }, { status: 403 });
  }

  await db.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);

  const token = await createSessionToken(user.id, user.role);
  const res = NextResponse.json({ success: true });
  res.cookies.set('silvera_session', token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
