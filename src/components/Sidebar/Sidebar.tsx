'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { SidebarHeader } from './SidebarHeader';

export const Sidebar: React.FC = () => {
  const { user, loading } = useUser();
  const { logout } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Evita desajustes de hidratación (SSR vs Client) garantizando que el DOM dinámico
  // y basado en sesión de usuario solo transaccione tras el montaje inicial.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDocente = user?.rol === 'Docente';
  const isAlumno = user?.rol === 'Alumno' || user?.rol === 'Scrum Master';

  const navItems = [
    {
      label: 'Panel Principal',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      visible: true,
    },
    // Enlaces de Alumno / Scrum Master
    {
      label: 'Mis Proyectos',
      href: '/dashboard/mis-proyectos',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      visible: isAlumno,
    },
    {
      label: 'Mis Equipos',
      href: '/dashboard/equipos',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      visible: isAlumno,
    },
    {
      label: 'Actividades',
      href: '/dashboard/actividades',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      visible: isAlumno,
    },
    // Enlaces de Docente
    {
      label: 'Proyectos',
      href: '/dashboard/proyectos',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      visible: isDocente,
    },
    {
      label: 'Alumnos',
      href: '/dashboard/alumnos',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      visible: isDocente,
    },
  ];

  // Durante la hidratación en SSR se renderiza solo el ítem predeterminado invariable para paridad DOM
  const itemsToRender = isMounted
    ? navItems.filter((item) => item.visible)
    : navItems.filter((item) => item.href === '/dashboard');

  return (
    <>
      {/* Botón flotante para dispositivos móviles */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-zinc-900 text-white rounded-xl shadow-lg border border-zinc-700 hover:bg-zinc-800 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Barra Lateral Principal */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-72 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-r border-gray-200 dark:border-zinc-800 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cabecera y Menú */}
        <div className="overflow-y-auto">
          <SidebarHeader />
          <nav className="mt-4 space-y-2 px-6 pb-6">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-3">
              Menú Principal {user?.rol ? `(${user.rol})` : ''}
            </p>
            {itemsToRender.map((item) => {
              // Verificación precisa para evitar resaltar Panel Principal en subrutas
              const isActive = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="relative block"
                >
                  <div
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 transform hover:translate-x-1 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm border border-indigo-200 dark:border-indigo-800/50'
                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-indigo-500 rounded-r-full shadow-sm shadow-indigo-500/50" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sección del Perfil de Usuario en el Footer del Sidebar */}
        <div className="p-4 m-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/50 shadow-inner flex-shrink-0">
          {!isMounted || loading ? (
            <div className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-zinc-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-2 bg-gray-300 dark:bg-zinc-700 rounded w-1/2" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {user?.nombre || 'Usuario Activo'}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500 flex-shrink-0" />
                    <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 truncate">
                      {user?.rol || 'Conectado'} {user?.grupo ? `(${user.grupo})` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={logout}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 text-xs font-bold transition-all shadow-xs hover:shadow-sm focus:outline-none"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
