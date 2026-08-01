"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardContent, Spinner, Avatar, Chip } from "@heroui/react";
import { fetchApi } from "@/services/api";

const COLUMNS = {
  "sin empezar": "Sin Empezar",
  "Backlog": "Backlog",
  "En proceso": "En proceso",
  "Prueba": "En Revisión / Prueba",
  "Terminado": "Terminado",
};

interface SortableItemProps {
  id: string;
  item: any;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 p-3 mb-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab hover:ring-2 ring-primary/50 transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
          {item.nombre}
        </h4>
        <Chip size="sm" variant="flat" color={item.prioridad === 'Alta' ? 'danger' : item.prioridad === 'Media' ? 'warning' : 'default'}>
          {item.estimacion} SP
        </Chip>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex -space-x-2">
          {item.asignados && item.asignados.length > 0 ? (
            item.asignados.map((a: any, i: number) => (
              <Avatar key={i} size="sm" name={a.usu_nom} className="border-2 border-white dark:border-gray-800" />
            ))
          ) : (
            <span className="text-xs text-gray-400">Sin asignar</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const KanbanBoardView = ({ equipoId, sprintId = 1 }: { equipoId: number; sprintId?: number }) => {
  const [board, setBoard] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadKanban = async () => {
      if (!equipoId) return;
      try {
        setLoading(true);
        const res: any = await fetchApi(`/dashboard/kanban/${equipoId}?sprint=${sprintId}`);
        setBoard(res);
      } catch (err) {
        console.error("Error al cargar Kanban", err);
      } finally {
        setLoading(false);
      }
    };
    loadKanban();
  }, [equipoId, sprintId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encuentra los contenedores de origen y destino
    let activeContainer = Object.keys(board).find((key) =>
      board[key].some((item) => item.id === activeId)
    );
    let overContainer = Object.keys(board).find((key) =>
      board[key].some((item) => item.id === overId)
    );

    if (!overContainer && Object.keys(COLUMNS).includes(overId)) {
      overContainer = overId;
    }

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Reordenar en la misma columna
      const oldIndex = board[activeContainer].findIndex((i) => i.id === activeId);
      const newIndex = board[overContainer].findIndex((i) => i.id === overId);
      if (oldIndex !== newIndex) {
        setBoard((prev) => ({
          ...prev,
          [activeContainer!]: arrayMove(prev[activeContainer!], oldIndex, newIndex),
        }));
      }
    } else {
      // Mover entre columnas
      const activeItems = [...board[activeContainer]];
      const overItems = [...board[overContainer]];
      const activeIndex = activeItems.findIndex((i) => i.id === activeId);
      const [movedItem] = activeItems.splice(activeIndex, 1);
      
      overItems.push(movedItem); // Lo ponemos al final

      setBoard((prev) => ({
        ...prev,
        [activeContainer!]: activeItems,
        [overContainer!]: overItems,
      }));

      // Llamar al backend para persistir el estatus
      try {
        await fetchApi(`/dashboard/actividades/${activeId}/estatus`, {
          method: "PATCH",
          body: JSON.stringify({ estatus: overContainer }),
        });
      } catch (error) {
        console.error("Error al cambiar de estatus", error);
        // Podríamos hacer rollback del estado aquí en caso de error
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" label="Cargando Tablero Kanban..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 h-[calc(100vh-100px)]">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Tablero Kanban
        </h1>
        <p className="text-gray-500">
          Organiza y arrastra las tarjetas para cambiar su estado.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto h-full pb-4 items-start">
          {Object.entries(COLUMNS).map(([key, title]) => (
            <div key={key} id={key} className="flex flex-col w-80 shrink-0 bg-default-50 rounded-xl p-4 h-full">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                {title}
                <Chip size="sm" variant="flat">{board[key]?.length || 0}</Chip>
              </h3>
              <SortableContext
                id={key}
                items={(board[key] || []).map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 overflow-y-auto">
                  {(board[key] || []).map((item) => (
                    <SortableItem key={item.id} id={item.id} item={item} />
                  ))}
                  {/* Empty state zone for dropping */}
                  {!(board[key]?.length > 0) && (
                    <div className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      Arrastra una tarea aquí
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
};
