'use client';

import { useEffect, useState } from 'react';

interface Me {
  id: string;
  minecraft_nick: string;
  credit_balance: number;
  role: 'user' | 'admin';
}

export default function UserBar() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setMe(data.user);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe(null);
    window.location.href = '/';
  }

  if (loading) {
    return <span className="userbar-skeleton" aria-hidden="true" />;
  }

  if (!me) {
    return (
      <a href="/giris" className="btn btn-ghost">
        Giriş Yap
      </a>
    );
  }

  return (
    <div className="userbar">
      <div className="userbar-info">
        <span className="userbar-nick">{me.minecraft_nick}</span>
        <span className="userbar-balance">{me.credit_balance} kredi</span>
      </div>
      <button
        type="button"
        className="userbar-logout"
        onClick={handleLogout}
        aria-label="Çıkış yap"
        title="Çıkış yap"
      >
        ×
      </button>
    </div>
  );
}
