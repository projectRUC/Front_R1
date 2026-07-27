'use client';

import { fetchApi } from '@/services/api';
import React, { useState } from 'react';

interface FeedbackBoxProps {
  designSprintId: string | number;
  userRol?: string;
  comentariosIniciales?: Array<{ id: string; comentario: string; fecha: string; docenteNombre?: string }>;
}

export const DocenteFeedbackBox: React.FC<FeedbackBoxProps> = ({
  designSprintId,
  userRol,
  comentariosIniciales = [],
}) => {
  const [comentarios, setComentarios] = useState(comentariosIniciales);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const isDocente = userRol === 'DOCENTE';

  const handleEnviarFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    try {
      setEnviando(true);
      const nuevo = await fetchApi<{ id: string; comentario: string; fecha: string }>(
        `/design-sprint/${designSprintId}/retroalimentacion`,
        {
          method: 'POST',
          body: JSON.stringify({ comentario: nuevoComentario }),
        }
      );

      setComentarios([...comentarios, nuevo]);
      setNuevoComentario('');
    } catch (err: any) {
      alert(err.message || 'Error al enviar retroalimentación.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        💬 Retroalimentación Docente
      </h3>

      {/* Lista de Comentarios */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {comentarios.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-zinc-400 italic">
            Sin retroalimentación registrada para esta etapa.
          </p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-gray-100 dark:border-zinc-700 text-sm">
              <p className="text-gray-800 dark:text-zinc-200">{c.comentario}</p>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {new Date(c.fecha).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Formulario exclusivo para Docentes */}
      {isDocente && (
        <form onSubmit={handleEnviarFeedback} className="pt-2 border-t border-gray-200 dark:border-zinc-800 space-y-3">
          <textarea
            required
            rows={3}
            placeholder="Escribe la retroalimentación para el equipo..."
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            className="w-full p-3 border rounded-2xl dark:bg-zinc-800 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={enviando}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Publicar Retroalimentación'}
          </button>
        </form>
      )}
    </div>
  );
};