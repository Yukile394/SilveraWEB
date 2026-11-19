'use client';

import { useEffect, useState } from 'react';

interface Me {
  id: string;
  minecraft_nick: string;
  credit_balance: number;
  role: 'user' | 'admin';
}

// Deneme modu: Admin rolündeki hesap (Yukile) buradan kendine test kredisi ekleyebilir.
// Bu sayfa iyzico'ya hiç dokunmaz; /api/admin/credits zaten role==='admin' kontrolü yapıyor
// ve her işlemi audit_logs'a yazıyor, bu yüzden ayrı bir "bedava kredi" backdoor'una gerek yok.
export default function AdminPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadMe() {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    setMe(data.user);
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function grantSelf(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: me.id,
          amount,
          description: 'Deneme modu: kurucu hesabına test kredisi',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Hata oluştu');
      } else {
        setMsg('Kredi eklendi.');
        loadMe();
      }
    } catch {
      setMsg('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  }

  if (!me) return <main className="container" style={{ padding: '3rem 1rem' }}>Yükleniyor…</main>;

  if (me.role !== 'admin') {
    return (
      <main className="container" style={{ padding: '3rem 1rem' }}>
        <h1>Yetkisiz</h1>
        <p>Bu sayfa sadece admin rolündeki hesaplar içindir.</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '3rem 1rem', maxWidth: 480 }}>
      <h1>Kurucu Paneli</h1>
      <p>
        Hoş geldin, <strong>{me.minecraft_nick}</strong>. Güncel bakiye:{' '}
        <strong>{me.credit_balance} kredi</strong>.
      </p>

      <form onSubmit={grantSelf} style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        <label>
          <span>Eklenecek test kredisi</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Ekleniyor…' : 'Kendime Test Kredisi Ekle'}
        </button>
        {msg && <p>{msg}</p>}
      </form>

      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
        Not: Bu, gerçek ödeme akışını (iyzico) atlayan bir test aracıdır. Her ekleme
        audit_logs tablosuna kaydedilir ve sadece admin rolündeki hesaplar erişebilir.
      </p>
    </main>
  );
}
