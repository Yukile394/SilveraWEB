'use client';

import { useState } from 'react';

export default function IpCopyButton({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Panoya erişim yoksa sessizce yoksay.
    }
  }

  return (
    <button type="button" className="ip-box-value" onClick={handleCopy}>
      {ip}
      <span style={{ color: copied ? 'var(--emerald)' : 'var(--text-faint)', fontSize: 12 }}>
        {copied ? 'Kopyalandı' : 'Kopyala'}
      </span>
    </button>
  );
}
