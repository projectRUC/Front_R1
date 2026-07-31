"use client";

import { useState } from "react";
import { FilesService } from "../services/filesApi";
import { FileEntity } from "@/types/designSprint";

interface Puntuacion {
  usu_id: number;
  valor?: number;
  comentario?: string | { comentario?: string; texto?: string; usu_id?: number };
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
  onVotarBoceto: (bocetoId: string, comentario?: string) => Promise<void>;
}

export function DecidirPhase({
  sprintId,
  bocetos = [],
  currentUserId,
  onVotarBoceto,
}: DecidirPhaseProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});

  const obtenerTextoComentario = (
    comentarioRaw?: string | { comentario?: string; texto?: string }
  ): string => {
    if (!comentarioRaw) return "";
    if (typeof comentarioRaw === "string") return comentarioRaw;
    if (typeof comentarioRaw === "object") {
      return comentarioRaw.comentario || comentarioRaw.texto || "";
    }
    return "";
  };

  const handleComentarioChange = (bocetoId: string, text: string) => {
    setComentarios((prev) => ({
      ...prev,
      [bocetoId]: text,
    }));
  };

  const handleVotar = async (bocetoId: string) => {
    try {
      setLoadingId(bocetoId);
      const comentarioTexto = comentarios[bocetoId] || "";
      await onVotarBoceto(bocetoId, comentarioTexto);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="border border-gray-800 rounded-2xl p-6 bg-white space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Decidir — Miércoles</h3>
        <p className="text-sm text-gray-500">
          Vota por los bocetos propuestos por el equipo e ingresa tus comentarios.
        </p>
      </div>

      {bocetos.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No hay bocetos disponibles para votar.
        </p>
      ) : (
        <div className="space-y-6">
          {bocetos.map((boceto) => {
            const totalVotos = boceto.puntuaciones?.length || 0;
            const miVoto = boceto.puntuaciones?.find(
              (p) => p.usu_id === currentUserId
            );
            const yaVoto = Boolean(miVoto);
            const miComentarioPrevio = obtenerTextoComentario(miVoto?.comentario);

            return (
              <div
                key={boceto._id}
                className="border rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50 hover:bg-white hover:shadow-sm transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                </div>

                {/* Sección de entrada para comentario y botón de votación */}
                <div className="pt-2 border-t border-gray-200 flex flex-col gap-3">
                  <textarea
                    rows={2}
                    disabled={yaVoto} // 👈 Deshabilita la edición si ya votó
                    placeholder={
                      yaVoto
                        ? "Ya has registrado tu comentario para este boceto."
                        : "Escribe un comentario o justificación para tu voto..."
                    }
                    value={comentarios[boceto._id] ?? miComentarioPrevio}
                    onChange={(e) =>
                      handleComentarioChange(boceto._id, e.target.value)
                    }
                    className={`w-full text-xs p-2 border rounded-lg focus:outline-none ${
                      yaVoto
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" // 👈 Cambia el cursor a not-allowed
                        : "border-gray-300 focus:ring-1 focus:ring-blue-500"
                    }`}
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={loadingId === boceto._id || yaVoto} // 👈 También bloquea el botón si ya votó
                      onClick={() => handleVotar(boceto._id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                        yaVoto
                          ? "bg-green-600/70 text-white cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {loadingId === boceto._id
                        ? "Enviando..."
                        : yaVoto
                        ? "✓ Votado"
                        : "Votar"}
                    </button>
                  </div>
                </div>

                {/* Visualización de Comentarios Existentes */}
                {boceto.puntuaciones &&
                  boceto.puntuaciones.some((p) => Boolean(obtenerTextoComentario(p.comentario))) && (
                    <div className="mt-2 bg-gray-100/70 p-3 rounded-lg text-xs space-y-1.5">
                      <p className="font-semibold text-gray-700">Comentarios del equipo:</p>
                      {boceto.puntuaciones.map((p, idx) => {
                        const texto = obtenerTextoComentario(p.comentario);
                        if (!texto) return null;

                        return (
                          <div
                            key={idx}
                            className="border-b border-gray-200 last:border-b-0 pb-1 last:pb-0"
                          >
                            <span className="font-semibold text-gray-600">
                              Usuario #{p.usu_id}:
                            </span>{" "}
                            <span className="text-gray-800">{texto}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}