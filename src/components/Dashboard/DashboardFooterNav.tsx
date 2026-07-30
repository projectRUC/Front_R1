'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';

export const DashboardFooterNav: React.FC = () => {
  const { user } = useUser();
  
  const isDocente = user?.rol === 'Docente';
  const isAlumno = user?.rol === 'Alumno' || user?.rol === 'Scrum Master';

  const links = [];
  
  if (isDocente) {
    links.push(
      { label: 'Proyectos', href: '/dashboard/proyectos', icon: 'solar:folder-with-files-bold-duotone', variant: 'primary' },
      { label: 'Equipos', href: '/dashboard/equipos', icon: 'solar:users-group-two-rounded-bold-duotone', variant: 'secondary' },
      { label: 'Estadísticas', href: '/dashboard/estadisticas', icon: 'solar:chart-square-bold-duotone', variant: 'tertiary' }
    );
  } else if (isAlumno) {
    links.push(
      { label: 'Proyectos', href: '/dashboard/mis-proyectos', icon: 'solar:folder-with-files-bold-duotone', variant: 'primary' },
      { label: 'Equipos', href: '/dashboard/equipos', icon: 'solar:users-group-two-rounded-bold-duotone', variant: 'secondary' },
      { label: 'Actividades', href: '/dashboard/actividades', icon: 'solar:clipboard-list-bold-duotone', variant: 'tertiary' }
    );
  }

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto border-t border-gray-200 dark:border-zinc-800 mt-10">
      <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Continúa navegando
      </h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {links.map((link, idx) => (
          <Link key={idx} href={link.href} className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant={link.variant as any}
                className="w-full sm:w-auto font-bold flex items-center gap-2"
              >
                <Icon icon={link.icon} className="w-5 h-5" />
                {link.label}
              </Button>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};
