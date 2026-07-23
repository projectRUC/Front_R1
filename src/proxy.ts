import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Obtenemos el token desde las cookies
  const token = request.cookies.get('access_token')?.value;

  // Proteger la ruta de dashboard (redireccionar al login si no hay token)
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si el usuario ya está autenticado e intenta ir a login/register, se le manda al dashboard
  if ((request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Especificamos las rutas donde queremos que se ejecute el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
