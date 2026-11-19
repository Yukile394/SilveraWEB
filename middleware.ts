import { NextRequest, NextResponse } from 'next/server';

// Deneme modu: Siteye giren herkes önce giriş yapmak / hesap oluşturmak zorunda.
// Bu dosya PUBLIC_PATHS dışındaki her sayfayı kilitler; oturumu olmayanlar /giris'e atılır.
// NOT: Gerçek yayında bu davranışı kaldırmak/gevşetmek istersen PUBLIC_PATHS listesini genişlet
// ya da middleware'i tamamen kaldır.

const PUBLIC_PATHS = ['/giris', '/bakim']; // /bakim = maintenance sayfası (varsa)

const PUBLIC_API_PREFIXES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true;
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // Next.js statik dosyaları ve public/ klasöründeki varlıklar her zaman serbest.
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|svg|webp|ico|css|js|woff2?|ttf)$/i.test(pathname)
  ) {
    return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(req.cookies.get('silvera_session')?.value);

  if (!hasSession) {
    // API isteklerine JSON 401, sayfa isteklerine /giris yönlendirmesi.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });
    }
    const loginUrl = new URL('/giris', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
