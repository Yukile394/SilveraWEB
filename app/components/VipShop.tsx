'use client';

import { useEffect, useState } from 'react';
import { getTierDisplay } from '@/lib/vipTiers';
import { writeCart } from '@/lib/cart';

interface Product {
  id: string;
  name: string;
  description: string | null;
  benefits: string[];
  price: number;
  credit_price: number | null;
  category: string;
}

export default function VipShop() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  function loadProducts() {
    setProducts(null);
    setLoadError('');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch('/api/products?category=vip', { cache: 'no-store', signal: controller.signal })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok || !data) {
          throw new Error(data?.error || 'Ürünler alınamadı.');
        }
        setProducts(data.products ?? []);
      })
      .catch((err) => {
        setProducts([]);
        setLoadError(
          err?.name === 'AbortError'
            ? 'Sunucudan yanıt gelmedi (zaman aşımı).'
            : err?.message || 'Ürünler yüklenemedi.'
        );
      })
      .finally(() => clearTimeout(timeout));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleAddToCart(product: Product) {
    writeCart({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      credit_price: product.credit_price,
      category: 'Özel Üyelikler',
    });
    setAddedId(product.id);
  }

  if (products === null) {
    return <div className="vip-loading">Rütbeler yükleniyor…</div>;
  }

  if (loadError) {
    return (
      <div className="vip-loading vip-loading-error">
        <p>{loadError}</p>
        <button type="button" className="btn btn-ghost" onClick={loadProducts}>
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="vip-loading">Şu an satışta ürün yok.</div>;
  }

  const sorted = [...products].sort(
    (a, b) => getTierDisplay(a.name).rank - getTierDisplay(b.name).rank
  );

  return (
    <div className="vip-grid">
      {sorted.map((p) => {
        const tier = getTierDisplay(p.name);
        const added = addedId === p.id;
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
                <span className="vip-card-price-main">{p.price} ₺</span>
                {p.credit_price && <span className="vip-card-price-alt">veya {p.credit_price} kredi</span>}
              </div>
              <div className="vip-buy-row">
                <button type="button" className="btn vip-buy-btn" onClick={() => handleAddToCart(p)}>
                  {added ? 'Sepete Eklendi ✓' : 'Sepete Ekle'}
                </button>
                {added && (
                  <a href="/sepet" className="btn btn-ghost vip-buy-btn-alt">
                    Sepete Git
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
