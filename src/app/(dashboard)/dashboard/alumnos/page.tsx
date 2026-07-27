'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardService, AlumnoCard } from '@/services/dashboard.service';
import { Loader } from '@/components/Loader';

export default function DocenteAlumnosPage() {
  const [alumnos, setAlumnos] = useState<AlumnoCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getDocenteAlumnos();
        setAlumnos(res || []);
      } catch (err: any) {
        console.error('Error al cargar alumnos para docente:', err);
        setError(err.message || 'No se pudo recuperar el directorio de alumnos.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlumnos();
  }, []);

  if (loading) {
    return <Loader message="Sincronizando directorio escolar del alumnado y sus equipos..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Error de carga</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  const filteredAlumnos = alumnos.filter(
    (alu) =>
      alu.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
      alu.correo.toLowerCase().includes(search.toLowerCase()) ||
      alu.grupo.toLowerCase().includes(search.toLowerCase()) ||
      alu.equipos.some((eq) => eq.nombreEquipo.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabecera / Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
            Directorio Estudiantil
          </span>
          <h1 className="text-2xl lg:text-3xl font-black mt-2 text-gray-900 dark:text-white">
            Alumnos del Sistema ({alumnos.length})
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Tarjetas detalladas del alumnado con información de contacto, rol académico y participación en equipos.
          </p>
        </div>

        {/* Buscador */}
        <div className="w-full md:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, grupo o equipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rejilla de Tarjetas de Alumnos */}
      {filteredAlumnos.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800">
          <p className="text-gray-500 dark:text-zinc-400 font-medium">
            No se encontraron alumnos coincidentes con tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumnos.map((alu, idx) => (
            <motion.div
              key={alu.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                      {alu.nombreCompleto ? alu.nombreCompleto.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                        {alu.nombreCompleto}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {alu.correo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges de rol y grupo */}
                <div className="flex items-center space-x-2 my-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                      alu.rol === 'Scrum Master'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {alu.rol}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                    {alu.grupo}
                  </span>
                </div>

                {/* Sección de Equipos en los que participa */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <p className="text-[11px] font-extrabold uppercase text-gray-400 dark:text-zinc-500 mb-2">
                    Equipos Asignados ({alu.equipos.length})
                  </p>
                  {alu.equipos.length === 0 ? (
                    <p className="text-xs italic text-gray-400 dark:text-zinc-600">
                      No inscrito en equipos actualmente.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {alu.equipos.map((eq, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-gray-800 dark:text-zinc-200 truncate max-w-[150px]">
                            {eq.nombreEquipo}
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                            {eq.rol}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
