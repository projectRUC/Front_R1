"use client";

import { FileEntity } from "@/types/designSprint";
import { FilesService } from "../services/filesApi";

interface EvidenceCardProps {
  titulo: string;
  archivosGuardados: FileEntity[];
  previasLocales?: string[];
  onRemoveLocal?: (index: number) => void; // 👈 Callback para eliminar por índice
}

export function EvidenceCard({
  titulo,
  archivosGuardados,
  previasLocales = [],
  onRemoveLocal,
}: EvidenceCardProps) {
  return (
    <div className="border rounded-xl p-3 bg-white">
      <p className="text-sm font-medium mb-2">{titulo}</p>

      {/* Vistas previas locales con opción de quitar */}
      {previasLocales.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-amber-600 mb-1">
            Pendiente de enviar (previsualización local)
          </p>
          <div className="flex gap-2 flex-wrap">
            {previasLocales.map((src, i) => (
              <div key={i} className="relative group">
                <img
                  src={src}
                  className="w-16 h-16 object-cover rounded-lg border border-amber-300"
                  alt={`Previsualización local ${i + 1}`}
                />
                
                {/* Botón para remover la imagen local */}
                {onRemoveLocal && (
                  <button
                    type="button"
                    onClick={() => onRemoveLocal(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition shadow-md"
                    title="Quitar foto"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archivos ya guardados en el servidor */}
      {archivosGuardados.length > 0 ? (
        <div>
          <p className="text-xs text-green-600 mb-1">Guardado en el servidor</p>
          <div className="flex gap-2 flex-wrap">
            {archivosGuardados.map((archivo) => (
              <a
                key={archivo._id || archivo.fileName}
                href={FilesService.urlPublica(archivo)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={FilesService.urlPublica(archivo)}
                  alt={archivo.originalName}
                  className="w-16 h-16 object-cover rounded-lg border hover:opacity-90 transition"
                />
              </a>
            ))}
          </div>
        </div>
      ) : (
        previasLocales.length === 0 && (
          <p className="text-xs text-gray-400 italic">Sin evidencias todavía</p>
        )
      )}
    </div>
  );
}