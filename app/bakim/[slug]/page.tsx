import { notFound } from 'next/navigation';
import { MAINTENANCE_PAGES } from '@/lib/categories';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(MAINTENANCE_PAGES).map((slug) => ({ slug }));
}

export default function BakimPage({ params }: { params: { slug: string } }) {
  const title = MAINTENANCE_PAGES[params.slug];
  if (!title) notFound();

  return (
    <div className="page">
      <div className="maint">
        <div className="maint-icon" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />
          </svg>
        </div>
        <h1 className="maint-title">{title}</h1>
        <p className="maint-text">Bu bölüm şu anda bakımda. En kısa sürede yeniden aktif olacak.</p>
        <a href="/" className="btn btn-primary">
          Anasayfaya Dön
        </a>
      </div>
    </div>
  );
}
