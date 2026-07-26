'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardService, ProyectoCard } from '@/services/dashboard.service';
import { Loader } from '@/components/Loader';

export default function DocenteProyectosPage() {
  const [proyectos, setProyectos] = useState<ProyectoCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getDocenteProyectos();
        setProyectos(res || []);
      } catch (err: any) {
        console.error('Error al cargar proyectos del docente:', err);
        setError(err.message || 'No se pudieron recuperar los proyectos.');
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  if (loading) {
    return <Loader message="Recopilando tarjetas de Proyectos de todos los grupos escolares..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Error en supervisión de proyectos</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Por definir';
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredProyectos = proyectos.filter(
    (p) =>
      p.nombreProyecto.toLowerCase().includes(search.toLowerCase()) ||
      p.nombreEquipo.toLowerCase().includes(search.toLowerCase()) ||
      (p.grupo && p.grupo.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabecera / Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/10 via-cyan-900/10 to-teal-900/10 dark:from-zinc-900 dark:to-zinc-900 p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
            Módulo Docente
          </span>
          <h1 className="text-2xl lg:text-3xl font-black mt-2 text-gray-900 dark:text-white">
            Supervisión de Proyectos ({proyectos.length})
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Revisión integral de proyectos estudiantiles de toda la institución, equipos asignados y fechas oficiales.
          </p>
        </div>

        {/* Buscador Rápido */}
        <div className="w-full md:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar proyecto o equipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rejilla de Tarjetas de Proyectos */}
      {filteredProyectos.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800">
          <p className="text-gray-500 dark:text-zinc-400 font-medium">
            No se encontraron proyectos bajo el criterio de búsqueda actual.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProyectos.map((proy, idx) => (
            <motion.div
              key={`${proy.id}-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, translateY: -4 }}
              className="group rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-6 shadow-md hover:shadow-xl hover:border-blue-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {proy.grupo || 'General'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs text-gray-400 font-medium">Docente Access</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {proy.nombreProyecto}
                </h3>

                <div className="mt-4 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-xs">
                    TEAM
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-zinc-500">Equipo a cargo</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-zinc-200 truncate">
                      {proy.nombreEquipo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">Inicio</span>
                  <span className="font-extrabold text-gray-700 dark:text-zinc-300">{formatDate(proy.fechaInicio)}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">Cierre</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatDate(proy.fechaFin)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
