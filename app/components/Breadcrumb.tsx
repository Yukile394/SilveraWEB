export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Sayfa yolu">
      <a href="/" className="crumbs-home" aria-label="Anasayfa">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3l9 8h-2.5v9h-5v-6h-3v6h-5v-9H3z" />
        </svg>
      </a>
      {items.map((c, i) => (
        <span className="crumbs-part" key={`${c.label}-${i}`}>
          <span className="crumbs-sep" aria-hidden="true">›</span>
          {c.href ? <a href={c.href}>{c.label}</a> : <span className="crumbs-current">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
