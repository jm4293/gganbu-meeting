import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트는 허용
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 정적 파일은 허용 (_next, public 파일들)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/default.') ||
    pathname.startsWith('/preview.') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif)$/)
  ) {
    return NextResponse.next();
  }

  // "/" 경로는 허용
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 그 외 모든 경로는 "/" 로 리다이렉트
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
