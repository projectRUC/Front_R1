'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { dashboardService, AlumnoProyectosEquiposResponse } from '@/services/dashboard.service';
import { useUser } from '@/context/UserContext';
import { Loader } from '@/components/Loader';

export default function ProyectosEquiposPage() {
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState<AlumnoProyectosEquiposResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'proyectos' | 'equipos'>('proyectos');

  // Estado del modal de creación
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombreProyecto: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    nombreEquipo: '',
  });

  const isAlumno = user?.rol === 'Alumno' || user?.rol === 'Scrum Master';

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAlumnoProyectosEquipos();
        setData(res);
      } catch (err: any) {
        console.error('Error al cargar proyectos y equipos:', err);
        setError(err.message || 'No se pudieron recuperar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  const handleCrearProyectoEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setCreateError(null);
      const res = await dashboardService.crearProyectoEquipo(formData);
      setIsModalOpen(false);
      // Redirigir de inmediato a la nueva página de proyecto pasando id del proyecto y id del equipo
      router.push(`/dashboard/proyecto?proyectoId=${res.proyectoId}&equipoId=${res.equipoId}`);
    } catch (err: any) {
      console.error('Error en creación:', err);
      setCreateError(err.message || 'Ocurrió un problema al intentar crear el proyecto y su equipo.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <Loader message="Sintetizando información optimizada de Proyectos y Equipos..." />;
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

  const proyectos = data?.proyectos || [];
  const equipos = data?.equipos || [];

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Cabecera / Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/15 via-purple-900/15 to-pink-900/15 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 p-7 rounded-3xl border border-gray-200/60 dark:border-zinc-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
            Módulo Alumno / Scrum Master
          </span>
          <h1 className="text-2xl lg:text-3xl font-black mt-2.5 text-gray-900 dark:text-white">
            Mis Proyectos y Equipos
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Información esencial sincronizada de tus asignaciones grupales y fechas de entrega.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Botón exclusivo para crear Proyecto y Equipo (sólo Alumnos) */}
          {isAlumno && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Proyecto y Equipo
            </motion.button>
          )}

          {/* Selector de Pestañas (Proyectos vs Equipos) */}
          <div className="flex p-1.5 bg-gray-200 dark:bg-zinc-800/80 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('proyectos')}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-xs ${
                activeTab === 'proyectos'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Proyectos ({proyectos.length})
            </button>
            <button
              onClick={() => setActiveTab('equipos')}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-xs ${
                activeTab === 'equipos'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Equipos ({equipos.length})
            </button>
          </div>
        </div>
      </div>

      {/* Pestaña: Tarjetas de Proyectos */}
      {activeTab === 'proyectos' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {proyectos.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800">
              <p className="text-gray-500 dark:text-zinc-500 font-medium">
                No te encuentras inscrito en ningún proyecto activo en este momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proyectos.map((proy, i) => (
                <motion.div
                  key={`${proy.id}-${i}`}
                  whileHover={{ scale: 1.02, translateY: -3 }}
                  onClick={() => {
                    if (proy.equipoId) {
                      router.push(`/dashboard/proyecto?proyectoId=${proy.id}&equipoId=${proy.equipoId}`);
                    } else {
                      alert('Falta asociar este proyecto a un equipo con identificador válido en el servidor.');
                    }
                  }}
                  className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-6 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {proy.grupo || 'Grupo Escolar'}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Proyecto Activo" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                      {proy.nombreProyecto}
                    </h3>
                    <div className="mt-4 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                        EQ
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-bold">Equipo asignado</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 truncate">
                          {proy.nombreEquipo}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fechas y Acción de Salida */}
                  <div>
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 dark:text-zinc-500 font-semibold block">Fecha Inicio</span>
                        <span className="font-bold text-gray-700 dark:text-zinc-300">{formatDate(proy.fechaInicio)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 dark:text-zinc-500 font-semibold block">Fecha Fin</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatDate(proy.fechaFin)}</span>
                      </div>
                    </div>
                    <div className="mt-4 py-2.5 px-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 transition-all flex items-center justify-between text-xs font-black shadow-2xs">
                      <span>Ver Portal, Kanban & Tareas</span>
                      <span>➔</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Pestaña: Tarjetas de Equipos */}
      {activeTab === 'equipos' && (
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
      )}

      {/* Modal interactivo de Creación Híbrida */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl p-7 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    Crear Nuevo Proyecto
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Se creará en automático tu equipo contigo como líder
                  </p>
                </div>
              </div>

              {createError && (
                <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-300 font-medium">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCrearProyectoEquipo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Nombre del Proyecto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sistema Escolar PAEC 2026"
                    value={formData.nombreProyecto}
                    onChange={(e) => setFormData({ ...formData, nombreProyecto: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Nombre del Equipo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Equipo Alpha / Devs R1"
                    value={formData.nombreEquipo}
                    onChange={(e) => setFormData({ ...formData, nombreEquipo: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Descripción o Objetivo (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe de qué trata el proyecto y su alcance principal..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Fecha Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="w-full h-12 px-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Fecha Fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      className="w-full h-12 px-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {creating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generando...
                      </>
                    ) : (
                      'Registrar e Ir a Proyecto'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
