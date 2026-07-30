"use client";

import { useState } from "react";
import { FilesService } from "../services/filesApi";
import { FileEntity } from "@/types/designSprint";

interface Puntuacion {
  usu_id: number;
  valor: number;
}

interface Boceto {
  _id: string;
  propuesta: string;
  usu_id: number;
  archivos: FileEntity[];
  puntuaciones: Puntuacion[];
}

interface DecidirPhaseProps {
  sprintId: string;
  bocetos: Boceto[];
  currentUserId: number;
  onVotarBoceto: (bocetoId: string) => Promise<void>;
}

export function DecidirPhase({
  sprintId,
  bocetos = [],
  currentUserId,
  onVotarBoceto,
}: DecidirPhaseProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleVotar = async (bocetoId: string) => {
    try {
      setLoadingId(bocetoId);
      await onVotarBoceto(bocetoId);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="border border-gray-800 rounded-2xl p-6 bg-white space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Decidir — Miércoles</h3>
        <p className="text-sm text-gray-500">
          Vota por los bocetos propuestos por el equipo.
        </p>
      </div>

      {bocetos.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No hay bocetos disponibles para votar.
        </p>
      ) : (
        <div className="space-y-4">
          {bocetos.map((boceto) => {
            const totalVotos = boceto.puntuaciones?.length || 0;
            const yaVoto = boceto.puntuaciones?.some(
              (p) => p.usu_id === currentUserId
            );

            return (
              <div
                key={boceto._id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 hover:bg-white hover:shadow-sm transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Usuario #{boceto.usu_id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {totalVotos} {totalVotos === 1 ? "voto" : "votos"}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-800">
                    {boceto.propuesta}
                  </p>

                  {boceto.archivos && boceto.archivos.length > 0 && (
                    <div className="flex gap-2 pt-1 flex-wrap">
                      {boceto.archivos.map((archivo) => (
                        <a
                          key={archivo._id || archivo.fileName}
                          href={FilesService.urlPublica(archivo)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={FilesService.urlPublica(archivo)}
                            alt={archivo.originalName}
                            className="w-14 h-14 object-cover rounded-lg border hover:opacity-80 transition"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    type="button"
                    disabled={loadingId === boceto._id}
                    onClick={() => handleVotar(boceto._id)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                      yaVoto
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {loadingId === boceto._id
                      ? "Enviando..."
                      : yaVoto
                      ? "✓ Votado (Quitar/Cambiar)"
                      : "Votar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}