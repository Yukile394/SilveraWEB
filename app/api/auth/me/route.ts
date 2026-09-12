import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth/session';

// Oturum bilgisini ve güncel bakiyeyi döner. Navbar / hesap kutusu bunu kullanır.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('silvera_session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ user: null });

  const db = createAdminClient();
  const { data: user } = await db
    .from('users')
    .select('id, minecraft_nick, credit_balance, role, account_status')
    .eq('id', session.sub)
    .maybeSingle();

  if (!user || user.account_status !== 'active') {
    const res = NextResponse.json({ user: null });
    res.cookies.set('silvera_session', '', { path: '/', maxAge: 0 });
    return res;
  }

  return NextResponse.json({ user });
}
