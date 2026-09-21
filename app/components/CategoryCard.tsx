export default function CategoryCard({
  href,
  bannerLines,
  name,
}: {
  href: string;
  bannerLines: string[];
  name: string;
}) {
  return (
    <a href={href} className="ccard">
      <div className="ccard-img">
        <span className="ccard-frame" aria-hidden="true" />
        <span className="ccard-text">
          {bannerLines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      </div>
      <div className="ccard-foot">
        <span className="ccard-name">{name}</span>
        <span className="ccard-go" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M5 2l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
      </div>
    </a>
  );
}
