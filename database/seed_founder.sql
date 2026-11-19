-- ============================================================
-- KURUCU (ADMIN) TEST HESABI
-- Supabase SQL Editor > New Query içine yapıştırıp çalıştır.
--
-- Nick:  Yukile
-- Şifre: Kakalayy8855   (bcrypt ile hashlenmiş halde aşağıda, düz metin DB'de tutulmuyor)
--
-- role = 'admin' olduğu için bu hesap /api/admin/credits endpoint'ini
-- kullanabilir: kendine veya başka bir kullanıcıya bedava kredi ekleyebilir.
-- Gerçek ödeme sağlayıcısı (iyzico) bağlanana kadar krediyi test etmenin
-- güvenli yolu budur; kod içine "her zaman bedava kredi ekle" gibi bir
-- backdoor KOYMADIK — her ekleme audit_logs'a işleniyor ve sadece admin
-- rolündeki hesaplar çağırabiliyor.
-- ============================================================

insert into users (minecraft_nick, password_hash, role, account_status, credit_balance)
values (
  'Yukile',
  '$2a$12$mm5m99LC5eES/UAKwnLlNuSQspT1Dh6oO5y56xPKmJTJ.PyclSQ8O',
  'admin',
  'active',
  0
)
on conflict (minecraft_nick) do update
  set password_hash = excluded.password_hash,
      role = 'admin',
      account_status = 'active';
