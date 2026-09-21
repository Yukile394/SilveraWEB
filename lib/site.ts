// Site geneli sabitler. Sosyal medya linklerini buradan doldur.
export const SITE_NAME = 'Silvera Network';
export const SERVER_IP = 'play.silvera.com.tr';

export const SOCIAL_LINKS = {
  instagram: '',
  youtube: '',
  tiktok: '',
  discord: '',
} as const;

export type SocialKey = keyof typeof SOCIAL_LINKS;
