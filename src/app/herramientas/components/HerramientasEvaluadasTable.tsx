'use client';

import { fetchApi } from '@/services/api';
import React, { useState, useEffect } from 'react';

export interface Herramienta {
  id?: string;
  proyecto_id: number;
  nombre_herra: string;
  descripcion: string;
  uso: string;
  url_herramienta?: string;
  estatus?: string;
  evaluacion_o_motivo?: string;
}

interface HerramientasTableProps {
  proyectoId: string | number;
  userRol?: string;
}

export const HerramientasEvaluadasTable: React.FC<HerramientasTableProps> = ({ proyectoId, userRol }) => {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // 🔹 Cambio: estatus inicial válido para el enum 'Pendiente'
  const [formData, setFormData] = useState<Partial<Herramienta>>({
    nombre_herra: '',
    descripcion: '',
    uso: '',
    url_herramienta: '',
    estatus: 'Pendiente', // ✅ Valor válido del enum
    evaluacion_o_motivo: '',
  });

  const fetchHerramientas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi<Herramienta[]>(`/herramientas/proyecto/${proyectoId}`);
      setHerramientas(data || []);
    } catch (err: any) {
      console.error('Error al obtener herramientas:', err);
      setError(err.message || 'Error al cargar herramientas. El backend podría no soportar ID numérico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proyectoId) fetchHerramientas();
  }, [proyectoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (herramientas.length >= 5) {
      alert('Solo se permite un máximo de 5 herramientas evaluadas.');
      return;
    }

    try {
      await fetchApi('/herramientas', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          proyecto_id: String(proyectoId), // ✅ Enviar como string (el DTO lo espera así)
        }),
      });
      setShowModal(false);
      setFormData({
        nombre_herra: '',
        descripcion: '',
        uso: '',
        url_herramienta: '',
        estatus: 'Pendiente', // ✅ Restablecer con valor válido
        evaluacion_o_motivo: '',
      });
      fetchHerramientas();
    } catch (err: any) {
      alert(err.message || 'Error al guardar la herramienta.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Evaluación de Herramientas ({herramientas.length}/5)
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Comparativa de herramientas evaluadas para la solución tecnológica.
          </p>
        </div>

        {herramientas.length < 5 && userRol !== 'DOCENTE' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
          >
            + Agregar Herramienta
          </button>
        )}
      </div>

      {/* Tabla Comparativa */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <table className="w-full text-sm text-left text-gray-600 dark:text-zinc-300">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 border-b border-gray-200 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Herramienta</th>
              <th className="px-4 py-3">Descripción / Ventajas</th>
              <th className="px-4 py-3">Uso Destinado</th>
              <th className="px-4 py-3">Enlace</th>
              <th className="px-4 py-3">Evaluación / Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">Cargando herramientas...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-red-500">
                  {error}
                </td>
              </tr>
            ) : herramientas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No se han registrado herramientas aún.
                </td>
              </tr>
            ) : (
              herramientas.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                    {item.nombre_herra}
                  </td>
                  <td className="px-4 py-3">{item.descripcion}</td>
                  <td className="px-4 py-3">{item.uso}</td>
                  <td className="px-4 py-3">
                    {item.url_herramienta ? (
                      <a
                        href={item.url_herramienta}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Ver enlace ↗
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">{item.evaluacion_o_motivo || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Registrar Herramienta */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Registrar Herramienta ({herramientas.length + 1}/5)
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">Nombre</label>
                <input
                  required
                  type="text"
                  value={formData.nombre_herra}
                  onChange={(e) => setFormData({ ...formData, nombre_herra: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">Descripción / Ventajas</label>
                <textarea
                  required
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">Uso Destinado</label>
                <input
                  required
                  type="text"
                  value={formData.uso}
                  onChange={(e) => setFormData({ ...formData, uso: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">URL (Opcional)</label>
                <input
                  type="url"
                  value={formData.url_herramienta}
                  onChange={(e) => setFormData({ ...formData, url_herramienta: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">Evaluación o Motivo</label>
                <input
                  type="text"
                  value={formData.evaluacion_o_motivo}
                  onChange={(e) => setFormData({ ...formData, evaluacion_o_motivo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 rounded-xl text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};