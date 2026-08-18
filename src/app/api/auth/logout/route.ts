import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Borrado directo en el almacén de cookies del servidor
  cookieStore.set('access_token', '', { expires: new Date(0), maxAge: 0, path: '/' });
  cookieStore.set('is_logged_in', '', { expires: new Date(0), maxAge: 0, path: '/' });
  cookieStore.delete('access_token');
  cookieStore.delete('is_logged_in');
  
  // Garantizar la expulsión en los encabezados HTTP de la respuesta de salida al navegador
  const response = NextResponse.json({ message: 'Sesión cerrada localmente de forma exitosa' });
  response.cookies.set('access_token', '', { expires: new Date(0), maxAge: 0, path: '/' });
  response.cookies.set('is_logged_in', '', { expires: new Date(0), maxAge: 0, path: '/' });
  response.cookies.delete('access_token');
  response.cookies.delete('is_logged_in');

  return response;
}
