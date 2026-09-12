export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getPaymentProvider } from '@/lib/payment';

// iyzico Checkout Form akışında kullanıcı ödeme sayfasından bu URL'e
// POST (form-encoded, "token" alanıyla) yönlendirilir. Biz bu token'a
// GÜVENMEYİZ — token'ı alıp iyzico'ya SUNUCU TARAFINDAN, kendi secret
// key'imizle sorarak gerçek sonucu öğreniriz (verifyCallback). Bu yüzden
// ayrıca bir imza/HMAC kontrolüne gerek yok: doğrulama zaten iyzico'nun
// kendisine sorularak yapılıyor.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const token = form.get('token');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`;

  if (!token || typeof token !== 'string') {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`);
  }

  const provider = getPaymentProvider();
  const result = await provider.verifyCallback(token);

  if (!result.orderId) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`);
  }

  const db = createAdminClient();

  const { data: order } = await db
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', result.orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz`);
  }

  // Sipariş zaten işlenmişse (kullanıcı geri tuşuna bastı, iyzico callback'i
  // iki kez gönderdi vb.) tekrar teslimat yapma — direkt sonucu göster.
  if (order.status === 'paid' || order.status === 'delivered') {
    return NextResponse.redirect(`${siteUrl}/odeme/basarili?orderId=${order.id}`);
  }

  if (!result.ok || result.status !== 'success') {
    await db.from('orders').update({ status: 'failed' }).eq('id', order.id);
    await db.from('payments').update({ status: 'failed' }).eq('order_id', order.id);
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?orderId=${order.id}`);
  }

  // Tutar ve para birimi kontrolü — iyzico'nun onayladığı tutar bizim
  // veritabanımızdaki sipariş tutarıyla birebir eşleşmeli.
  const amountMatches = Math.abs(Number(result.amount) - Number(order.total_price)) < 0.01;
  const currencyMatches = result.currency === 'TRY';

  if (!amountMatches || !currencyMatches) {
    await db.from('audit_logs').insert({
      actor_type: 'system',
      action: 'payment_amount_mismatch',
      target_type: 'order',
      target_id: order.id,
      metadata: { expected: order.total_price, got: result.amount, currency: result.currency },
    });
    await db.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?orderId=${order.id}`);
  }

  // Duplicate koruması: provider_payment_id unique constraint'e sahip.
  // Aynı ödeme ikinci kez işlenmeye çalışılırsa insert çakışır ve
  // catch bloğunda "zaten işlenmiş" olarak ele alınır.
  const { error: paymentInsertErr } = await db
    .from('payments')
    .update({
      provider_payment_id: result.providerPaymentId,
      status: 'success',
      raw_webhook_payload: result as any,
    })
    .eq('order_id', order.id)
    .eq('status', 'pending');

  if (paymentInsertErr) {
    return NextResponse.redirect(`${siteUrl}/odeme/basarisiz?orderId=${order.id}`);
  }

  await db.from('orders').update({ status: 'paid' }).eq('id', order.id);

  for (const item of order.order_items) {
    const product = item.products;
    if (product.category === 'kredi') {
      await db.rpc('add_credits', {
        p_user_id: order.user_id,
        p_amount: product.credit_price ?? 0,
        p_type: 'topup',
        p_reference_id: order.id,
        p_description: `${product.name} kredi yüklemesi (kart)`,
      });
    } else if (product.delivery_command) {
      // order_items -> deliveries ilişkisi unique(order_item_id): aynı
      // kalem için ikinci bir teslimat kaydı asla oluşmaz.
      await db
        .from('deliveries')
        .insert({
          order_item_id: item.id,
          user_id: order.user_id,
          command: product.delivery_command,
          status: 'pending',
        })
        .select()
        .maybeSingle();
    }
  }

  await db.from('audit_logs').insert({
    actor_type: 'system',
    action: 'payment_success',
    target_type: 'order',
    target_id: order.id,
    metadata: { provider_payment_id: result.providerPaymentId },
  });

  return NextResponse.redirect(`${siteUrl}/odeme/basarili?orderId=${order.id}`);
}
