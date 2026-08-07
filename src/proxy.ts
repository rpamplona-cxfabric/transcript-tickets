import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth/auth0';

const isPublicPath = (pathname: string) => pathname === '/signin';

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith('/auth') || isPublicPath(pathname)) {
    return authResponse;
  }

  const session = await auth0.getSession(request);
  if (session) {
    return authResponse;
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const returnTo = `${pathname}${search}`;
  const signInUrl = new URL('/signin', request.url);
  signInUrl.searchParams.set('returnTo', returnTo);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
