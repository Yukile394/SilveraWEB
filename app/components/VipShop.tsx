'use client';

import { useEffect, useState } from 'react';
import { getTierDisplay } from '@/lib/vipTiers';

interface Product {
  id: string;
  name: string;
  description: string | null;
  benefits: string[];
  price: number;
  credit_price: number | null;
  category: string;
}

type BuyState = 'idle' | 'loading' | 'success' | 'error';

export default function VipShop() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [buyState, setBuyState] = useState<Record<string, BuyState>>({});
  const [message, setMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/products?category=vip', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  async function handleBuyWithBalance(product: Product) {
    setBuyState((s) => ({ ...s, [product.id]: 'loading' }));
    setMessage((s) => ({ ...s, [product.id]: '' }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, payment_method: 'credit_balance' }),
      });

      if (res.status === 401) {
        window.location.href = '/giris';
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setBuyState((s) => ({ ...s, [product.id]: 'error' }));
        setMessage((s) => ({ ...s, [product.id]: data.error || 'Bir hata oluştu.' }));
        return;
      }

      setBuyState((s) => ({ ...s, [product.id]: 'success' }));
      setMessage((s) => ({
        ...s,
        [product.id]: `${product.name} başarıyla teslim edildi. Sipariş: #${data.order_id.slice(0, 8).toUpperCase()}`,
      }));
    } catch {
      setBuyState((s) => ({ ...s, [product.id]: 'error' }));
      setMessage((s) => ({ ...s, [product.id]: 'Bağlantı hatası, tekrar dene.' }));
    }
  }

  async function handleBuyWithCard(product: Product) {
    setBuyState((s) => ({ ...s, [product.id]: 'loading' }));
    setMessage((s) => ({ ...s, [product.id]: '' }));

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id }),
      });

      if (res.status === 401) {
        window.location.href = '/giris';
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.paymentPageUrl) {
        setBuyState((s) => ({ ...s, [product.id]: 'error' }));
        setMessage((s) => ({ ...s, [product.id]: data.error || 'Ödeme başlatılamadı.' }));
        return;
      }

      // Kart bilgileri hiç bizim sitemize girilmiyor — iyzico'nun kendi
      // güvenli ödeme sayfasına yönlendiriyoruz.
      window.location.href = data.paymentPageUrl;
    } catch {
      setBuyState((s) => ({ ...s, [product.id]: 'error' }));
      setMessage((s) => ({ ...s, [product.id]: 'Bağlantı hatası, tekrar dene.' }));
    }
  }

  if (products === null) {
    return <div className="vip-loading">Rütbeler yükleniyor…</div>;
  }

  const sorted = [...products].sort(
    (a, b) => getTierDisplay(a.name).rank - getTierDisplay(b.name).rank
  );

  return (
    <div className="vip-grid">
      {sorted.map((p) => {
        const tier = getTierDisplay(p.name);
        const state = buyState[p.id] ?? 'idle';
        return (
          <div className="vip-card" key={p.id} style={{ ['--tier-accent' as string]: tier.accent }}>
            <div className="vip-card-top">
              <span className="vip-card-tag">{tier.tag}</span>
              <h3 className="vip-card-name">{p.name}</h3>
              {p.description && <p className="vip-card-desc">{p.description}</p>}
            </div>

            <ul className="vip-card-benefits">
              {p.benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <div className="vip-card-bottom">
              <div className="vip-card-price">
                <span className="vip-card-price-main">{p.price} TL</span>
                {p.credit_price && <span className="vip-card-price-alt">veya {p.credit_price} kredi</span>}
              </div>
              <div className="vip-buy-row">
                <button
                  type="button"
                  className="btn vip-buy-btn"
                  disabled={state === 'loading'}
                  onClick={() => handleBuyWithCard(p)}
                >
                  {state === 'loading' ? 'Yönlendiriliyor…' : 'Kart ile Satın Al'}
                </button>
                {p.credit_price && (
                  <button
                    type="button"
                    className="btn btn-ghost vip-buy-btn-alt"
                    disabled={state === 'loading'}
                    onClick={() => handleBuyWithBalance(p)}
                  >
                    Bakiyeyle Öde
                  </button>
                )}
              </div>
            </div>

            {message[p.id] && (
              <p className={`vip-card-message ${state === 'error' ? 'is-error' : 'is-success'}`}>
                {message[p.id]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
