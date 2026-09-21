import Breadcrumb from '../../components/Breadcrumb';
import CategoryCard from '../../components/CategoryCard';
import { BOXPVP_CATEGORIES } from '@/lib/categories';

export const metadata = { title: 'BoxPvP — Silvera Network' };

export default function BoxPvpPage() {
  return (
    <div className="page">
      <Breadcrumb items={[{ label: 'Sunucu', href: '/magaza' }, { label: 'BoxPvP' }]} />
      <h2 className="page-h2">Kategoriler</h2>
      <div className="ccard-grid">
        {BOXPVP_CATEGORIES.map((c) => (
          <CategoryCard
            key={c.slug}
            href={`/magaza/boxpvp/${c.slug}`}
            bannerLines={c.bannerLines}
            name={c.name}
          />
        ))}
      </div>
    </div>
  );
}
