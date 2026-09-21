import type { SocialKey } from '@/lib/site';

export default function SocialIcon({ name, size = 18 }: { name: SocialKey; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (name === 'youtube') {
    return (
      <svg {...common}>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'instagram') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'tiktok') {
    return (
      <svg {...common}>
        <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 3c.3 2.6 2.1 4.4 5 4.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M6 6.5c2-1.2 4-1.7 6-1.7s4 .5 6 1.7c1.6 3 2.3 6 2.2 10-1.6 1.2-3.2 1.8-4.7 2.2l-1-1.6M6 6.5c-1.6 3-2.3 6-2.2 10 1.6 1.2 3.2 1.8 4.7 2.2l1-1.6" />
      <path d="M8.5 17c2 .6 5 .6 7 0" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}
