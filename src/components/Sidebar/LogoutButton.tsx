import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const LogoutButton: React.FC = () => {
  const { logout, isLoading } = useAuth();

  return (
    <div className="px-4 pb-6 mt-auto">
      <Button
        onPress={logout}
        isLoading={isLoading}
        variant="outline"
        className="w-full font-bold flex items-center justify-center gap-2 border-2 border-red-500 text-red-600 dark:text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl py-3 transition-colors"
      >
        {!isLoading && <Icon icon="material-symbols:logout" className="w-5 h-5" />}
        {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </Button>
    </div>
  );
};
