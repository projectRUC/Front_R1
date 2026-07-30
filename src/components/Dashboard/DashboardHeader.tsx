'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { useUser } from '@/context/UserContext';
import { useSidebar } from '@/context/SidebarContext';

export const DashboardHeader: React.FC = () => {
  const { user } = useUser();
  const { toggleSidebar } = useSidebar();
  
  const rawRol = user?.rol || '';
  // Pluralizar el rol
  const pluralRol = rawRol.endsWith('s') || rawRol === '' ? rawRol : `${rawRol}s`;

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
          <Icon icon="solar:hamburger-menu-linear" className="w-6 h-6 text-gray-500" />
        </button>
        <span className="text-xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Sistema PAEC
        </span>
      </div>
      <div className="text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
        Portal {pluralRol}
      </div>
    </div>
  );
};
