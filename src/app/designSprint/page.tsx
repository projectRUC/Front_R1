"use client";

import { useState, useEffect } from "react";
import { FaseKey, useDesignSprint } from "./hooks/useDesignSprint";
import { DesignSprintTimeline } from "./components/DesignSprintTimeline";
import { ImageBase64Uploader } from "./components/FileUploader";
import { EvidenceCard } from "./components/EvidenceCard";
import { DecidirPhase } from "./components/DecidirPhase";
import { RetroalimentacionDocente } from "./components/RetroalimentacionDocente";
import { DesignSprintService } from "./services/designSprintApi";
import { PitchCoachAnalysis, FileEntity } from "@/types/designSprint";

interface Props {
  sprintId: string;
  usuId: number;
  esDocente?: boolean;
}

export default function DesignSprintPage({
  sprintId,
  usuId,
  esDocente = false,
}: Props) {
  const {
    sprint,
    fases,
    loading,
    error,
    refetch,
    registrarMapeo,
    registrarBoceto,
    puntuarBoceto,
    registrarPrototipo,
    agregarComentarioDocente,
  } = useDesignSprint(sprintId);

  const [faseActiva, setFaseActiva] = useState<FaseKey | "pitch_coach">("mapeo");
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

  // Campos de VoBo / Validar (Viernes)
  const [nombreExperto, setNombreExperto] = useState("");
  const [profesionInstitucion, setProfesionInstitucion] = useState("");
  const [comentariosViabilidad, setComentariosViabilidad] = useState("");
  const [dictamen, setDictamen] = useState("");
  const [voboDocente, setVoboDocente] = useState(false);
  const [guardandoVoBo, setGuardandoVoBo] = useState(false);

  // Estado de IA Pitch Coach
  const [analisisIa, setAnalisisIa] = useState<PitchCoachAnalysis | null>(null);
  const [cargandoIa, setCargandoIa] = useState(false);
  const [errorIa, setErrorIa] = useState<string | null>(null);

  // Determinar la ID verdadera del backend (MongoDB _id)
  const targetId = sprint?._id || (sprint as any)?.id || sprintId;

  useEffect(() => {
    if (!sprint) return;

    if (sprint.mapeo?.proyecto_problema) {
      setProblema(sprint.mapeo.proyecto_problema);
      setObjetivo(sprint.mapeo.proyecto_objective || "");
      setEnfoque(sprint.mapeo.enfoque || "");
    }

    if (sprint.vobo) {
      setNombreExperto(sprint.vobo.nombre_experto || "");
      setProfesionInstitucion(sprint.vobo.profesion_institucion || "");
      setComentariosViabilidad(sprint.vobo.comentarios_viabilidad || "");
      setDictamen(sprint.vobo.dictamen || "");
      setVoboDocente(Boolean(sprint.vobo.vobo_docente));
    }

    if (
      sprint.status &&
      ["mapeo", "boceto", "decidir", "prototipo", "test", "vobo"].includes(sprint.status)
    ) {
      const statusMap = sprint.status === "vobo" ? "test" : (sprint.status as FaseKey);
      setFaseActiva(statusMap);
    }
  }, [sprint]);

  const limpiarUploader = () => {
    setArchivosLocales([]);
    setPreviasLocales([]);
  };

  const handleCambiarFase = (nuevaFase: any) => {
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

  const handleGuardarVoBo = async () => {
    setGuardandoVoBo(true);
    try {
      if (!targetId) {
        alert("Error: No se encontró un ID válido del Design Sprint.");
        return;
      }

      await DesignSprintService.actualizarVoBo(targetId, {
        nombre_experto: nombreExperto,
        profesion_institucion: profesionInstitucion,
        comentarios_viabilidad: comentariosViabilidad,
        dictamen,
        vobo_docente: voboDocente,
      });

      alert("Dictamen de VoBo guardado correctamente.");
      await refetch();
    } catch (e: any) {
      console.error("Error guardando VoBo:", e);
      alert(e.message || "Error al actualizar el VoBo.");
    } finally {
      setGuardandoVoBo(false);
    }
  };

  const handleEjecutarPitchCoach = async () => {
    setCargandoIa(true);
    setErrorIa(null);
    try {
      const res = await DesignSprintService.ejecutarPitchCoach(targetId);
      setAnalisisIa(res);
    } catch (e: any) {
      setErrorIa(e.message || "Error al ejecutar la evaluación con IA.");
    } finally {
      setCargandoIa(false);
    }
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

  // Determinar si el VoBo ya fue registrado en el servidor
  const voboRegistrado = Boolean(
    sprint.vobo?.vobo_docente || sprint.vobo?.dictamen
  );

  const obtenerTextoComentario = (comentarios: any): string => {
    if (!comentarios) return "";
    if (typeof comentarios === "string") return comentarios;
    if (Array.isArray(comentarios) && comentarios.length > 0) {
      const ultimo = comentarios[comentarios.length - 1];
      return typeof ultimo === "string"
        ? ultimo
        : ultimo.texto || ultimo.comentario || ultimo.contenido || "";
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

      {/* Navegación por la línea de tiempo + Botón IA */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-gray-200 dark:border-zinc-800 items-center justify-between">
        <DesignSprintTimeline
          fases={fases}
          faseActiva={faseActiva as FaseKey}
          onSelect={(f) => handleCambiarFase(f)}
        />
        <button
          onClick={() => handleCambiarFase("pitch_coach")}
          className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition h-fit ${
            faseActiva === "pitch_coach"
              ? "bg-purple-600 text-white"
              : "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300"
          }`}
        >
          ✨ IA Pitch Coach
        </button>
      </div>

      <div className="mt-4 border rounded-xl p-4 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        {/* ================= MAPEAR (LUNES) ================= */}
        {faseActiva === "mapeo" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Mapear — Lunes
            </h3>
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
                comentarioActual={obtenerTextoComentario(
                  sprint.mapeo?.comentarios
                )}
                onGuardarComentario={async (comentario) => {
                  await agregarComentarioDocente("mapeo", comentario, usuId);
                }}
              />
            )}
          </div>
        )}

        {/* ================= BOCETAR (MARTES) ================= */}
        {faseActiva === "boceto" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Bocetar — Martes
            </h3>

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
                sprint.bocetos
                  ?.flatMap((b) => b.archivos ?? [])
                  .filter((a): a is FileEntity => Boolean(a)) || []
              }
              previasLocales={previasLocales}
            />

            {esDocente && (
              <RetroalimentacionDocente
                faseNombre="Bocetar"
                comentarioActual={obtenerTextoComentario(
                  sprint.bocetos?.[0]?.comentarios
                )}
                onGuardarComentario={async (comentario) => {
                  const bocetoId =
                    (sprint.bocetos?.[0] as any)?._id ||
                    (sprint.bocetos?.[0] as any)?.id;
                  if (!bocetoId) {
                    alert(
                      "No hay un boceto registrado al cual asignarle la retroalimentación."
                    );
                    return;
                  }
                  await agregarComentarioDocente(
                    "boceto",
                    comentario,
                    usuId,
                    bocetoId
                  );
                }}
              />
            )}
          </div>
        )}

        {/* ================= DECIDIR (MIÉRCOLES - DESBLOQUEADO) ================= */}
        {faseActiva === "decidir" && (
          <div>
            <DecidirPhase
              sprintId={targetId}
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

        {/* ================= PROTOTIPAR (JUEVES) ================= */}
        {faseActiva === "prototipo" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Prototipar — Jueves
            </h3>

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
                comentarioActual={obtenerTextoComentario(
                  sprint.prototipo?.comentarios
                )}
                onGuardarComentario={async (comentario) => {
                  await agregarComentarioDocente(
                    "prototipo",
                    comentario,
                    usuId
                  );
                }}
              />
            )}
          </div>
        )}

        {/* ================= VALIDAR (VIERNES - DESBLOQUEADO) ================= */}
        {faseActiva === "test" && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              Validación y Dictamen — Viernes
            </h3>

            {esDocente ? (
              /* VISTA DE EDICIÓN / LECTURA PARA DOCENTE */
              <div className="flex flex-col gap-3">
                <input
                  disabled={voboRegistrado}
                  className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 disabled:bg-gray-100 dark:disabled:bg-zinc-800/80 disabled:text-gray-600 dark:disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del experto / docente evaluador"
                  value={nombreExperto}
                  onChange={(e) => setNombreExperto(e.target.value)}
                />
                <input
                  disabled={voboRegistrado}
                  className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 disabled:bg-gray-100 dark:disabled:bg-zinc-800/80 disabled:text-gray-600 dark:disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Profesión e institución"
                  value={profesionInstitucion}
                  onChange={(e) => setProfesionInstitucion(e.target.value)}
                />
                <textarea
                  disabled={voboRegistrado}
                  className="border rounded-lg px-3 py-2 text-sm h-28 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 disabled:bg-gray-100 dark:disabled:bg-zinc-800/80 disabled:text-gray-600 dark:disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comentarios sobre la viabilidad del producto"
                  value={comentariosViabilidad}
                  onChange={(e) => setComentariosViabilidad(e.target.value)}
                />
                <input
                  disabled={voboRegistrado}
                  className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 disabled:bg-gray-100 dark:disabled:bg-zinc-800/80 disabled:text-gray-600 dark:disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dictamen (Ej. Aprobado, Con Observaciones, Rechazado)"
                  value={dictamen}
                  onChange={(e) => setDictamen(e.target.value)}
                />

                <label className="flex items-center gap-2 text-sm font-medium my-1 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={voboRegistrado}
                    checked={voboDocente}
                    onChange={(e) => setVoboDocente(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 disabled:opacity-50"
                  />
                  Emitir Visto Bueno (VoBo) oficial del docente
                </label>

                {!voboRegistrado ? (
                  <button
                    disabled={guardandoVoBo}
                    onClick={handleGuardarVoBo}
                    className="bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition"
                  >
                    {guardandoVoBo ? "Guardando dictamen..." : "Guardar Dictamen"}
                  </button>
                ) : (
                  <p className="text-sm text-green-600 font-medium text-center py-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    ✓ Dictamen registrado correctamente.
                  </p>
                )}
              </div>
            ) : (
              /* VISTA EXCLUSIVA DE LECTURA PARA ALUMNOS */
              <div className="border rounded-xl p-4 bg-gray-50 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-700/80 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Dictamen Emitido por el Evaluador
                </h4>
                {voboRegistrado ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Experto:</strong> {nombreExperto || "N/A"}</p>
                    <p><strong>Institución/Profesión:</strong> {profesionInstitucion || "N/A"}</p>
                    <p><strong>Comentarios:</strong> {comentariosViabilidad || "Sin comentarios."}</p>
                    <p><strong>Dictamen:</strong> <span className="font-semibold text-blue-600 dark:text-blue-400">{dictamen || "Pendiente"}</span></p>
                    <p>
                      <strong>Visto Bueno Docente:</strong>{" "}
                      {voboDocente ? (
                        <span className="text-green-600 font-semibold">✓ Concedido</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">Pendiente</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-zinc-400 italic">
                    El docente aún no ha emitido o registrado un dictamen final para esta fase.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= IA PITCH COACH ================= */}
        {faseActiva === "pitch_coach" && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-300">
                ✨ IA Pitch Coach
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Analiza el progreso completo de tu Design Sprint mediante IA para obtener fortalezas, recomendaciones y optimizaciones para tu pitch.
              </p>
            </div>

            <button
              disabled={cargandoIa}
              onClick={handleEjecutarPitchCoach}
              className="bg-purple-600 text-white rounded-lg py-2 px-4 text-sm disabled:opacity-50 hover:bg-purple-700 transition w-fit"
            >
              {cargandoIa ? "Generando análisis con IA..." : "Analizar proyecto con IA"}
            </button>

            {errorIa && <p className="text-sm text-red-600">{errorIa}</p>}

            {analisisIa && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/50 space-y-4 text-sm">
                {analisisIa.puntuacion_general !== undefined && (
                  <div>
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                      Calificación General Estimada
                    </span>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {analisisIa.puntuacion_general} / 100
                    </p>
                  </div>
                )}

                {analisisIa.fortalezas && analisisIa.fortalezas.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">
                      Fortalezas
                    </h4>
                    <ul className="list-disc list-inside text-purple-800 dark:text-purple-300 space-y-1">
                      {analisisIa.fortalezas.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analisisIa.areas_mejora && analisisIa.areas_mejora.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">
                      Áreas de Mejora
                    </h4>
                    <ul className="list-disc list-inside text-purple-800 dark:text-purple-300 space-y-1">
                      {analisisIa.areas_mejora.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analisisIa.sugerencias_pitch && analisisIa.sugerencias_pitch.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">
                      Sugerencias para el Pitch
                    </h4>
                    <ul className="list-disc list-inside text-purple-800 dark:text-purple-300 space-y-1">
                      {analisisIa.sugerencias_pitch.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}