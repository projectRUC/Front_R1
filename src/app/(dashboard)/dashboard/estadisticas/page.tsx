import React from 'react';
import { DocenteDashboardView } from '@/modules/dashboard/components/DocenteDashboardView';
import { ScrumMasterDashboardView } from '@/modules/dashboard/components/ScrumMasterDashboardView';
import { PersonalDashboardView } from '@/modules/dashboard/components/PersonalDashboardView';

// Este componente sirve como enrutador basado en roles o simplemente puede mostrar la vista de Docente por ahora.
// Para propósitos de esta ruta que solicitaste, mostraremos el dashboard del docente.
export default function EstadisticasPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <DocenteDashboardView />
    </div>
  );
}
