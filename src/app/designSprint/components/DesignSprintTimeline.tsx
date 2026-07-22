'use client';

import React from 'react';
import { FaseDesignSprint, FASE_INFO } from '@/types/designSprint';

interface PhaseUIState {
  fase: FaseDesignSprint;
  status: 'completed' | 'pending' | 'blocked';
  hasEvidence: boolean;
}

interface DesignSprintTimelineProps {
  phases: PhaseUIState[];
  activePhase: FaseDesignSprint;
  onPhaseClick: (phase: FaseDesignSprint) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { style: string; label: string }> = {
    completed: { style: 'bg-green-100 text-green-800 border-green-300', label: 'Completado' },
    pending: { style: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pendiente' },
    blocked: { style: 'bg-red-100 text-red-800 border-red-300', label: 'Bloqueado' },
  };

  const { style, label } = config[status] || config.pending;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${style}`}>
      {label}
    </span>
  );
};

export const DesignSprintTimeline: React.FC<DesignSprintTimelineProps> = ({
  phases,
  activePhase,
  onPhaseClick,
}) => {
  if (!phases || phases.length === 0) {
    return <div className="text-center text-gray-500 py-4">Cargando fases...</div>;
  }

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
          
          {phases.map((phase) => {
            const info = FASE_INFO[phase.fase];
            if (!info) return null;
            
            return (
              <button
                key={phase.fase}
                onClick={() => onPhaseClick(phase.fase)}
                disabled={phase.status === 'blocked'}
                className={`
                  relative z-10 flex flex-col items-center space-y-2 p-3 rounded-lg
                  transition-all duration-200 min-w-[120px]
                  ${activePhase === phase.fase ? 'bg-blue-50 scale-105 shadow-sm' : 'hover:bg-gray-50'}
                  ${phase.status === 'blocked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                  ${activePhase === phase.fase
                    ? 'bg-blue-500 text-white'
                    : phase.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {info.day}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold capitalize">{info.title}</p>
                  <p className="text-xs text-gray-500">{info.dayName}</p>
                </div>
                <StatusBadge status={phase.status} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {phases.map((phase) => {
          const info = FASE_INFO[phase.fase];
          if (!info) return null;
          
          return (
            <button
              key={phase.fase}
              onClick={() => onPhaseClick(phase.fase)}
              disabled={phase.status === 'blocked'}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-lg border
                transition-all duration-200
                ${activePhase === phase.fase ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
                ${phase.status === 'blocked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0
                ${activePhase === phase.fase
                  ? 'bg-blue-500 text-white'
                  : phase.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {info.day}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold capitalize">{info.title}</p>
                <p className="text-xs text-gray-500">{info.dayName}</p>
              </div>
              <StatusBadge status={phase.status} />
            </button>
          );
        })}
      </div>
    </div>
  );
};