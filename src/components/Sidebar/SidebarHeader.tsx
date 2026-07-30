import React from 'react';
import Image from 'next/image';

export const SidebarHeader: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 p-6 pb-4 flex-shrink-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0 p-1 relative">
        <Image 
          src="/Images/logo.png" 
          alt="Logo PAEC" 
          width={40} 
          height={40} 
          className="object-contain w-full h-full"
        />
      </div>
      <div className="overflow-hidden">
        <span className="text-xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent block truncate">
          Sistema PAEC
        </span>
        <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
          Gestión de proyectos
        </p>
      </div>
    </div>
  );
};
