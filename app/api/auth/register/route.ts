import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { createSessionToken } from '@/lib/auth/session';

const schema = z.object({
  minecraft_nick: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
});

// NOT: Bu, nick + şifre tabanlı basit bir doğrulama akışıdır.
// Gerçek Minecraft hesabı sahipliğini doğrulamak istersen (önerilir),
// Mojang'ın oturum sunucusu veya sunucu eklentisi (örn. bir /verify
// komutuyla kod üretip siteye girme akışı) ile entegre edilmeli.
// TODO: MINECRAFT_API_CONFIG — sunucu tarafı doğrulama bağlantısı.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz bilgiler' }, { status: 400 });
  }

  const { minecraft_nick, password } = parsed.data;
  const db = createAdminClient();

  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('minecraft_nick', minecraft_nick)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Bu nick zaten kayıtlı' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data: user, error } = await db
    .from('users')
    .insert({ minecraft_nick, password_hash })
    .select('id, role')
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }

  const token = await createSessionToken(user.id, user.role);
  const res = NextResponse.json({ success: true });
  res.cookies.set('silvera_session', token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
