import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Obtenemos tanto el token HttpOnly como la bandera oficial de sesión en cliente
  const token = request.cookies.get('access_token')?.value?.trim();
  const isLoggedIn = request.cookies.get('is_logged_in')?.value?.trim() === 'true';

  // Validamos que el usuario posea una sesión legítima activa (token o flag inyectado al loguearse)
  const hasValidSession = !!token || isLoggedIn;

  // Proteger la ruta de dashboard (redireccionar al login si no hay sesión activa)
  if (request.nextUrl.pathname.startsWith('/dashboard') && !hasValidSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si el usuario ya está autenticado e intenta ir a login/register, se le redirige al dashboard
  if ((request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) && hasValidSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Especificamos las rutas donde queremos que se ejecute el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
