'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useSidebar } from '@/context/SidebarContext';
import { SidebarHeader } from './SidebarHeader';
import { UserProfileCard } from './UserProfileCard';
import { NavLinks } from './NavLinks';
import { LogoutButton } from './LogoutButton';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

export const SidebarContainer: React.FC = () => {
  const { user, loading } = useUser();
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop collapse if needed, but requirements say fixed.

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDocente = user?.rol === 'Docente';
  const isAlumno = user?.rol === 'Alumno' || user?.rol === 'Scrum Master';

  const navItems = [
    {
      label: 'Inicio',
      href: '/dashboard',
      icon: 'solar:home-2-bold-duotone',
      visible: true,
    },
    {
      label: 'Proyectos',
      href: isDocente ? '/dashboard/proyectos' : '/dashboard/mis-proyectos',
      icon: 'solar:folder-with-files-bold-duotone',
      visible: true,
    },
    {
      label: 'Equipos',
      href: '/dashboard/equipos', // Asumiendo esta ruta, si no existe la ajustamos
      icon: 'solar:users-group-two-rounded-bold-duotone',
      visible: true,
    },
    {
      label: 'Actividades',
      href: '/dashboard/actividades',
      icon: 'solar:clipboard-list-bold-duotone',
      visible: isAlumno,
    },
    {
      label: 'Estadísticas',
      href: '/dashboard/estadisticas', // Asumiendo esta ruta
      icon: 'solar:chart-square-bold-duotone',
      visible: isDocente,
    },
    {
      label: 'Alumnos',
      href: '/alumnos',
      icon: 'solar:user-id-bold-duotone',
      visible: isDocente,
    }
  ];

  const itemsToRender = isMounted
    ? navItems.filter((item) => item.visible)
    : navItems.filter((item) => item.href === '/dashboard');

  return (
    <>
      {/* Botón flotante para dispositivos móviles */}
      {/* Botón flotante para dispositivos móviles (solo si el sidebar está cerrado, o siempre visible) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          isIconOnly
          onPress={toggleSidebar}
          className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg border border-gray-200 dark:border-zinc-800"
        >
          <Icon icon={isOpen ? "solar:close-circle-bold-duotone" : "solar:hamburger-menu-linear"} className="w-6 h-6 text-sky-600" />
        </Button>
      </div>

      {/* Overlay para móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Barra Lateral Principal */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out overflow-hidden flex flex-col justify-between ${
          isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full w-72 overflow-hidden">
          <SidebarHeader />
          <UserProfileCard user={user} loading={!isMounted || loading} />
          <NavLinks navItems={itemsToRender} closeMobileMenu={closeSidebar} />
          <LogoutButton />
        </div>
      </aside>
    </>
  );
};
