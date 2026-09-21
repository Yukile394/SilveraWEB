'use client';

import { useEffect, useState } from 'react';
import { SERVER_IP } from '@/lib/site';

type Status = { state: 'loading' } | { state: 'online'; players: number } | { state: 'offline' };

export default function OnlineCount() {
  const [status, setStatus] = useState<Status>({ state: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.online) {
          setStatus({ state: 'online', players: Number(d.players?.online ?? 0) });
        } else {
          setStatus({ state: 'offline' });
        }
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') setStatus({ state: 'offline' });
      });
    return () => controller.abort();
  }, []);

  if (status.state === 'loading') return <div className="eyebrow" style={{ visibility: 'hidden' }}>.</div>;

  return (
    <div className="eyebrow">
      <span
        className="eyebrow-dot"
        aria-hidden="true"
        style={status.state === 'offline' ? { background: '#6f7883', boxShadow: 'none' } : undefined}
      />
      {status.state === 'online' ? `${status.players} oyuncu çevrimiçi` : 'Sunucu şu anda çevrimdışı'}
    </div>
  );
}
