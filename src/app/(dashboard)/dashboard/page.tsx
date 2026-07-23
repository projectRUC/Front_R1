'use client';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@heroui/react';

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Control PAEC</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Cerrar Sesión
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 shadow-lg border-none bg-white dark:bg-zinc-900">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold text-gray-500">Bienvenido</p>
              <h4 className="font-bold text-large">Sistema Escolar</h4>
            </CardHeader>
            <CardContent className="overflow-visible py-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Has iniciado sesión correctamente. Pronto podrás ver tus materias, calificaciones y grupos aquí.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
