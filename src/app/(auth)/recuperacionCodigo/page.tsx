'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@heroui/react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';

// Ruta sugerida para este archivo: app/recupracion/codigo/page.tsx
// Segundo paso del flujo de recuperación: el usuario ingresa el código de
// 6 dígitos que se le envió por correo. El código expira a los 5 minutos.

const DURACION_SEGUNDOS = 5 * 60; // 5 minutos
import { Suspense } from 'react';

function VerificarCodigoContent() {
  const searchParams = useSearchParams();
  const correo = searchParams.get('correo') || 'tu correo electrónico';
  const router = useRouter();

  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isReenviando, setIsReenviando] = useState(false);
  const [error, setError] = useState('');
  const [segundosRestantes, setSegundosRestantes] = useState(DURACION_SEGUNDOS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const expirado = segundosRestantes <= 0;
  const codigoCompleto = digitos.every((d) => d !== '');

  useEffect(() => {
    const interval = setInterval(() => {
      setSegundosRestantes((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatearTiempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  const handleChangeDigito = (index: number, valor: string) => {
    const limpio = valor.replace(/\D/g, '').slice(-1);
    const nuevos = [...digitos];
    nuevos[index] = limpio;
    setDigitos(nuevos);

    if (limpio && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!texto) return;
    e.preventDefault();
    const nuevos = Array(6)
      .fill('')
      .map((_, i) => texto[i] || '');
    setDigitos(nuevos);
    inputsRef.current[Math.min(texto.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (expirado) {
      setError('El código expiró. Solicita uno nuevo.');
      return;
    }
    if (!codigoCompleto) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verificarCodigo({ correo, codigo: digitos.join('') });
      router.push(`/cambioPassword?correo=${encodeURIComponent(correo)}`);
    } catch {
      setError('Código incorrecto. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviar = async () => {
    setError('');
    setIsReenviando(true);
    try {
      await authService.solicitarRecuperacion(correo);
      setDigitos(Array(6).fill(''));
      setSegundosRestantes(DURACION_SEGUNDOS);
      inputsRef.current[0]?.focus();
    } catch {
      setError('No pudimos reenviar el código. Intenta de nuevo.');
    } finally {
      setIsReenviando(false);
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Verifica tu Correo
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
          Enviamos un código de 6 dígitos a <span className="font-semibold">{correo}</span>
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digitos.map((digito, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digito}
                disabled={expirado}
                onChange={(e) => handleChangeDigito(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 dark:text-white shadow-sm disabled:opacity-50"
              />
            ))}
          </div>

          <p
            className={`text-sm font-medium text-center ${
              expirado
                ? 'text-red-600 dark:text-red-400'
                : segundosRestantes <= 30
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {expirado
              ? 'Tu código ha expirado.'
              : `Código válido por ${formatearTiempo(segundosRestantes)}`}
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center shadow-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || expirado || !codigoCompleto}
            className="mt-2 w-full h-12 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100"
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
              'Verificar Código'
            )}
          </button>

          <button
            type="button"
            onClick={handleReenviar}
            disabled={!expirado || isReenviando}
            className="text-primary hover:text-primary-600 transition-colors font-bold underline decoration-primary/30 underline-offset-4 text-center disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
          >
            {isReenviando ? 'Reenviando...' : 'Reenviar código'}
          </button>

          <Link
            href="/recupracion"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-center"
          >
            Cambiar de correo
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerificarCodigoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Cargando...</div>}>
      <VerificarCodigoContent />
    </Suspense>
  );
}
