import type { Metadata } from 'next';
import { Oswald, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Silvera Network — Minecraft Sunucu Mağazası',
  description:
    'Silvera Network sunucusu için rütbe, kit, kasa anahtarı ve kredi satın al. Anında teslimat, güvenli ödeme.',
  icons: { icon: '/logo.png' },
  openGraph: { images: ['/banner.png'] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
