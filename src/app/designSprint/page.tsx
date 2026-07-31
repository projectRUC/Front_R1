"use client";

import { useState, useEffect } from "react";
import { FaseKey, useDesignSprint } from "./hooks/useDesignSprint";
import { DesignSprintTimeline } from "./components/DesignSprintTimeline";
import { ImageBase64Uploader } from "./components/FileUploader";
import { EvidenceCard } from "./components/EvidenceCard";
import { DecidirPhase } from "./components/DecidirPhase";
import { RetroalimentacionDocente } from "./components/RetroalimentacionDocente";

interface Props {
  sprintId: string;
  usuId: number;
  esDocente?: boolean;
}

export default function DesignSprintPage({ sprintId, usuId, esDocente = false }: Props) {
  const {
    sprint,
    fases,
    loading,
    error,
    registrarMapeo,
    registrarBoceto,
    puntuarBoceto,
    registrarPrototipo,
    agregarComentarioDocente,
  } = useDesignSprint(sprintId);

  const [faseActiva, setFaseActiva] = useState<FaseKey>("mapeo");
  const [archivosLocales, setArchivosLocales] = useState<File[]>([]);
  const [previasLocales, setPreviasLocales] = useState<string[]>([]);

  // Campos de Mapear
  const [problema, setProblema] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [enfoque, setEnfoque] = useState("");

  // Campos de Boceto
  const [propuesta, setPropuesta] = useState("");

  // Campos de Prototipo
  const [nombrePrototipo, setNombrePrototipo] = useState("");
  const [descripcionPrototipo, setDescripcionPrototipo] = useState("");

  useEffect(() => {
    if (!sprint) return;

    if (sprint.mapeo?.proyecto_problema) {
      setProblema(sprint.mapeo.proyecto_problema);
      setObjetivo(sprint.mapeo.proyecto_objective || "");
      setEnfoque(sprint.mapeo.enfoque || "");
    }

    if (
      sprint.status &&
      ["mapeo", "boceto", "decidir", "prototipo"].includes(sprint.status)
    ) {
      setFaseActiva(sprint.status as FaseKey);
    }
  }, [sprint]);

  const limpiarUploader = () => {
    setArchivosLocales([]);
    setPreviasLocales([]);
  };

  const handleCambiarFase = (nuevaFase: FaseKey) => {
    limpiarUploader();
    setFaseActiva(nuevaFase);
  };

  const handleEnviarMapeo = async () => {
    await registrarMapeo(
      {
        proyecto_problema: problema,
        proyecto_objective: objetivo,
        enfoque,
      },
      archivosLocales
    );
    limpiarUploader();
  };

  const handleEnviarBoceto = async () => {
    const parsedUsuId = Number(usuId);

    if (
      usuId === undefined ||
      usuId === null ||
      isNaN(parsedUsuId) ||
      parsedUsuId <= 0
    ) {
      alert("Error: No se ha detectado un ID de usuario válido.");
      return;
    }

    if (!propuesta.trim()) {
      alert("Por favor, ingresa una propuesta para el boceto.");
      return;
    }

    await registrarBoceto({ propuesta, usu_id: parsedUsuId }, archivosLocales);
    limpiarUploader();
    setPropuesta("");
  };

  const handleEnviarPrototipo = async () => {
    await registrarPrototipo(
      {
        nombre_prototipo: nombrePrototipo,
        descripcion: descripcionPrototipo,
      },
      archivosLocales
    );
    limpiarUploader();
  };

  if (!sprint)
    return (
      <p className="text-sm text-gray-500 p-6">Cargando ciclo de ideación...</p>
    );

  const mapeoRegistrado = Boolean(sprint.mapeo?.proyecto_problema);
  const bocetoPublicado = sprint.bocetos?.some(
    (b) => b.usu_id === Number(usuId)
  );
  const prototipoPublicado = Boolean(
    sprint.prototipo?.nombre_prototipo ||
      (sprint.prototipo?.archivos && sprint.prototipo.archivos.length > 0)
  );

  const obtenerTextoComentario = (comentarios: any): string => {
    if (!comentarios) return "";
    if (typeof comentarios === "string") return comentarios;
    if (Array.isArray(comentarios) && comentarios.length > 0) {
      const ultimo = comentarios[comentarios.length - 1];
      return typeof ultimo === "string" ? ultimo : ultimo.texto || ultimo.comentario || ultimo.contenido || "";
    }
    return "";
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-1">
        Ciclo de Ideación — Design Sprint
      </h1>
      <p className="text-sm text-gray-500 mb-4">Equipo #{sprint.eq_id}</p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <DesignSprintTimeline
        fases={fases}
        faseActiva={faseActiva}
        onSelect={handleCambiarFase}
      />

      <div className="mt-4 border rounded-xl p-4 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        {/* ================= MAPEAR ================= */}
        {faseActiva === "mapeo" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Mapear — Lunes</h3>
            <input
              disabled={mapeoRegistrado}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-600 dark:disabled:text-zinc-400"
              placeholder="Problema del proyecto"
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
            />
            <input
              disabled={mapeoRegistrado}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-600 dark:disabled:text-zinc-400"
              placeholder="Objetivo del proyecto"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
            <input
              disabled={mapeoRegistrado}
              className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-600 dark:disabled:text-zinc-400"
              placeholder="Enfoque"
              value={enfoque}
              onChange={(e) => setEnfoque(e.target.value)}
            />

            {!mapeoRegistrado && (
              <ImageBase64Uploader
                label="Evidencia del mapa"
                multiple
                onChange={(files, previews) => {
                  setArchivosLocales(files);
                  setPreviasLocales(previews);
                }}
              />
            )}

            <EvidenceCard
              titulo="Evidencias de Mapear"
              archivosGuardados={sprint.mapeo?.archivos || []}
              previasLocales={previasLocales}
            />

            {!mapeoRegistrado ? (
              <button
                disabled={loading}
                onClick={() => handleEnviarMapeo()}
                className="bg-blue-600 text-white rounded-lg py-2 text-sm disabled:opacity-50 hover:bg-blue-700 transition"
              >
                {loading ? "Guardando..." : "Guardar Mapeo"}
              </button>
            ) : (
              <p className="text-sm text-green-600 font-medium text-center mt-2">
                ✓ La fase Mapear ya fue registrada para este ciclo.
              </p>
            )}

            {esDocente && (
              <RetroalimentacionDocente
                faseNombre="Mapear"
                comentarioActual={obtenerTextoComentario(sprint.mapeo?.comentarios)}
                onGuardarComentario={async (comentario) => {
                  await agregarComentarioDocente("mapeo", comentario, usuId);
                }}
              />
            )}
          </div>
        )}

        {/* ================= BOCETAR ================= */}
        {faseActiva === "boceto" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Bocetar — Martes</h3>

            {!bocetoPublicado ? (
              <>
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Propuesta del boceto"
                  value={propuesta}
                  onChange={(e) => setPropuesta(e.target.value)}
                />
                <ImageBase64Uploader
                  label="Foto del boceto"
                  multiple
                  onChange={(files, previews) => {
                    setArchivosLocales(files);
                    setPreviasLocales(previews);
                  }}
                />
                <button
                  disabled={loading}
                  onClick={handleEnviarBoceto}
                  className="bg-blue-600 text-white rounded-lg py-2 text-sm disabled:opacity-50 hover:bg-blue-700 transition mt-2"
                >
                  {loading ? "Guardando..." : "Guardar Boceto"}
                </button>
              </>
            ) : (
              <p className="text-sm text-green-600 font-medium text-center py-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                ✓ Ya has publicado tu boceto para esta fase.
              </p>
            )}

            <EvidenceCard
              titulo="Bocetos del equipo"
              archivosGuardados={
                sprint.bocetos?.flatMap((b) => b.archivos) || []
              }
              previasLocales={previasLocales}
            />

            {esDocente && (
              <RetroalimentacionDocente
                faseNombre="Bocetar"
                comentarioActual={obtenerTextoComentario(sprint.bocetos?.[0]?.comentarios)}
                onGuardarComentario={async (comentario) => {
                  const bocetoId = (sprint.bocetos?.[0] as any)?._id || (sprint.bocetos?.[0] as any)?.id;
                  if (!bocetoId) {
                    alert("No hay un boceto registrado al cual asignarle la retroalimentación.");
                    return;
                  }
                  await agregarComentarioDocente("boceto", comentario, usuId, bocetoId);
                }}
              />
            )}
          </div>
        )}

        {/* ================= DECIDIR ================= */}
        {faseActiva === "decidir" && (
          <div>
            <DecidirPhase
              sprintId={sprintId}
              bocetos={sprint.bocetos as any}
              currentUserId={Number(usuId)}
              onVotarBoceto={async (bocetoId: string, comentario?: string) => {
                await puntuarBoceto(bocetoId, Number(usuId), 1, comentario);
              }}
            />

            {esDocente && (
              <RetroalimentacionDocente
                faseNombre="Decidir"
                onGuardarComentario={async (comentario) => {
                  await agregarComentarioDocente("decidir", comentario, usuId);
                }}
              />
            )}
          </div>
        )}

        {/* ================= PROTOTIPAR ================= */}
        {faseActiva === "prototipo" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Prototipar — Jueves</h3>

            {!prototipoPublicado ? (
              <>
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Nombre del prototipo"
                  value={nombrePrototipo}
                  onChange={(e) => setNombrePrototipo(e.target.value)}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Descripción"
                  value={descripcionPrototipo}
                  onChange={(e) => setDescripcionPrototipo(e.target.value)}
                />
                <ImageBase64Uploader
                  label="Foto del prototipo"
                  multiple
                  onChange={(files, previews) => {
                    setArchivosLocales(files);
                    setPreviasLocales(previews);
                  }}
                />
                <button
                  disabled={loading}
                  onClick={() => handleEnviarPrototipo()}
                  className="bg-blue-600 text-white rounded-lg py-2 text-sm disabled:opacity-50 hover:bg-blue-700 transition mt-2"
                >
                  {loading ? "Guardando..." : "Guardar Prototipo"}
                </button>
              </>
            ) : (
              <p className="text-sm text-green-600 font-medium text-center py-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                ✓ El prototipo de esta fase ya ha sido guardado.
              </p>
            )}

            <EvidenceCard
              titulo="Evidencias del prototipo"
              archivosGuardados={sprint.prototipo?.archivos || []}
              previasLocales={previasLocales}
            />

            {esDocente && (
              <RetroalimentacionDocente
                faseNombre="Prototipar"
                comentarioActual={obtenerTextoComentario(sprint.prototipo?.comentarios)}
                onGuardarComentario={async (comentario) => {
                  await agregarComentarioDocente("prototipo", comentario, usuId);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}