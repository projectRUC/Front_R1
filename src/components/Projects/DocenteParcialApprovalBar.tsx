import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SprintPeriodo, dashboardService } from '@/services/dashboard.service';

type ApprovalStatus = 'En Revisión' | 'Aprobada';

interface DocenteParcialApprovalBarProps {
  equipoId: number;
  parciales: SprintPeriodo[];
  onApproveSuccess: () => void;
}

export function DocenteParcialApprovalBar({
  equipoId,
  parciales,
  onApproveSuccess,
}: DocenteParcialApprovalBarProps) {
  const [selectedNumParcial, setSelectedNumParcial] = useState<number>(1);
  const [comentarios, setComentarios] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Derivar el estado del parcial seleccionado
  const selectedParcial = parciales?.find(p => p.num_parcial === selectedNumParcial);
  const status: ApprovalStatus = selectedParcial?.aprobado ? 'Aprobada' : 'En Revisión';

  useEffect(() => {
    // Al cambiar de parcial, restaurar los comentarios del parcial si los hay,
    // o vaciar la caja si no los hay.
    if (selectedParcial && selectedParcial.comentariosDocente) {
      setComentarios(selectedParcial.comentariosDocente);
    } else {
      setComentarios('');
    }
  }, [selectedNumParcial, selectedParcial]);

  const handleApprove = async () => {
    if (!selectedParcial) return;
    setIsApproving(true);
    try {
      await dashboardService.aprobarParcial(equipoId, selectedNumParcial, {
        comentarios,
      });
      onApproveSuccess();
    } catch (error: any) {
      alert(error.message || 'Ocurrió un error al aprobar el parcial.');
    } finally {
      setIsApproving(false);
    }
  };

  if (!parciales || parciales.length === 0) {
    return null; // Si no hay parciales generados, no mostramos la barra
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900/50 rounded-3xl p-6 shadow-lg shadow-purple-500/5 mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        
        {/* Lado Izquierdo: Selector y Estado */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-2 rounded-xl">
                🎓
              </span>
              Revisión Docente
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Selecciona el parcial a evaluar y aprueba la planeación del equipo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedNumParcial}
              onChange={(e) => setSelectedNumParcial(Number(e.target.value))}
              className="px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              {parciales.map((p) => (
                <option key={p.num_parcial} value={p.num_parcial}>
                  Parcial {p.num_parcial}
                </option>
              ))}
            </select>

            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide flex items-center gap-2 transition-colors ${
                status === 'Aprobada'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
              }`}
            >
              {status === 'Aprobada' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Planeación Aprobada
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Planeación en Revisión
                </>
              )}
            </div>
          </div>
          
          {selectedParcial?.fechaAprobacion && (
             <p className="text-[11px] text-gray-500 font-medium">
               Aprobado el: {new Date(selectedParcial.fechaAprobacion).toLocaleDateString('es-MX')}
             </p>
          )}
        </div>

        {/* Lado Derecho: Comentarios y Botón */}
        <div className="flex-1 w-full max-w-md space-y-3">
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            disabled={status === 'Aprobada'}
            placeholder="Añade comentarios o retroalimentación general sobre este parcial..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              onClick={handleApprove}
              disabled={status === 'Aprobada' || isApproving}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                status === 'Aprobada'
                  ? 'bg-gray-400 dark:bg-zinc-700 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 shadow-purple-500/30'
              } flex items-center gap-2`}
            >
              {isApproving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Aprobando...
                </>
              ) : status === 'Aprobada' ? (
                '✓ Aprobado'
              ) : (
                'Aprobar Planeación'
              )}
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
