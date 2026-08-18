import React from 'react';
import { KanbanBoardView } from '@/modules/kanban/components/KanbanBoardView';

export default function KanbanPage() {
  // Nota: equipoId se fijó en 1 estáticamente para la demostración visual, 
  // debes conectar esto a tu estado de equipo seleccionado.
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <KanbanBoardView equipoId={1} sprintId={1} />
    </div>
  );
}
