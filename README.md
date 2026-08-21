# Silvera — Minecraft Network Platformu

Bu proje telefondan, GitHub üzerinden yönetilecek şekilde hazırlandı.
Aşağıdaki adımları sırayla takip et. Her adımı bitirmeden diğerine geçme.

> ⚠️ Bu README, projenin **1. Aşaması** (proje iskeleti + veritabanı) için
> hazırlandı. Ödeme, mağaza, admin paneli gibi bölümler ayrı aşamalarda
> eklenecek ve README her aşamada güncellenecek.

---

## 1. GitHub Repository Oluşturma

1. GitHub uygulamasını veya tarayıcıdan github.com'u aç.
2. Sağ üstteki **+** ikonuna dokun → **New repository**.
3. İsim olarak `silvera` yaz.
4. **Private** seç (herkese açık olmasın, güvenlik için).
5. **Create repository** butonuna bas.

## 2. Dosyaları GitHub'a Yükleme

Termux kullanıyorsan:

```bash
cd silvera
git init
git remote add origin https://github.com/KULLANICI_ADIN/silvera.git
git add .
git commit -m "İlk kurulum: proje iskeleti ve veritabanı şeması"
git branch -M main
git push -u origin main
```

`KULLANICI_ADIN` yerine kendi GitHub kullanıcı adını yaz. Push sırasında
şifre istenirse, GitHub artık şifre kabul etmiyor — bunun yerine
**Personal Access Token** kullanman gerekiyor (zaten kullandığını biliyorum,
aynı token'ı burada da kullanabilirsin).

## 3. Supabase (Veritabanı) Hesabı Açma

1. supabase.com adresine git, **Start your project** ile ücretsiz hesap aç
   (GitHub ile giriş yapabilirsin).
2. **New Project** oluştur, bir isim ver (örn: `silvera`) ve güçlü bir
   veritabanı şifresi belirle (bu şifreyi bir yere kaydet).
3. Proje oluşunca sol menüden **SQL Editor**'a git.
4. `database/schema.sql` dosyasının tüm içeriğini kopyala, SQL Editor'e
   yapıştır, **Run** butonuna bas. Bu, tüm tabloları (kullanıcılar, ürünler,
   siparişler, krediler vb.) otomatik oluşturur.
5. Sol menüden **Project Settings → API** kısmına git. Orada göreceğin:
   - `Project URL` → bu senin `NEXT_PUBLIC_SUPABASE_URL` değerin
   - `anon public` key → bu senin `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerin
   - `service_role` key → bu senin `SUPABASE_SERVICE_ROLE_KEY` değerin
     (bu anahtarı KİMSEYLE PAYLAŞMA, tam yetkiye sahip)

## 4. GitHub Secrets Ekleme

1. GitHub'da repository sayfana git.
2. **Settings → Secrets and variables → Actions** kısmına gir.
3. **New repository secret** ile aşağıdakileri tek tek ekle:

| Secret adı | Değer |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | Sitenin adresi (deploy sonrası öğreneceğiz, şimdilik `https://example.com` yaz) |
| `NEXT_PUBLIC_SERVER_IP` | `play.silvera.com` gibi sunucu IP'n |
| `SESSION_SECRET` | Rastgele uzun bir metin (örn. bir şifre üretici ile 32+ karakter) |

Vercel bağlantısı için (5. adımda alacağız):
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 5. Vercel'e Bağlama (Deploy)

1. vercel.com adresine git, GitHub ile giriş yap.
2. **Add New → Project** ile `silvera` repository'ni seç ve import et.
3. Framework olarak otomatik **Next.js** algılanacak, dokunma.
4. **Environment Variables** kısmına Supabase bilgilerini (3. adımdakiler) gir.
5. **Deploy** butonuna bas.
6. Vercel Token almak için: vercel.com/account/tokens → **Create Token**.
7. Org ID ve Project ID için: Vercel proje ayarları → **General** sekmesinde
   görünür, ya da `vercel link` komutuyla oluşan `.vercel/project.json`
   dosyasından okunabilir.

---

## 6. İlk Admin ve Örnek Ürün Ekleme

1. `database/seed.sql` içindeki notu takip ederek bir bcrypt hash üret.
2. Dosyayı Supabase SQL Editor'e yapıştır, hash'i yerine koy, **Run**.
3. Bu, `admin` kullanıcısını ve iki örnek ürünü (Silvera VIP, 100 Kredi
   paketi) oluşturur.

## 7. API Uçları (bu aşamada eklenenler)

Backend mantığı artık çalışır durumda (`app/api/` altında):

- `POST /api/auth/register` — nick + şifre ile kayıt
- `POST /api/auth/login` — giriş (rate limit'li)
- `POST /api/auth/logout` — çıkış
- `GET /api/products` — mağaza ürünleri (kategoriye göre filtrelenebilir)
- `POST /api/orders` — sipariş oluşturma (kredi ile ödemede bakiye anında düşer)
- `POST /api/payments/webhook` — ödeme sağlayıcısı webhook'u (imza doğrulamalı)
- `GET /api/credits/history` — kullanıcının kredi geçmişi
- `POST /api/admin/credits` — admin manuel kredi ekleme/çıkarma (audit loglu)
- `POST /api/minecraft/deliver` — bekleyen VIP teslimatlarını işler (cron ile çağrılmalı)

⚠️ `/api/payments/webhook` ve `/api/minecraft/deliver` şu an **örnek/genel
yapı** — gerçek PayTR/iyzico formatına ve kendi Minecraft eklentinin
API'sine göre uyarlanmalı (`TODO: PAYMENT_PROVIDER_CONFIG` ve
`TODO: MINECRAFT_API_CONFIG` yorumlarını ara).

## Sırada Ne Var? (sonraki aşamalar)

1. ✅ Proje iskeleti + veritabanı şeması
2. ✅ Auth (kayıt/giriş/çıkış) + mağaza + sipariş + kredi + webhook + teslimat API'leri *(bu aşama)*
3. Frontend sayfaları (ana sayfa, mağaza, ürün detay, checkout, hesap, admin paneli — arayüz)
4. Gerçek ödeme sağlayıcısı bağlantısı (senin PayTR/iyzico hesabınla)
5. Gerçek Minecraft sunucu API bağlantısı (senin eklentin ile)
6. Destek sistemi arayüzü, admin gelir grafiklerinin arayüzü
7. Mobil ince ayarlar, SEO, performans, son güvenlik taraması

Not: API'ler hazır ama henüz **görsel arayüz (sayfalar)** yok — bir sonraki
teslimatta ana sayfa, mağaza ve hesap sayfalarının React/Next.js arayüzünü
ekleyeceğim.

18 yaş altı hesap/ödeme işlemleri gerektiren durumlarda, ödeme
sağlayıcısının kurallarına göre veli/yasal temsilci onayı gerekebilir —
gerçek ödeme sağlayıcısı hesabı açarken bunu kontrol et.
