import { notFound } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import VipShop from '../../../components/VipShop';
import { BOXPVP_CATEGORIES, findCategory } from '@/lib/categories';

export const dynamicParams = false;

export function generateStaticParams() {
  return BOXPVP_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default function BoxPvpCategoryPage({ params }: { params: { slug: string } }) {
  const category = findCategory(params.slug);
  if (!category) notFound();

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Sunucu', href: '/magaza' },
          { label: 'BoxPvP', href: '/magaza/boxpvp' },
          { label: category.name },
        ]}
      />
      <h2 className="page-h2">{category.name}</h2>

      {category.slug === 'ozel-uyelikler' ? (
        <VipShop />
      ) : (
        <div className="notice notice-warn">Bu kategoride şu an satışta ürün yok.</div>
      )}
    </div>
  );
}
