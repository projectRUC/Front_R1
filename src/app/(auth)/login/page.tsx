'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@heroui/react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const { login, reactivarYLogin, isLoading, error, isAccountPaused, setIsAccountPaused } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(correo, password);
    } catch {
      // Los errores y el estado isAccountPaused son manejados en el hook useAuth
    }
  };

  const handleReactivar = async () => {
    try {
      await reactivarYLogin(correo, password);
    } catch {
      // El error se muestra en el hook useAuth
    }
  };

  return (
    <>
      <Card className="w-full max-w-md p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xl border border-white/20">
        <CardHeader className="flex flex-col gap-2 items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Bienvenido</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ingresa al sistema escolar PAEC</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </label>
              <input
                required
                type="email"
                placeholder="tu@escuela.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-500 text-gray-900 dark:text-white shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-500 text-gray-900 dark:text-white shadow-sm"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center shadow-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full h-12 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Entrar al Sistema"
              )}
            </button>
          </form>
          <div className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            ¿Aún no eres parte de PAEC?{' '}
            <Link href="/register" className="text-primary hover:text-primary-600 transition-colors font-bold underline decoration-primary/30 underline-offset-4">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Reactivación de Cuenta (HeroUI / Glassmorphism) */}
      {isAccountPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-amber-500/30 transform transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Cuenta Desactivada
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Estado de cuenta pausado
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-zinc-300 mb-6">
              Tu cuenta se encuentra actualmente desactivada o pausada. ¿Deseas reactivarla ahora y recuperar tu acceso completo a la plataforma?
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsAccountPaused(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleReactivar}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Reactivar y Entrar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
