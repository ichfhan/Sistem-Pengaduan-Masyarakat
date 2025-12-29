import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // Public paths (tidak perlu login)
  const publicPaths = ['/login', '/', '/register'];

  // Role-specific routes
  const wargaRoutes = ['/laporan-saya', '/lapor'];
  const adminRoutes = ['/manajemen'];
  const petugasRoutes = ['/tugas-saya'];

  // Jika user mengakses halaman public tapi sudah punya token -> redirect ke Dashboard
  if (token && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected paths check
  const isProtectedPath = !publicPaths.includes(pathname)
    && !pathname.startsWith('/_next')
    && !pathname.startsWith('/static')
    && !pathname.startsWith('/api')
    && !pathname.startsWith('/uploads')
    && !pathname.includes('.');

  // Jika tidak ada token dan mengakses protected path -> redirect ke Login
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based route protection
  if (token && role) {
    // Warga tidak boleh akses route admin/petugas
    if (role === 'warga') {
      if (adminRoutes.some(r => pathname.startsWith(r)) || petugasRoutes.some(r => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Admin tidak boleh akses route warga/petugas khusus
    if (role === 'admin') {
      if (wargaRoutes.some(r => pathname.startsWith(r)) || petugasRoutes.some(r => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Petugas tidak boleh akses route warga/admin khusus
    if (role === 'petugas') {
      if (wargaRoutes.some(r => pathname.startsWith(r)) || adminRoutes.some(r => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
