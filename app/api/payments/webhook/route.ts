import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase';

// TODO: PAYMENT_PROVIDER_CONFIG
// Bu dosya PayTR / iyzico gibi bir sağlayıcının webhook formatına göre
// uyarlanmalı. Aşağıdaki yapı genel bir örnektir; gerçek sağlayıcı
// entegrasyonunda alan adları ve imza (signature) algoritması değişir.
//
// Genel akış:
//  1. Sağlayıcıdan gelen isteğin signature'ı doğrulanır (PAYMENT_WEBHOOK_SECRET ile)
//  2. provider_payment_id daha önce işlenmiş mi kontrol edilir (duplicate koruması)
//  3. Sipariş id ve tutar, veritabanındaki sipariş ile karşılaştırılır
//  4. Her şey doğruysa: payment kaydı 'success' yapılır, kredi eklenir veya
//     VIP teslimatı kuyruğa alınır

function verifySignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto
    .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');
  // timing-safe karşılaştırma
  return (
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-payment-signature');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Geçersiz imza' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    provider_payment_id: string;
    order_id: string;
    amount: number;
    status: 'success' | 'failed';
  };

  const db = createAdminClient();

  // Duplicate koruması: bu provider_payment_id daha önce işlendiyse tekrar işleme
  const { data: existingPayment } = await db
    .from('payments')
    .select('id, status')
    .eq('provider_payment_id', payload.provider_payment_id)
    .maybeSingle();

  if (existingPayment) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const { data: order } = await db
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', payload.order_id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
  }

  // Tutar kontrolü — sağlayıcıdan gelen tutar, veritabanındaki sipariş
  // tutarıyla eşleşmeli. Eşleşmezse işlenmez.
  if (Number(payload.amount) !== Number(order.total_price)) {
    await db.from('audit_logs').insert({
      actor_type: 'system', action: 'payment_amount_mismatch',
      target_type: 'order', target_id: order.id, metadata: payload,
    });
    return NextResponse.json({ error: 'Tutar uyuşmuyor' }, { status: 400 });
  }

  await db.from('payments').insert({
    order_id: order.id,
    provider: 'generic',
    provider_payment_id: payload.provider_payment_id,
    amount: payload.amount,
    status: payload.status,
    raw_webhook_payload: payload,
  });

  if (payload.status !== 'success') {
    await db.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ received: true });
  }

  await db.from('orders').update({ status: 'paid' }).eq('id', order.id);

  // Kredi paketi ise bakiyeye ekle, ürünse teslimat kuyruğuna al
  for (const item of order.order_items) {
    const product = item.products;
    if (product.category === 'kredi') {
      await db.rpc('add_credits', {
        p_user_id: order.user_id,
        p_amount: product.credit_price ?? 0,
        p_type: 'topup',
        p_reference_id: order.id,
        p_description: `${product.name} kredi yüklemesi`,
      });
    } else if (product.delivery_command) {
      await db.from('deliveries').insert({
        order_item_id: item.id,
        user_id: order.user_id,
        command: product.delivery_command,
        status: 'pending',
      }).select().maybeSingle(); // order_item_id unique -> aynı kalem iki kez eklenmez
    }
  }

  await db.from('audit_logs').insert({
    actor_type: 'system', action: 'payment_success',
    target_type: 'order', target_id: order.id, metadata: { provider_payment_id: payload.provider_payment_id },
  });

  return NextResponse.json({ received: true });
}
