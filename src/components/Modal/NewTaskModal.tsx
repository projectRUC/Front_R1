import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { kanbanService } from '@/services/kanban.service';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
}

export function NewTaskModal({ isOpen, onClose, onSubmit }: NewTaskModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [criterios, setCriterios] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateAI = async () => {
    if (!titulo || !descripcion) {
      alert("Por favor ingresa al menos un título y descripción para que la IA genere los criterios.");
      return;
    }

    try {
      setLoadingAI(true);
      const res = await kanbanService.generateCriteria(titulo, descripcion);
      if (res && res.criterios) {
        setCriterios(res.criterios);
      }
    } catch (error) {
      console.error("Error generando criterios con IA:", error);
      alert("Ocurrió un error al generar los criterios con IA.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ titulo, descripcion, criterios });
    onClose();
    // Limpiar form
    setTitulo('');
    setDescripcion('');
    setCriterios('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Nueva Actividad</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white"
                  placeholder="Ej. Diseño del Navbar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white resize-none"
                  rows={3}
                  placeholder="Detalles de lo que se debe hacer..."
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300">Criterios de Aceptación</label>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={loadingAI}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loadingAI ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Generando...
                      </>
                    ) : (
                      <>✨ Generar Criterios con IA</>
                    )}
                  </button>
                </div>
                <textarea
                  value={criterios}
                  onChange={(e) => setCriterios(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white font-mono text-sm resize-none"
                  rows={5}
                  placeholder="- [ ] Criterio 1..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md"
                >
                  Crear Actividad
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
