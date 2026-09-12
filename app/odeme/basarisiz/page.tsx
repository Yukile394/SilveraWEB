export default function OdemeBasarisizPage() {
  return (
    <div className="auth-page">
      <a href="/" className="auth-close" aria-label="Kapat">
        ×
      </a>
      <div className="auth-card">
        <img src="/logo.png" alt="Silvera" className="auth-logo" />
        <h1 className="auth-title">Ödeme iptal edildi</h1>
        <p className="auth-sub">
          Ödeme tamamlanamadı veya iptal edildi. Kartından herhangi bir tutar çekilmediyse
          işlem hiç gerçekleşmemiş demektir. Tekrar denemek için mağazaya dönebilirsin.
        </p>
        <a href="/#vip-shop" className="btn btn-primary" style={{ marginTop: 20 }}>
          Mağazaya Dön
        </a>
      </div>
    </div>
  );
}
