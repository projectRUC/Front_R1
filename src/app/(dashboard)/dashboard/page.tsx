'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { Loader } from '@/components/Loader';

export default function DashboardPage() {
  const { user, loading } = useUser();

  if (loading) {
    return <Loader message="Verificando perfil y privilegios de acceso..." />;
  }

  const isDocente = user?.rol === 'Docente';
  const isAlumno = user?.rol === 'Alumno' || user?.rol === 'Scrum Master';

  const cardsAlumno = [
    {
      title: 'Proyectos y Equipos',
      desc: 'Consulta las tarjetas de tus proyectos activos y la estructura oficial de tus equipos de trabajo con sus respectivos roles.',
      href: '/dashboard/proyectos-equipos',
      gradient: 'from-indigo-600 to-purple-600',
      bgHover: 'hover:shadow-indigo-500/30',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Actividades del Proyecto',
      desc: 'Supervisa el estatus de las tareas y actividades asignadas a tus equipos sin sobrecarga de datos, directo del backlog oficial.',
      href: '/dashboard/actividades',
      gradient: 'from-purple-600 to-pink-600',
      bgHover: 'hover:shadow-purple-500/30',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const cardsDocente = [
    {
      title: 'Supervisión de Proyectos',
      desc: 'Vista general sintetizada de todos los proyectos en curso del sistema escolar con sus periodos y equipos correspondientes.',
      href: '/dashboard/proyectos',
      gradient: 'from-blue-600 to-cyan-600',
      bgHover: 'hover:shadow-blue-500/30',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'Directorio de Alumnos',
      desc: 'Acceso completo al directorio del alumnado con información detallada de equipos en los que participan, rol que desempeñan y su grupo.',
      href: '/dashboard/alumnos',
      gradient: 'from-emerald-600 to-teal-600',
      bgHover: 'hover:shadow-emerald-500/30',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const cardsToRender = isDocente ? cardsDocente : cardsAlumno;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Sección de Bienvenida con Estilo Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8 lg:p-12 shadow-2xl border border-zinc-700/50"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <span>Sesión Activa</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Hola, {user?.nombre || 'Bienvenido'}
          </h1>
          <p className="text-gray-300 text-sm lg:text-base leading-relaxed font-normal">
            Estás explorando el <span className="font-semibold text-indigo-400">Sistema PAEC</span> bajo el perfil de{' '}
            <span className="inline-block font-bold text-pink-400 border-b border-pink-400/30">{user?.rol}</span>
            {user?.grupo ? ` perteneciente al grupo ${user.grupo}` : ''}. Hemos preparado para ti una navegación acelerada por rol.
          </p>
        </div>
      </motion.div>

      {/* Rejilla de Tarjetas de Acceso por Rol */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Módulos de tu Rol ({user?.rol})
          </h2>
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 bg-gray-200 dark:bg-zinc-800 px-3 py-1 rounded-full">
            BFF Optimized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cardsToRender.map((card, idx) => (
            <Link key={card.title} href={card.href} className="group outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, translateY: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative h-full overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-6 shadow-md transition-all duration-300 ${card.bgHover} hover:border-indigo-500/50 flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Acceder ahora</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
