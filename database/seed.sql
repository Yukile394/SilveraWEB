-- Bu dosyayı schema.sql'den SONRA çalıştır.
-- Supabase SQL Editor'e yapıştır, KENDİ bilgilerinle değiştirip Run'a bas.

-- 1) İlk admin kullanıcı (şifreyi bcrypt ile hash'lemen lazım — aşağıdaki
--    NOT kısmına bak, tarayıcıdan hash üretebileceğin bir yöntem var)
insert into admin_users (username, password_hash)
values ('admin', '$2a$12$REPLACE_WITH_BCRYPT_HASH');

-- 2) SVX (BoxPvP) VIP rütbeleri — güç sırası: Astra > Prime > Strong > SVIP+
-- Fiyat/kredi değerleri örnektir, admin panelinden veya doğrudan burada
-- kendi fiyatlarınla değiştirebilirsin.
insert into products (category, name, description, benefits, price, credit_price, delivery_command, is_active)
values
(
  'vip',
  'SVIP+',
  'BoxPvP''e ilk adım rütben. Temel ayrıcalıklarla oyuna güçlü başla.',
  '["[SVIP+] rütbesi ve prefix", "Özel sohbet rengi", "+1 ev (home) hakkı", "Giriş öncelik sırası"]',
  75.00,
  75,
  'lp user {PLAYER} parent set svip_plus',
  true
),
(
  'vip',
  'StrongVIP',
  'Daha fazla eşya ve komut ayrıcalığı isteyen oyuncular için orta seviye rütbe.',
  '["[StrongVIP] rütbesi ve prefix", "SVIP+''nin tüm ayrıcalıkları", "+2 ev (home) hakkı", "Özel kit erişimi", "Kasa anahtarı indirimi"]',
  150.00,
  150,
  'lp user {PLAYER} parent set strong_vip',
  true
),
(
  'vip',
  'PrimeVIP',
  'Rekabetçi oyuncular için ileri seviye rütbe.',
  '["[PrimeVIP] rütbesi ve prefix", "StrongVIP''nin tüm ayrıcalıkları", "+3 ev (home) hakkı", "Özel PvP kiti", "Renkli tab-liste rozeti", "Haftalık bonus kredi"]',
  250.00,
  250,
  'lp user {PLAYER} parent set prime_vip',
  true
),
(
  'vip',
  'AstraVIP',
  'Silvera''nın en üst seviye rütbesi. Sunucudaki tüm ayrıcalıklara sahip ol.',
  '["[AstraVIP] rütbesi ve özel prefix", "PrimeVIP''nin tüm ayrıcalıkları", "Sınırsız ev (home) hakkı", "Özel parçacık efekti", "Öncelikli destek", "Aylık özel kasa anahtarı"]',
  400.00,
  400,
  'lp user {PLAYER} parent set astra_vip',
  true
);

-- 3) Örnek ürün: 100 Kredi paketi (ödeme ile satın alınır, TL karşılığı)
insert into products (category, name, description, price, credit_price, is_active)
values (
  'kredi',
  '100 Silvera Kredi',
  '100 TL karşılığında 100 Silvera Kredi.',
  100.00,
  100,
  true
);

-- NOT: bcrypt hash üretmek için (telefondan, kod yazmadan):
-- https://bcrypt-generator.com gibi bir siteye şifreni gir, "Rounds: 12"
-- seç, çıkan hash'i yukarıdaki REPLACE_WITH_BCRYPT_HASH yerine yapıştır.
-- Güvendiğin bir araç kullan; şifreni asla halka açık/loglanan bir yere girme.
