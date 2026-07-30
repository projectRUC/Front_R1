'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardService, UserProfile } from '../services/dashboard.service';

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  refetchUser: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getCurrentUser();
      setUser(data);
    } catch (err: any) {
      const errorMsg = err?.message || 'No autenticado o sesión expirada.';
      // Reducimos el ruido en consola reemplazando console.error por un aviso controlado
      console.warn('Verificación de sesión:', errorMsg);
      setError(errorMsg);
      setUser(null);
      // Opcionalmente redirigir al login si falla la autenticación en páginas privadas
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
