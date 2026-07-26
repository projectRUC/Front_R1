'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardService, ActividadCard } from '@/services/dashboard.service';
import { Loader } from '@/components/Loader';

export default function ActividadesPage() {
  const [actividades, setActividades] = useState<ActividadCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('TODAS');

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAlumnoActividades();
        setActividades(res || []);
      } catch (err: any) {
        console.error('Error al cargar actividades:', err);
        setError(err.message || 'No se pudieron recuperar las actividades.');
      } finally {
        setLoading(false);
      }
    };
    fetchActividades();
  }, []);

  if (loading) {
    return <Loader message="Optimizando y cargando tarjetas del Backlog de Actividades..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Error al consultar actividades</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('completa') || s.includes('hecha') || s.includes('termina')) {
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
    }
    if (s.includes('progreso') || s.includes('proceso') || s.includes('haciendo')) {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800';
    }
    return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800';
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Sin fecha definida';
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

  const filteredActividades = filter === 'TODAS'
    ? actividades
    : filter === 'MIS_ASIGNADAS'
    ? actividades.filter((a) => a.soyAsignado)
    : actividades.filter((a) => a.estatus.toUpperCase() === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabecera / Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
            Backlog & Tareas
          </span>
          <h1 className="text-2xl lg:text-3xl font-black mt-2 text-gray-900 dark:text-white">
            Actividades del Proyecto
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Revisa el estatus, fechas límite y asignaciones sin datos sobrecargados.
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('TODAS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filter === 'TODAS'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            Todas ({actividades.length})
          </button>
          <button
            onClick={() => setFilter('MIS_ASIGNADAS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              filter === 'MIS_ASIGNADAS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span>Mis Asignadas ({actividades.filter((a) => a.soyAsignado).length})</span>
          </button>
        </div>
      </div>

      {/* Rejilla de Actividades */}
      {filteredActividades.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800">
          <p className="text-gray-500 dark:text-zinc-400 font-medium">
            No se encontraron actividades de momento bajo el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActividades.map((act, i) => (
            <motion.div
              key={`${act.id}-${i}`}
              whileHover={{ scale: 1.02, translateY: -3 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(act.estatus)}`}>
                    {act.estatus || 'Pendiente'}
                  </span>
                  {act.soyAsignado && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-pink-500 text-white shadow-xs shadow-pink-500/50">
                      Tú participas
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                  {act.nombreProyecto}
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                  {act.nombreActividad}
                </h3>
              </div>

              {/* Fechas */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
                <div>
                  <span className="block font-semibold">Inicio: {formatDate(act.fechaInicio)}</span>
                </div>
                <div className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Entrega: {formatDate(act.fechaFin)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
