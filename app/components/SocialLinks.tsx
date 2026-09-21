import { SOCIAL_LINKS, type SocialKey } from '@/lib/site';
import SocialIcon from './SocialIcon';

const order: SocialKey[] = ['youtube', 'instagram', 'discord', 'tiktok'];
const labels: Record<SocialKey, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  discord: 'Discord',
  tiktok: 'TikTok',
};

export default function SocialLinks() {
  return (
    <div className="social-row">
      {order.map((k) => {
        const url = SOCIAL_LINKS[k];
        return url ? (
          <a key={k} href={url} target="_blank" rel="noopener noreferrer" className={`social-btn social-${k}`} aria-label={labels[k]}>
            <SocialIcon name={k} />
          </a>
        ) : (
          <span key={k} className={`social-btn social-${k} is-off`} aria-label={labels[k]}>
            <SocialIcon name={k} />
          </span>
        );
      })}
    </div>
  );
}
