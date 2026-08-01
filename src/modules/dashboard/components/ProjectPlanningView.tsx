"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Spinner } from "@heroui/react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { fetchApi } from "@/services/api";

interface ProjectPlanningViewProps {
  equipoId: number;
}

export const ProjectPlanningView: React.FC<ProjectPlanningViewProps> = ({ equipoId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>(ViewMode.Day);

  useEffect(() => {
    const loadGantt = async () => {
      if (!equipoId) return;
      try {
        setLoading(true);
        const res: any = await fetchApi(`/dashboard/proyectos/${equipoId}/gantt`);
        
        // Formatear los datos de la API para gantt-task-react
        const formattedTasks: Task[] = res.map((t: any) => ({
          id: t.id,
          name: t.name,
          start: new Date(t.start),
          end: new Date(t.end),
          progress: t.progress,
          type: t.type,
          project: t.project,
          isDisabled: false, // Make it readonly or editable depending on role
          styles: { progressColor: '#006FEE', progressSelectedColor: '#005BC4' }
        }));
        
        if (formattedTasks.length === 0) {
          // Gantt requiere al menos una tarea, añadimos una dummy si está vacío
          formattedTasks.push({
            id: 'dummy',
            name: 'No hay actividades planificadas',
            start: new Date(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)),
            progress: 0,
            type: 'task',
            project: 'none',
            isDisabled: true
          });
        }
        
        setTasks(formattedTasks);
      } catch (err) {
        console.error("Error al cargar diagrama de Gantt", err);
      } finally {
        setLoading(false);
      }
    };
    loadGantt();
  }, [equipoId]);

  let columnWidth = 60;
  if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" label="Cargando Planeación del Proyecto..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Planeación del Proyecto
          </h1>
          <p className="text-gray-500">
            Diagrama de Gantt con el desglose temporal de actividades.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            className="w-40 h-9 px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={view}
            onChange={(e) => setView(e.target.value as ViewMode)}
          >
            <option value={ViewMode.Day}>Día</option>
            <option value={ViewMode.Week}>Semana</option>
            <option value={ViewMode.Month}>Mes</option>
          </select>
        </div>
      </div>

      <Card className="shadow-sm border border-default-200">
        <CardContent className="p-0 overflow-x-auto">
          {tasks.length > 0 && (
            <div className="min-w-[800px]">
              <Gantt
                tasks={tasks}
                viewMode={view}
                columnWidth={columnWidth}
                listCellWidth="200px"
                ganttHeight={400}
                barBackgroundColor="#e4e4e7"
                barFill={60}
                barCornerRadius={6}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
