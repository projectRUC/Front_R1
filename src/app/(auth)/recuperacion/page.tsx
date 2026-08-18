'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service'; // ajusta la ruta a donde tengas authService

// Ruta sugerida para este archivo: app/recupracion/page.tsx
// Paso 1 del flujo: pide el correo, dispara la recuperación en el backend
// y navega a la pantalla de verificación del código.

export default function RecuperacionPage() {
  const [correo, setCorreo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validarCorreo = (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validarCorreo(correo)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.solicitarRecuperacion(correo);
      router.push(`/recuperacionCodigo?correo=${encodeURIComponent(correo)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos procesar tu solicitud. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xl border border-white/20">
      <CardHeader className="flex flex-col gap-2 items-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-2">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Recuperar Contraseña
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
          Ingresa tu correo para continuar con la recuperación
        </p>
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
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Enviar Instrucciones'
            )}
          </button>

          <Link
            href="/login"
            className="text-primary hover:text-primary-600 transition-colors font-bold underline decoration-primary/30 underline-offset-4 flex items-center justify-center"
          >
            Volver al inicio de sesión
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}