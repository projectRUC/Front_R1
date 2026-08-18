import React from 'react';
import { Card } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export const AboutSystem = React.forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} className="py-16 px-6 max-w-5xl mx-auto">
    <div className="flex items-center space-x-3 mb-6">
      <Icon icon="solar:info-circle-bold-duotone" className="w-8 h-8 text-sky-500" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sobre el sistema</h2>
    </div>
    <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm">
      <div className="p-6">
        <p className="text-gray-600 dark:text-zinc-300 leading-relaxed">
          El Sistema PAEC es una plataforma integral diseñada para la gestión de proyectos escolares, facilitando la colaboración entre alumnos y la supervisión por parte de los docentes. Su objetivo es centralizar las actividades, equipos y avances en un entorno ágil y estructurado.
        </p>
      </div>
    </Card>
  </div>
));
AboutSystem.displayName = 'AboutSystem';

export const SystemTools = React.forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} className="py-16 px-6 max-w-5xl mx-auto bg-gray-50/50 dark:bg-zinc-900/30 rounded-3xl">
    <div className="flex items-center space-x-3 mb-6">
      <Icon icon="solar:wrench-bold-duotone" className="w-8 h-8 text-indigo-500" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Herramientas del sistema</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {['Gestión de Backlog', 'Seguimiento Ágil', 'Métricas de Avance'].map((tool, idx) => (
        <Card key={idx} className="border border-gray-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
              <Icon icon="solar:star-fall-minimalistic-bold-duotone" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{tool}</h3>
          </div>
        </Card>
      ))}
    </div>
  </div>
));
SystemTools.displayName = 'SystemTools';

export const ScrumInfo = React.forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} className="py-16 px-6 max-w-5xl mx-auto">
    <div className="flex items-center space-x-3 mb-6">
      <Icon icon="solar:users-group-rounded-bold-duotone" className="w-8 h-8 text-blue-500" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Metodología Scrum</h2>
    </div>
    <Card className="border-l-4 border-l-blue-500 shadow-sm dark:bg-zinc-900">
      <div className="p-8">
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Trabajo en Sprints</h3>
        <p className="text-gray-600 dark:text-zinc-300 leading-relaxed mb-4">
          Scrum es un marco de trabajo ágil que permite a los equipos colaborar y lograr objetivos de alto impacto a través de ciclos cortos conocidos como Sprints. En el Sistema PAEC, cada proyecto se gestiona valorando la adaptabilidad y el progreso iterativo.
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-zinc-300 space-y-2 ml-2">
          <li>Definición clara de roles (Scrum Master, Product Owner, Developers)</li>
          <li>Reuniones diarias de sincronización (Daily Scrum)</li>
          <li>Planificación y revisión de Sprints</li>
        </ul>
      </div>
    </Card>
  </div>
));
ScrumInfo.displayName = 'ScrumInfo';

export const KanbanInfo = React.forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} className="py-16 px-6 max-w-5xl mx-auto">
    <div className="flex items-center space-x-3 mb-6">
      <Icon icon="solar:kanban-bold-duotone" className="w-8 h-8 text-purple-500" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tablero Kanban</h2>
    </div>
    <Card className="border-l-4 border-l-purple-500 shadow-sm dark:bg-zinc-900">
      <div className="p-8">
        <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4">Flujo de Trabajo Visual</h3>
        <p className="text-gray-600 dark:text-zinc-300 leading-relaxed mb-4">
          Kanban te permite visualizar el trabajo, limitar la acumulación de tareas y maximizar la eficiencia. Utiliza nuestro tablero Kanban para mover tus actividades desde "Por Hacer" hasta "Completado" de forma fluida.
        </p>
        <div className="flex justify-between items-center bg-gray-100 dark:bg-zinc-800 p-4 rounded-xl mt-4">
          <div className="text-center flex-1 font-semibold text-gray-500">To Do</div>
          <Icon icon="solar:alt-arrow-right-line-duotone" className="w-5 h-5 text-gray-400" />
          <div className="text-center flex-1 font-semibold text-sky-500">In Progress</div>
          <Icon icon="solar:alt-arrow-right-line-duotone" className="w-5 h-5 text-gray-400" />
          <div className="text-center flex-1 font-semibold text-emerald-500">Done</div>
        </div>
      </div>
    </Card>
  </div>
));
KanbanInfo.displayName = 'KanbanInfo';
