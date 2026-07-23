import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (correo: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ correo, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        let errorMsg = data.message || 'Error al iniciar sesión';
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg[0];
        }
        throw new Error(errorMsg);
      }

      // La cookie HttpOnly ya fue establecida por el backend
      // Establecemos una cookie de bandera (flag) que JS SÍ pueda leer para protección del cliente
      document.cookie = 'is_logged_in=true; path=/; max-age=28800; samesite=lax';
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const data = await res.json();
        let errorMsg = data.message || 'Error al registrarse';
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg[0];
        }
        throw new Error(errorMsg);
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // 1. Cerramos sesión en el backend (NestJS)
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // 2. Cerramos sesión en el frontend (Next.js) para asegurar que la cookie se borre de este lado
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    } finally {
      // Limpiamos la bandera pública
      document.cookie = 'is_logged_in=; path=/; max-age=0; samesite=lax';
      setIsLoading(false);
      // Forzamos un reemplace en la historia para no dejar rastro
      window.location.replace('/login');
    }
  };

  return { login, register: registerUser, logout, isLoading, error };
};
