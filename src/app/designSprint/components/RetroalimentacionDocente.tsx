"use client";

import { useState, useEffect } from "react";

interface RetroalimentacionDocenteProps {
  faseNombre: string;
  comentarioActual?: string;
  onGuardarComentario: (comentario: string) => Promise<void>;
}

export function RetroalimentacionDocente({
  faseNombre,
  comentarioActual = "",
  onGuardarComentario,
}: RetroalimentacionDocenteProps) {
  const [comentario, setComentario] = useState(comentarioActual);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  // Sincronizar el estado si el comentario proviene del backend/padre
  useEffect(() => {
    if (comentarioActual) {
      setComentario(comentarioActual);
    }
  }, [comentarioActual]);

  // Se considera registrado si ya vino un comentario previo o si acaba de guardarse con éxito
  const yaRegistrado = Boolean(comentarioActual.trim()) || mensajeExito;

  const handleGuardar = async () => {
    if (!comentario.trim() || yaRegistrado) return;
    setGuardando(true);
    try {
      await onGuardarComentario(comentario);
      setMensajeExito(true);
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mt-6 p-4 border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
          ✏️ Retroalimentación de Docente — Fase {faseNombre}
        </h4>
        {yaRegistrado && (
          <span className="text-xs text-green-700 dark:text-green-400 font-semibold">
            ✓ Guardado
          </span>
        )}
      </div>

      <textarea
        rows={3}
        disabled={yaRegistrado || guardando}
        placeholder={
          yaRegistrado
            ? "Retroalimentación registrada."
            : `Escribe aquí la retroalimentación para la fase ${faseNombre}...`
        }
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full text-xs p-2.5 border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-amber-100/50 disabled:text-gray-600 disabled:cursor-not-allowed dark:bg-zinc-900 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-400 dark:border-zinc-700"
      />

      {!yaRegistrado && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={guardando || !comentario.trim()}
            onClick={handleGuardar}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {guardando ? "Guardando..." : "Guardar Retroalimentación"}
          </button>
        </div>
      )}
    </div>
  );
}