'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { dashboardService, AlumnoProyectosEquiposResponse } from '@/services/dashboard.service';
import { useUser } from '@/context/UserContext';
import { Loader } from '@/components/Loader';

export default function EquiposPage() {
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState<AlumnoProyectosEquiposResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAlumnoProyectosEquipos();
        setData(res);
      } catch (err: any) {
        console.error('Error al cargar equipos:', err);
        setError(err.message || 'No se pudieron recuperar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  if (loading) {
    return <Loader message="Recopilando información de Equipos..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Ha ocurrido un error</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  const equipos = data?.equipos || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Cabecera / Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/15 via-purple-900/15 to-pink-900/15 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 p-7 rounded-3xl border border-gray-200/60 dark:border-zinc-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
            Módulo Alumno / Scrum Master
          </span>
          <h1 className="text-2xl lg:text-3xl font-black mt-2.5 text-gray-900 dark:text-white">
            Mis Equipos
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Información de tus equipos de trabajo y compañeros.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {equipos.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800">
            <p className="text-gray-500 dark:text-zinc-500 font-medium">
              No tienes equipos asignados de momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {equipos.map((eq, i) => (
              <motion.div
                key={`${eq.id}-${i}`}
                whileHover={{ scale: 1.01 }}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-6 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {eq.nombreProyecto}
                      </span>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                        {eq.nombreEquipo}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                      {eq.grupo || 'Grupo'}
                    </span>
                  </div>

                  <p className="text-xs font-bold uppercase text-gray-400 dark:text-zinc-500 mb-3">
                    Miembros e Integrantes ({eq.miembros.length})
                  </p>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {eq.miembros.map((miem, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/80"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {miem.nombre ? miem.nombre.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {miem.nombre}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">
                              {miem.correo}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                            miem.rol === 'Scrum Master' || idx === 0
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50'
                          }`}
                        >
                          {miem.rol}
                        </span>
                      </div>
                    ))}
                  </div>

                  {eq.proyectoId && (
                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                      <button
                        onClick={() => router.push(`/dashboard/proyecto?proyectoId=${eq.proyectoId}&equipoId=${eq.id}`)}
                        className="px-5 py-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl transition-all flex items-center gap-2 shadow-md"
                      >
                        <span>🚀 Ir a Portal del Proyecto & Kanban</span>
                        <span>➔</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
