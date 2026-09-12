import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('silvera_session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'orderId gerekli' }, { status: 400 });

  const db = createAdminClient();
  const { data: order } = await db
    .from('orders')
    .select('id, status, total_price, user_id, order_items(*, products(name), deliveries(status))')
    .eq('id', orderId)
    .maybeSingle();

  // Kullanıcı sadece kendi siparişini görebilir.
  if (!order || order.user_id !== session.sub) {
    return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({ order });
}
