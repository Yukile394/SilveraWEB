import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth/session';
import { getPaymentProvider } from '@/lib/payment';

const schema = z.object({
  product_id: z.string().uuid(),
});

// ÖNEMLİ: Fiyat HER ZAMAN veritabanından okunur, frontend'den asla kabul
// edilmez. Kullanıcı price=1 gönderse bile bu route onu görmez bile.
export async function POST(req: NextRequest) {
  const token = req.cookies.get('silvera_session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });

  const db = createAdminClient();

  const { data: user } = await db
    .from('users')
    .select('id, minecraft_nick, account_status')
    .eq('id', session.sub)
    .maybeSingle();

  if (!user || user.account_status !== 'active') {
    return NextResponse.json({ error: 'Hesap aktif değil' }, { status: 403 });
  }

  const { data: product } = await db
    .from('products')
    .select('*')
    .eq('id', parsed.data.product_id)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });

  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'awaiting_payment',
      total_price: product.price,
      total_credits: product.credit_price,
      payment_method: 'card',
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Sipariş oluşturulamadı' }, { status: 500 });
  }

  const { error: itemErr } = await db.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    unit_price: product.price,
    unit_credit_price: product.credit_price,
  });

  if (itemErr) {
    await db.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ error: 'Sipariş kalemi oluşturulamadı' }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`;
  const provider = getPaymentProvider();

  const checkout = await provider.createCheckout({
    orderId: order.id,
    price: Number(product.price),
    currency: 'TRY',
    buyerNick: user.minecraft_nick,
    callbackUrl: `${siteUrl}/api/payment/callback`,
  });

  if (!checkout.ok || !checkout.paymentPageUrl) {
    await db.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ error: checkout.error || 'Ödeme başlatılamadı' }, { status: 502 });
  }

  await db.from('payments').insert({
    order_id: order.id,
    provider: provider.name,
    amount: product.price,
    status: 'pending',
  });

  await db.from('audit_logs').insert({
    actor_type: 'user',
    actor_id: user.id,
    action: 'payment_create',
    target_type: 'order',
    target_id: order.id,
  });

  return NextResponse.json({ order_id: order.id, paymentPageUrl: checkout.paymentPageUrl });
}
