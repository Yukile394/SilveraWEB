import { SOCIAL_LINKS, SITE_NAME, type SocialKey } from '@/lib/site';
import SocialIcon from './SocialIcon';

const socials: { key: SocialKey; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'discord', label: 'Discord' },
];

export default function SiteFooter() {
  return (
    <footer className="sfoot">
      <div className="sfoot-inner">
        <div className="sfoot-cols">
          <div className="sfoot-about">
            <h4>HAKKIMIZDA</h4>
            <p>
              {SITE_NAME}, Minecraft oyuncularına kaliteli ve kesintisiz bir oyun deneyimi sunmak
              amacıyla tasarlandı. Farklı oyun modlarımız, gelişmiş sistemlerimiz ve oyun odaklı
              yönetim sistemimiz sıradışı özellikler sunuyor.
            </p>
            <p>{SITE_NAME}&apos;ün Mojang AB veya Microsoft ile herhangi bir bağlantısı yoktur.</p>
          </div>

          <div>
            <h4>HIZLI MENÜ</h4>
            <ul>
              <li><a href="/">Ana sayfa</a></li>
              <li><a href="/magaza">Mağaza</a></li>
              <li><a href="/bakim/basvuru">Yetkilendirilmiş Başvurular</a></li>
              <li><a href="/bakim/destek">Yardım</a></li>
            </ul>
          </div>

          <div>
            <h4>SOSYAL MEDYA</h4>
            <ul>
              {socials.map((s) => {
                const url = SOCIAL_LINKS[s.key];
                const inner = (
                  <>
                    <SocialIcon name={s.key} size={15} /> {s.label}
                  </>
                );
                return (
                  <li key={s.key}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="sfoot-social">
                        {inner}
                      </a>
                    ) : (
                      <span className="sfoot-social is-off">{inner}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4>BAĞLANTILAR</h4>
            <ul>
              <li><a href="/bakim/kurallar">Kurallar</a></li>
              <li><a href="/bakim/hizmet-sartlari">Hizmet Şartları ve Kullanım Koşulları</a></li>
              <li><a href="/bakim/mesafeli-satis">Mesafeli Satış ve İade Sözleşmesi</a></li>
              <li><a href="/bakim/kvkk">KVKK Aydınlatma Metni</a></li>
              <li><a href="/bakim/sirket-bilgileri">Şirket Bilgileri ve İletişim</a></li>
            </ul>
          </div>
        </div>

        <div className="sfoot-bottom">
          <span>
            <strong>{SITE_NAME}</strong> . Tüm hakları saklıdır. © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
