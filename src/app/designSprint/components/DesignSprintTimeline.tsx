"use client";

import { FaseInfo, FaseKey } from "../hooks/useDesignSprint";

interface DesignSprintTimelineProps {
  fases: FaseInfo[];
  faseActiva: FaseKey;
  onSelect: (key: FaseKey) => void;
}

const ESTILOS_ESTADO: Record<string, string> = {
  completada: "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800",
  en_progreso: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  bloqueada: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

const ETIQUETA_ESTADO: Record<string, string> = {
  completada: "Completada",
  en_progreso: "En progreso",
  bloqueada: "Disponible",
};

export function DesignSprintTimeline({ fases, faseActiva, onSelect }: DesignSprintTimelineProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {fases.map((fase) => {
        const activa = fase.key === faseActiva;
        
        return (
          <button
            key={fase.key}
            disabled={false}
            onClick={() => onSelect(fase.key)}
            className={`flex-1 min-w-[130px] text-left border rounded-xl px-3 py-2 transition ${
              activa 
                ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
                : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <p className="text-[11px] text-gray-400 dark:text-zinc-500">{fase.dia}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{fase.nombre}</p>
            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border ${ESTILOS_ESTADO[fase.estado] || ESTILOS_ESTADO.bloqueada}`}>
              {ETIQUETA_ESTADO[fase.estado] || "Disponible"}
            </span>
          </button>
        );
      })}
    </div>
  );
}