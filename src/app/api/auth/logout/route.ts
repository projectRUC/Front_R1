import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Limpiamos la cookie seteada por el backend en el mismo dominio
  cookieStore.delete('access_token');
  
  return NextResponse.json({ message: 'Sesión cerrada localmente' });
}
