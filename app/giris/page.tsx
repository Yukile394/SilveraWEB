'use client';

import { useState, FormEvent } from 'react';

export default function GirisPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!nick.trim()) {
      setError('Minecraft kullanıcı adını gir.');
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minecraft_nick: nick.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu.');
        setLoading(false);
        return;
      }

      window.location.href = '/';
    } catch {
      setError('Bağlantı hatası, tekrar dene.');
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <a href="/" className="auth-close" aria-label="Kapat" title="Kapat">
        ×
      </a>

      <div className="auth-card">
        <img src="/logo-mavi.png" alt="Silvera Network" className="auth-logo" />
        <h1 className="auth-title">SILVERA</h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Oyundaki hesabınla giriş yap.'
            : 'Sunucudaki /register komutunla aynı bilgileri kullan.'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => setMode('login')}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => setMode('register')}
          >
            Kayıt Ol
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>İsmi</span>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="Minecraft kullanıcı adın"
              autoComplete="username"
              maxLength={16}
            />
          </label>

          <label className="auth-field">
            <span>Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Bekleyin…' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="auth-note">
          Sunucuda hesabın yok mu? Oyun içinde <code>/register şifre şifre</code> komutunu
          kullandıktan sonra aynı bilgilerle buradan da giriş yapabilirsin.
        </p>
      </div>
    </div>
  );
}
