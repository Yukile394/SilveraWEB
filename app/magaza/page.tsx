import CategoryCard from '../components/CategoryCard';

export const metadata = { title: 'Mağaza — Silvera Network' };

export default function MagazaPage() {
  return (
    <div className="page">
      <div className="store-eyebrow">MAĞAZA</div>
      <h1 className="store-title">Silvera Network Mağazası</h1>

      <h2 className="page-h2" style={{ marginTop: 56 }}>
        Kategoriler
      </h2>
      <div className="ccard-grid">
        <CategoryCard href="/magaza/boxpvp" bannerLines={['BOXPVP']} name="BoxPvP" />
      </div>
    </div>
  );
}
