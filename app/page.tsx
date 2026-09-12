import IpCopyButton from './ip-copy-button';
import UserBar from './components/UserBar';
import VipShop from './components/VipShop';

const otherCategories = [
  {
    index: '01',
    key: 'kit',
    name: 'Kitler',
    desc: 'Hazır ekipman paketleri, tek tıkla envanterine gelir.',
    color: 'var(--emerald)',
  },
  {
    index: '02',
    key: 'kasa_anahtari',
    name: 'Kasa Anahtarı',
    desc: 'Ödül sandıklarını açmak için gereken anahtarlar.',
    color: '#c9884f',
  },
  {
    index: '03',
    key: 'kredi',
    name: 'Kredi',
    desc: 'Mağazada dilediğin ürüne harcayabileceğin bakiye.',
    color: '#7fb0d9',
  },
  {
    index: '04',
    key: 'kozmetik',
    name: 'Kozmetik',
    desc: 'Parçacık efektleri, evcil hayvanlar ve görsel eşyalar.',
    color: '#b088c9',
  },
  {
    index: '05',
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
          <a href="/" className="wordmark">
            <img src="/logo.png" alt="Silvera" className="wordmark-logo" />
            SILVERA
          </a>
          <nav className="nav-right">
            <a href="#vip-shop" className="mode-pill">
              SVX <span>(BoxPvP)</span>
            </a>
            <a href="#kategoriler" className="nav-link">
              Mağaza
            </a>
            <a href="#nasil-calisir" className="nav-link">
              Nasıl Çalışır
            </a>
            <UserBar />
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
              SVX (BoxPvP) rütbelerinden kitlere, kasa anahtarından krediye kadar her şey
              burada — satın al, oyunda saniyeler içinde teslim alsın.
            </p>
            <div className="hero-actions">
              <div className="ip-box">
                <span className="ip-box-label">Sunucu IP</span>
                <IpCopyButton ip={SERVER_IP} />
              </div>
              <a href="#vip-shop" className="btn btn-primary">
                VIP Mağazasını Aç
              </a>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <img src="/logo.png" alt="" className="hero-art-logo" />
          </div>
        </section>

        <section className="shell section vip-section" id="vip-shop">
          <div className="section-head">
            <div>
              <span className="mode-pill mode-pill-static">
                SVX <span>(BoxPvP)</span>
              </span>
              <h2 className="section-title" style={{ marginTop: 14 }}>
                VIP Rütbeleri
              </h2>
            </div>
            <span className="section-note">AstraVIP → PrimeVIP → StrongVIP → SVIP+</span>
          </div>

          <VipShop />
        </section>

        <section className="shell section" id="kategoriler">
          <div className="section-head">
            <h2 className="section-title">Diğer Ürünler</h2>
            <span className="section-note">5 kategori</span>
          </div>

          <div className="cat-grid">
            {otherCategories.map((c) => (
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
              <h4>Hesabınla giriş yap</h4>
              <p>Oyun içi kayıt bilgilerinle siteye giriş yap.</p>
            </div>
            <div className="step">
              <div className="step-num">002</div>
              <h4>Ürününü seç</h4>
              <p>VIP rütbesi, kit veya kredi paketini seç.</p>
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
