import IpCopyButton from './ip-copy-button';

const categories = [
  {
    index: '01',
    key: 'vip',
    name: 'VIP Rütbeler',
    desc: 'Sunucuda kalıcı ayrıcalıklar, özel komutlar ve öncelikli giriş.',
    color: 'var(--amber)',
  },
  {
    index: '02',
    key: 'rutbe',
    name: 'Rütbe & Prefix',
    desc: 'İsim renkleri, sohbet prefixleri ve tab liste rozetleri.',
    color: 'var(--silver)',
  },
  {
    index: '03',
    key: 'kit',
    name: 'Kitler',
    desc: 'Hazır ekipman paketleri, tek tıkla envanterine gelir.',
    color: 'var(--emerald)',
  },
  {
    index: '04',
    key: 'kasa_anahtari',
    name: 'Kasa Anahtarı',
    desc: 'Ödül sandıklarını açmak için gereken anahtarlar.',
    color: '#c9884f',
  },
  {
    index: '05',
    key: 'kredi',
    name: 'Kredi',
    desc: 'Mağazada dilediğin ürüne harcayabileceğin bakiye.',
    color: '#7fb0d9',
  },
  {
    index: '06',
    key: 'kozmetik',
    name: 'Kozmetik',
    desc: 'Parçacık efektleri, evcil hayvanlar ve görsel eşyalar.',
    color: '#b088c9',
  },
  {
    index: '07',
    key: 'ozel',
    name: 'Özel Eşyalar',
    desc: 'Sınırlı sayıda üretilen, zamanla değeri artan koleksiyon eşyaları.',
    color: '#d97757',
  },
] as const;

const SERVER_IP = '31.57.77.139:25572';

export default function HomePage() {
  return (
    <>
      <header className="nav">
        <div className="shell nav-inner">
          <div className="wordmark">
            <span className="wordmark-mark" aria-hidden="true" />
            SILVERA
          </div>
          <nav className="nav-right">
            <a href="#kategoriler" className="nav-link">
              Mağaza
            </a>
            <a href="#nasil-calisir" className="nav-link">
              Nasıl Çalışır
            </a>
            <a href="/giris" className="btn btn-ghost">
              Giriş Yap
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="shell hero">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Sunucu şu anda açık
            </div>
            <h1>
              Envanterini <em>Silvera</em>&apos;da güçlendir.
            </h1>
            <p className="hero-sub">
              Rütbe, kit, kasa anahtarı ve daha fazlası — satın al, oyunda saniyeler
              içinde teslim alsın. Kartla veya kredi bakiyenle öde.
            </p>
            <div className="hero-actions">
              <div className="ip-box">
                <span className="ip-box-label">Sunucu IP</span>
                <IpCopyButton ip={SERVER_IP} />
              </div>
              <a href="#kategoriler" className="btn btn-primary">
                Mağazayı Aç
              </a>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            {[
              'glow-amber', '', 'filled', '',
              '', 'filled', 'glow-emerald', '',
              'filled', '', '', 'glow-silver',
              '', 'filled', '', 'filled',
            ].map((cls, i) => (
              <div key={i} className={`mosaic-cell ${cls}`} />
            ))}
          </div>
        </section>

        <section className="shell section" id="kategoriler">
          <div className="section-head">
            <h2 className="section-title">Envanterini Aç</h2>
            <span className="section-note">7 / 9 slot dolu</span>
          </div>

          <div className="hotbar">
            {categories.map((c, i) => (
              <a
                key={c.key}
                href={`#${c.key}`}
                className="hotbar-slot active"
                aria-label={c.name}
              >
                <span className="hotbar-slot-index">{i + 1}</span>
                <span
                  className="hotbar-slot-icon"
                  style={{ background: c.color }}
                />
              </a>
            ))}
            <div className="hotbar-slot empty" aria-hidden="true">
              <span className="hotbar-slot-index">8</span>
              <span className="hotbar-slot-icon" />
            </div>
            <div className="hotbar-slot empty" aria-hidden="true">
              <span className="hotbar-slot-index">9</span>
              <span className="hotbar-slot-icon" />
            </div>
          </div>

          <div className="cat-grid">
            {categories.map((c, i) => (
              <div className="cat-card" key={c.key} id={c.key}>
                <div className="cat-card-top">
                  <span className="cat-card-index">{c.index}</span>
                  <span className="cat-swatch" style={{ background: c.color }} />
                </div>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="shell section" id="nasil-calisir">
          <div className="section-head">
            <h2 className="section-title">Nasıl Çalışır</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">001</div>
              <h4>Ürününü seç</h4>
              <p>Mağazadan istediğin rütbe, kit veya kredi paketini bul.</p>
            </div>
            <div className="step">
              <div className="step-num">002</div>
              <h4>Güvenle öde</h4>
              <p>Kartla veya bakiyenle öde, işlemin anında onaylanır.</p>
            </div>
            <div className="step">
              <div className="step-num">003</div>
              <h4>Oyunda teslim al</h4>
              <p>Sunucuya giriş yaptığında ürünün otomatik olarak hesabına işlenir.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer-inner">
          <div className="footer-ip">
            Sunucu adresi: <strong>{SERVER_IP}</strong>
          </div>
          <div className="footer-meta">© {new Date().getFullYear()} Silvera</div>
        </div>
      </footer>
    </>
  );
}
