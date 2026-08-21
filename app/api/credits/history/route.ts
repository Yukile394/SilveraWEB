import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('silvera_session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

  const db = createAdminClient();
  const { data, error } = await db
    .from('credit_transactions')
    .select('*')
    .eq('user_id', session.sub)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: 'Geçmiş alınamadı' }, { status: 500 });
  return NextResponse.json({ transactions: data });
}
