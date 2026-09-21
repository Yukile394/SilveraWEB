'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  products: { name: string };
  deliveries: { status: string }[];
}
interface OrderStatus {
  id: string;
  status: string;
  total_price: number;
  order_items: OrderItem[];
}

export default function OdemeBasariliPage() {
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function poll() {
      const res = await fetch(`/api/orders/status?orderId=${orderId}`, { cache: 'no-store' });
      const data = await res.json();
      if (cancelled) return;
      setOrder(data.order ?? null);
      setLoading(false);

      // Teslimat kuyruğu (cron) çalışırken kısa süre "delivering" görünebilir,
      // birkaç saniye arayla tekrar sorgula.
      const delivered = data.order?.order_items?.every(
        (i: OrderItem) => i.deliveries?.[0]?.status === 'delivered'
      );
      if (data.order && data.order.status === 'paid' && !delivered) {
        setTimeout(poll, 4000);
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  const productName = order?.order_items?.[0]?.products?.name;
  const deliveryStatus = order?.order_items?.[0]?.deliveries?.[0]?.status;

  return (
    <div className="auth-page">
      <a href="/" className="auth-close" aria-label="Kapat">
        ×
      </a>
      <div className="auth-card">
        <img src="/logo-mavi.png" alt="Silvera Network" className="auth-logo" />
        {loading && <p className="auth-sub">Sipariş kontrol ediliyor…</p>}

        {!loading && !order && (
          <>
            <h1 className="auth-title">Sipariş bulunamadı</h1>
            <p className="auth-sub">Sipariş numaranız geçersiz ya da size ait değil.</p>
          </>
        )}

        {!loading && order && (order.status === 'paid' || order.status === 'delivered') && (
          <>
            <h1 className="auth-title">Ödeme başarıyla tamamlandı</h1>
            <p className="auth-sub">
              Sipariş numarası: <code>#{order.id.slice(0, 8).toUpperCase()}</code>
            </p>
            {deliveryStatus === 'delivered' ? (
              <p className="vip-card-message is-success" style={{ marginTop: 16 }}>
                {productName} başarıyla teslim edildi.
              </p>
            ) : (
              <p className="auth-sub" style={{ marginTop: 16 }}>
                Ürününüz Minecraft hesabınıza teslim ediliyor…
              </p>
            )}
          </>
        )}

        {!loading && order && order.status === 'failed' && (
          <>
            <h1 className="auth-title">Ödeme tamamlanamadı</h1>
            <p className="auth-sub">Bir hata oluştu. Sipariş numaranız ile destek ekibine ulaşabilirsiniz.</p>
            <p className="auth-sub">
              <code>#{order.id.slice(0, 8).toUpperCase()}</code>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
