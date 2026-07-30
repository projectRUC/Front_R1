import React from 'react';

export const SidebarHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 pb-4 flex-shrink-0 text-center gap-3">
      <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div className="overflow-hidden">
        <span className="text-xl font-black bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 bg-clip-text text-transparent block truncate">
          Sistema PAEC
        </span>
        <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
          Gestión de proyectos
        </p>
      </div>
    </div>
  );
};
