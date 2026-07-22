'use client';

import React, { useState } from 'react';
import { useDesignSprint } from './hooks/useDesignSprint';
import { DesignSprintTimeline } from './components/DesignSprintTimeline';
import { PhaseEvidenceForm } from './components/PhaseEvidenceForm';

export default function DesignSprintPage() {
  // ⚠️ CAMBIA ESTOS VALORES POR LOS REALES DE TU SISTEMA
  const [equipoId, setEquipoId] = useState(1);
  const [proyectoId, setProyectoId] = useState('66f0a1b2c3d4e5f6a7b8c9d0');

  const {
    phases,
    activePhase,
    evidence,
    isLoading,
    error,
    successMessage,
    setActivePhase,
    submitEvidence,
    clearMessages,
  } = useDesignSprint({ equipoId, proyectoId });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Design Sprint
          </h1>
          <p className="text-gray-600">
            Documenta las evidencias de cada fase del Design Sprint
          </p>

          {/* Info de conexión */}
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Equipo: {equipoId}
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full truncate max-w-[300px]">
              Proyecto: {proyectoId}
            </span>
            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
              error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                error ? 'bg-red-500' : 'bg-green-500'
              }`} />
              <span>{error ? 'Error de conexión' : 'Backend conectado'}</span>
            </span>
          </div>
        </div>

        {/* Timeline Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <DesignSprintTimeline
            phases={phases}
            activePhase={activePhase}
            onPhaseClick={setActivePhase}
          />
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 font-medium">{successMessage}</p>
            <button
              onClick={clearMessages}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={clearMessages}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mb-6 flex justify-center">
            <div className="flex items-center space-x-3 text-gray-600 bg-white px-6 py-3 rounded-lg shadow-sm">
              <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Procesando...</span>
            </div>
          </div>
        )}

        {/* Contenido de la fase activa */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <PhaseEvidenceForm
            fase={activePhase}
            evidence={evidence}
            isLoading={isLoading}
            onSubmit={submitEvidence}
          />
        </div>

        {/* Debug info (quitar en producción) */}
        <details className="mt-8 bg-gray-100 rounded-xl p-4">
          <summary className="cursor-pointer text-sm text-gray-600 font-medium">
            🔧 Debug Info
          </summary>
          <div className="mt-3 space-y-2 text-xs font-mono">
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</p>
            <p>Equipo ID: {equipoId}</p>
            <p>Proyecto ID: {proyectoId}</p>
            <p>Fase activa: {activePhase}</p>
            <p>Fases: {JSON.stringify(phases.map(p => ({ fase: p.fase, status: p.status })))}</p>
            <p>Evidencia cargada: {evidence ? 'Sí' : 'No'}</p>
          </div>
        </details>
      </div>
    </div>
  );
}