import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth/session';

const schema = z.object({
  product_id: z.string().uuid(),
  payment_method: z.enum(['card', 'credit_balance']),
});

// ÖNEMLİ: Fiyat ve kredi tutarı ASLA frontend'den alınmaz.
// Ürün id'sine göre backend veritabanından okunur.
export async function POST(req: NextRequest) {
  const token = req.cookies.get('silvera_session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });

  const { product_id, payment_method } = parsed.data;
  const db = createAdminClient();

  const { data: product } = await db
    .from('products')
    .select('*')
    .eq('id', product_id)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });

  if (payment_method === 'credit_balance' && !product.credit_price) {
    return NextResponse.json({ error: 'Bu ürün kredi ile satın alınamaz' }, { status: 400 });
  }

  // Sipariş oluştur
  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      user_id: session.sub,
      status: payment_method === 'credit_balance' ? 'processing' : 'awaiting_payment',
      total_price: product.price,
      total_credits: product.credit_price,
      payment_method,
    })
    .select()
    .single();

  if (orderErr || !order) return NextResponse.json({ error: 'Sipariş oluşturulamadı' }, { status: 500 });

  const { data: item, error: itemErr } = await db
    .from('order_items')
    .insert({
      order_id: order.id,
      product_id: product.id,
      unit_price: product.price,
      unit_credit_price: product.credit_price,
    })
    .select()
    .single();

  if (itemErr || !item) return NextResponse.json({ error: 'Sipariş kalemi oluşturulamadı' }, { status: 500 });

  // Kredi ile ödeme: bakiyeden düş (atomic fonksiyon), teslimatı tetikle
  if (payment_method === 'credit_balance') {
    const { error: spendErr } = await db.rpc('spend_credits', {
      p_user_id: session.sub,
      p_amount: product.credit_price,
      p_reference_id: order.id,
      p_description: `${product.name} satın alımı`,
    });

    if (spendErr) {
      await db.from('orders').update({ status: 'failed' }).eq('id', order.id);
      const msg = spendErr.message?.includes('YETERSIZ_BAKIYE') ? 'Yetersiz bakiye' : 'Ödeme başarısız';
      return NextResponse.json({ error: msg }, { status: 402 });
    }

    await db.from('orders').update({ status: 'paid' }).eq('id', order.id);

    if (product.delivery_command) {
      await db.from('deliveries').insert({
        order_item_id: item.id,
        user_id: session.sub,
        command: product.delivery_command,
        status: 'pending',
      });
      // Teslimat kuyruğu ayrı bir worker/route tarafından işlenir (bkz. /api/minecraft/deliver)
    }

    await db.from('audit_logs').insert({
      actor_type: 'user', actor_id: session.sub, action: 'credit_purchase',
      target_type: 'order', target_id: order.id,
    });

    return NextResponse.json({ order_id: order.id, status: 'paid' });
  }

  // Kart ile ödeme: ödeme sağlayıcısına yönlendirme burada başlar (bkz. /api/payments)
  return NextResponse.json({ order_id: order.id, status: 'awaiting_payment' });
}
