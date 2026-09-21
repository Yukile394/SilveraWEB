'use client';

import { useEffect, useRef, useState } from 'react';
import UserBar from './UserBar';

const links = [
  { href: '/', label: 'Anasayfa', id: 'home' },
  { href: '/#vip-shop', label: 'Mağaza', id: 'vip-shop' },
] as const;

const creditLinks = [
  { href: '/#kredi', label: 'Kredi Yatır' },
  { href: '/#kredi', label: 'Kredi Gönder' },
] as const;

const tail = [
  { href: '/#nasil-calisir', label: 'Başvuru', id: 'nasil-calisir' },
  { href: '/#destek', label: 'Destek', id: 'destek' },
] as const;

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('home');
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const ids = ['vip-shop', 'nasil-calisir', 'destek'];
    function onScroll() {
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="snav">
      <div className="snav-inner">
        <a href="/" className="snav-logo" aria-label="Silvera Network">
          <img src="/logo.png" alt="Silvera Network" />
        </a>

        <nav className="snav-links" aria-label="Ana menü">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className={`snav-link${active === l.id ? ' is-active' : ''}`}
            >
              {l.label}
            </a>
          ))}

          <div className="snav-drop" ref={dropRef}>
            <button
              type="button"
              className="snav-link snav-drop-btn"
              aria-haspopup="true"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              Kredi Yatır &amp; Gönder
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {open && (
              <div className="snav-menu">
                {creditLinks.map((c) => (
                  <a key={c.label} href={c.href} onClick={() => setOpen(false)}>
                    {c.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {tail.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className={`snav-link${active === l.id ? ' is-active' : ''}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="snav-actions">
          <a href="/#vip-shop" className="snav-cart" aria-label="Sepet">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 10h18l-2 9H5z" />
              <path d="M8 10l3-6M16 10l-3-6" />
              <path d="M9 14v2M12 14v2M15 14v2" />
            </svg>
            <span className="snav-cart-badge">0</span>
          </a>
          <UserBar />
        </div>
      </div>
    </header>
  );
                }
