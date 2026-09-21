export interface StoreCategory {
  slug: string;
  name: string;
  bannerLines: string[];
}

export const BOXPVP_CATEGORIES: StoreCategory[] = [
  { slug: 'ozel-uyelikler', name: 'Özel Üyelikler', bannerLines: ['ÖZEL', 'ÜYELİKLER'] },
  { slug: 'anahtarlar', name: 'Anahtarlar', bannerLines: ['ANAHTARLAR'] },
  { slug: 'lonca-market', name: 'Lonca Market', bannerLines: ['LONCA', 'MARKET'] },
  { slug: 'charmlar', name: 'Charmlar', bannerLines: ['CHARMLAR'] },
  { slug: 'otomatik-takas', name: 'Otomatik Takas', bannerLines: ['OTOMATİK', 'TAKAS'] },
];

export function findCategory(slug: string): StoreCategory | undefined {
  return BOXPVP_CATEGORIES.find((c) => c.slug === slug);
}

export const MAINTENANCE_PAGES: Record<string, string> = {
  'kredi-yatir': 'Kredi Yatır',
  'kredi-gonder': 'Kredi Gönder',
  basvuru: 'Başvuru',
  destek: 'Destek',
  kurallar: 'Kurallar',
  'hizmet-sartlari': 'Hizmet Şartları ve Kullanım Koşulları',
  'mesafeli-satis': 'Mesafeli Satış ve İade Sözleşmesi',
  kvkk: 'KVKK Aydınlatma Metni',
  'sirket-bilgileri': 'Şirket Bilgileri ve İletişim',
};
