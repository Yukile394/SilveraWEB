'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import UserBar from './UserBar';
import { readCart, subscribeCart } from '@/lib/cart';

export default function SiteNav() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
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
    const update = () => setCartCount(readCart() ? 1 : 0);
    update();
    return subscribeCart(update);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const cls = (active: boolean) => `snav-link${active ? ' is-active' : ''}`;

  return (
    <header className="snav">
      <div className="snav-inner">
        <a href="/" className="snav-logo" aria-label="Silvera Network">
          <img src="/logo-mavi.png" alt="Silvera Network" />
        </a>

        <nav className="snav-links" aria-label="Ana menü">
          <a href="/" className={cls(pathname === '/')}>
            Anasayfa
          </a>
          <a href="/magaza" className={cls(pathname.startsWith('/magaza'))}>
            Mağaza
          </a>

          <div className="snav-drop" ref={dropRef}>
            <button
              type="button"
              className={cls(pathname.startsWith('/bakim/kredi')) + ' snav-drop-btn'}
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
                <a href="/bakim/kredi-yatir">Kredi Yatır</a>
                <a href="/bakim/kredi-gonder">Kredi Gönder</a>
              </div>
            )}
          </div>

          <a href="/bakim/basvuru" className={cls(pathname === '/bakim/basvuru')}>
            Başvuru
          </a>
          <a href="/bakim/destek" className={cls(pathname === '/bakim/destek')}>
            Destek
          </a>
        </nav>

        <div className="snav-actions">
          <a href="/sepet" className="snav-cart" aria-label="Sepet">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 10h18l-2 9H5z" />
              <path d="M8 10l3-6M16 10l-3-6" />
              <path d="M9 14v2M12 14v2M15 14v2" />
            </svg>
            <span className="snav-cart-badge">{cartCount}</span>
          </a>
          <UserBar />
        </div>
      </div>
    </header>
  );
}
