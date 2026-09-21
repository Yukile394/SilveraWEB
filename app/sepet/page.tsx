'use client';

import { useEffect, useState } from 'react';
import { readCart, writeCart, type CartItem } from '@/lib/cart';

type Method = 'card' | 'credit_balance';

export default function SepetPage() {
  const [ready, setReady] = useState(false);
  const [item, setItem] = useState<CartItem | null>(null);
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [method, setMethod] = useState<Method>('card');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const cart = readCart();
    if (!cart) {
      setReady(true);
      return;
    }
    setItem(cart);

    // Güncel fiyat / varlık kontrolü sunucudan yapılır.
    fetch('/api/products?category=vip', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const found = (data.products ?? []).find(
          (p: { id: string }) => p.id === cart.product_id
        );
        if (!found) {
          writeCart(null);
          setItem(null);
          return;
        }
        const fresh: CartItem = {
          product_id: found.id,
          name: found.name,
          price: Number(found.price),
          credit_price: found.credit_price ?? null,
          category: 'Özel Üyelikler',
        };
        writeCart(fresh);
        setItem(fresh);
      })
      .catch(() => {
        // Ağ hatasında sepetteki kayıtlı bilgi gösterilmeye devam eder.
      })
      .finally(() => setReady(true));
  }, []);

  function removeItem() {
    writeCart(null);
    setItem(null);
    setError('');
    setSuccess('');
  }

  function applyCoupon() {
    setCouponMsg(coupon.trim() ? 'Kupon sistemi şu an aktif değil.' : 'Lütfen bir kupon kodu gir.');
  }

  async function handleCheckout() {
    if (!item || !accepted || busy) return;
    setBusy(true);
    setError('');

    try {
      if (method === 'card') {
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: item.product_id }),
        });
        if (res.status === 401) {
          window.location.href = '/giris';
          return;
        }
        const data = await res.json();
        if (!res.ok || !data.paymentPageUrl) {
          setError(data.error || 'Ödeme başlatılamadı.');
          return;
        }
        // Kart bilgileri sitemize girilmez, iyzico'nun güvenli sayfasına yönlendirilir.
        window.location.href = data.paymentPageUrl;
        return;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: item.product_id, payment_method: 'credit_balance' }),
      });
      if (res.status === 401) {
        window.location.href = '/giris';
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu.');
        return;
      }
      const name = item.name;
      writeCart(null);
      setItem(null);
      setSuccess(`${name} başarıyla teslim edildi. Sipariş: #${String(data.order_id).slice(0, 8).toUpperCase()}`);
    } catch {
      setError('Bağlantı hatası, tekrar dene.');
    } finally {
      setBusy(false);
    }
  }

  const total = item ? item.price : 0;

  return (
    <div className="page">
      <h1 className="page-h1">Alışveriş Sepeti</h1>

      {success && <div className="notice notice-ok">{success}</div>}

      {!ready ? (
        <div className="vip-loading">Sepet yükleniyor…</div>
      ) : !item ? (
        !success && (
          <div className="cart-empty">
            <p>Sepetin boş.</p>
            <a href="/magaza" className="btn btn-primary">
              Mağazaya Git
            </a>
          </div>
        )
      ) : (
        <>
          <div className="cart-head">
            <span>ÜRÜN</span>
            <span>MİKTAR</span>
            <span>TOPLAM</span>
            <span />
          </div>
          <div className="cart-row">
            <div className="cart-prod">
              <strong>{item.name}</strong>
              <span>{item.category}</span>
            </div>
            <div className="cart-qty">1</div>
            <div className="cart-price">{item.price} ₺</div>
            <button type="button" className="cart-remove" onClick={removeItem} aria-label="Sepetten kaldır">
              ✕
            </button>
          </div>

          <h2 className="page-h2" style={{ marginTop: 56 }}>
            Kupon
          </h2>
          <div className="cart-box cart-coupon">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Kupon kodunu gir"
              aria-label="Kupon kodu"
            />
            <button type="button" className="btn cart-apply" onClick={applyCoupon}>
              Uygula
            </button>
          </div>
          {couponMsg && <div className="notice notice-err">{couponMsg}</div>}

          <div className="cart-box cart-summary">
            <h3>Sipariş özeti</h3>
            <div className="cart-sum-row">
              <span>Toplam</span>
              <strong>{total} ₺</strong>
            </div>

            <label className="cart-label" htmlFor="pay-method">
              Ödeme yöntemi:
            </label>
            <div className="cart-select-wrap">
              <select
                id="pay-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as Method)}
              >
                <option value="card">Kredi ve Banka Kartları</option>
                {item.credit_price ? (
                  <option value="credit_balance">Site Kredisi ({item.credit_price} kredi)</option>
                ) : null}
              </select>
            </div>

            <label className="cart-check">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              <span>Kullanım şartlarını kabul ediyorum.</span>
            </label>

            {error && <div className="notice notice-err">{error}</div>}

            <button
              type="button"
              className="cart-pay"
              disabled={!accepted || busy}
              onClick={handleCheckout}
            >
              {busy ? 'İşleniyor…' : 'Ödemeye Geç'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
