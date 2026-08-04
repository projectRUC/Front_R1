import React from 'react';
import Link from 'next/link';

interface UserProfileCardProps {
  user: any;
  loading: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, loading }) => {
  if (loading) {
    return (
      <div className="p-4 m-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/50 shadow-inner flex-shrink-0 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-zinc-700 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-3/4" />
            <div className="h-2 bg-gray-300 dark:bg-zinc-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const userName = user?.nombre || 'Usuario Activo';
  const isNameLong = userName.length > 18;

  return (
    <Link
      href="/perfil"
      className="block p-4 mx-4 mt-2 mb-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/50 shadow-inner flex-shrink-0 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group"
      title="Ir a Ajustes de Perfil y Derechos ARCO"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0 uppercase group-hover:scale-105 transition-transform">
          {userName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p 
            className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
            title={isNameLong ? userName : undefined}
          >
            {userName}
          </p>

          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500 flex-shrink-0" />
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 truncate">
              {user?.rol || 'Conectado'} {user?.grupo ? `(${user.grupo})` : ''}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};
