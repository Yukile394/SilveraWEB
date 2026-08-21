-- Bu dosyayı schema.sql'den SONRA çalıştır.
-- Supabase SQL Editor'e yapıştır, KENDİ bilgilerinle değiştirip Run'a bas.

-- 1) İlk admin kullanıcı (şifreyi bcrypt ile hash'lemen lazım — aşağıdaki
--    NOT kısmına bak, tarayıcıdan hash üretebileceğin bir yöntem var)
insert into admin_users (username, password_hash)
values ('admin', '$2a$12$REPLACE_WITH_BCRYPT_HASH');

-- 2) Örnek ürün: Silvera VIP
insert into products (category, name, description, benefits, price, credit_price, delivery_command, is_active)
values (
  'vip',
  'Silvera VIP',
  'Sunucuda özel yetkiler ve ayrıcalıklar kazan.',
  '["Özel [VIP] rütbesi", "Renkli sohbet", "Ekstra ev sayısı", "Öncelikli sıra"]',
  100.00,
  100,
  'lp user {PLAYER} parent set silvera_vip',
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
