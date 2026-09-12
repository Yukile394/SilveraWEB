// Bu dosya sadece GÖRSEL sıralama/renk bilgisi tutar.
// Fiyat, kredi tutarı ve teslimat komutu HER ZAMAN veritabanından (products
// tablosu) gelir — burada asla fiyat yazma.

export interface VipTierDisplay {
  matchName: string; // database'deki products.name ile birebir eşleşmeli
  tag: string; // kısa rozet
  rank: number; // 1 = en güçlü
  accent: string; // css değişkeni değeri
}

export const VIP_TIER_DISPLAY: VipTierDisplay[] = [
  { matchName: 'AstraVIP', tag: 'EN GÜÇLÜ', rank: 1, accent: '#e0a458' },
  { matchName: 'PrimeVIP', tag: 'GÜÇLÜ', rank: 2, accent: '#c9cddb' },
  { matchName: 'StrongVIP', tag: 'ORTA', rank: 3, accent: '#7fb0d9' },
  { matchName: 'SVIP+', tag: 'BAŞLANGIÇ', rank: 4, accent: '#8a6a3f' },
];

export function getTierDisplay(productName: string): VipTierDisplay {
  const found = VIP_TIER_DISPLAY.find((t) => t.matchName === productName);
  return found ?? { matchName: productName, tag: 'VIP', rank: 99, accent: '#7fb0d9' };
}
