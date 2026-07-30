"use client";

import { FaseInfo, FaseKey } from "../hooks/useDesignSprint";

interface DesignSprintTimelineProps {
  fases: FaseInfo[];
  faseActiva: FaseKey;
  onSelect: (key: FaseKey) => void;
}

const ESTILOS_ESTADO: Record<string, string> = {
  completada: "bg-green-100 text-green-700 border-green-300",
  en_progreso: "bg-blue-100 text-blue-700 border-blue-300",
  bloqueada: "bg-gray-100 text-gray-400 border-gray-200",
};

const ETIQUETA_ESTADO: Record<string, string> = {
  completada: "Completada",
  en_progreso: "En progreso",
  bloqueada: "Bloqueada",
};

export function DesignSprintTimeline({ fases, faseActiva, onSelect }: DesignSprintTimelineProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {fases.map((fase) => {
        const activa = fase.key === faseActiva;
        const bloqueada = fase.estado === "bloqueada";
        return (
          <button
            key={fase.key}
            disabled={bloqueada}
            onClick={() => onSelect(fase.key)}
            className={`flex-1 min-w-[130px] text-left border rounded-xl px-3 py-2 transition
              ${activa ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"}
              ${bloqueada ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
          >
            <p className="text-[11px] text-gray-400">{fase.dia}</p>
            <p className="text-sm font-semibold">{fase.nombre}</p>
            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border ${ESTILOS_ESTADO[fase.estado]}`}>
              {ETIQUETA_ESTADO[fase.estado]}
            </span>
          </button>
        );
      })}
    </div>
  );
}