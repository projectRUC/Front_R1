import { useState, useEffect, useCallback } from "react";
import { SprintDesign } from "@/types/designSprint";
import { DesignSprintService } from "../services/designSprintApi";

export type FaseKey = "mapeo" | "boceto" | "decidir" | "prototipo" | "test";

export interface FaseInfo {
  key: FaseKey;
  dia: string;
  nombre: string;
  estado: "completada" | "en_progreso" | "bloqueada";
}

export function useDesignSprint(sprintId: string) {
  const [sprint, setSprint] = useState<SprintDesign | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener el ID objetivo (Prioriza la _id de MongoDB del sprint cargado si existe)
  const targetId = sprint?._id || (sprint as any)?.id || sprintId;

  const cargarSprint = useCallback(async () => {
    if (!sprintId) return;
    try {
      setError(null);
      const data = await DesignSprintService.obtenerPorId(sprintId);
      setSprint(data);
    } catch (err: any) {
      setError(err?.message || "Error al cargar el Design Sprint");
    }
  }, [sprintId]);

  useEffect(() => {
    cargarSprint();
  }, [cargarSprint]);

  const fases: FaseInfo[] = [
    {
      key: "mapeo",
      dia: "Lunes",
      nombre: "Mapear",
      estado: sprint?.mapeo?.proyecto_problema
        ? "completada"
        : sprint?.status === "mapeo" || !sprint?.status
        ? "en_progreso"
        : "bloqueada",
    },
    {
      key: "boceto",
      dia: "Martes",
      nombre: "Bocetar",
      estado:
        sprint?.bocetos && sprint.bocetos.length > 0
          ? "completada"
          : sprint?.status === "boceto"
          ? "en_progreso"
          : "bloqueada",
    },
    {
      key: "decidir",
      dia: "Miércoles",
      nombre: "Decidir",
      estado:
        sprint?.status === "decidir" || sprint?.status === "prototipo"
          ? "en_progreso"
          : "bloqueada",
    },
    {
      key: "prototipo",
      dia: "Jueves",
      nombre: "Prototipar",
      estado: sprint?.prototipo?.nombre_prototipo
        ? "completada"
        : sprint?.status === "prototipo_completado"
        ? "en_progreso"
        : "bloqueada",
    },
    {
      key: "test",
      dia: "Viernes",
      nombre: "Validar",
      estado:
        (sprint as any)?.test?.hallazgos ||
        ((sprint as any)?.test?.archivos && (sprint as any).test.archivos.length > 0) ||
        sprint?.vobo
          ? "completada"
          : sprint?.status === "test" || sprint?.status === "vobo" || sprint?.status === "prototipo_completado"
          ? "en_progreso"
          : "bloqueada",
    },
  ];

  const registrarMapeo = async (
    data: { proyecto_problema: string; proyecto_objective: string; enfoque: string },
    files: File[] = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      await DesignSprintService.registrarMapeo(targetId, data, files);
      await cargarSprint();
    } catch (err: any) {
      setError(err?.message || "Error al registrar la fase de Mapeo");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registrarBoceto = async (
    data: { propuesta: string; usu_id: number },
    files: File[] = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      const numericUsuId = Number(data.usu_id);
      if (isNaN(numericUsuId) || numericUsuId <= 0) {
        throw new Error("El ID de usuario no es válido para registrar el boceto.");
      }

      await DesignSprintService.registrarBoceto(
        targetId,
        { propuesta: data.propuesta, usu_id: numericUsuId },
        files
      );
      await cargarSprint();
    } catch (err: any) {
      setError(err?.message || "Error al guardar el boceto");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const puntuarBoceto = async (
    bocetoId: string,
    usuId: number,
    valor: number = 1,
    comentario?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const numericUsuId = Number(usuId);
      if (isNaN(numericUsuId) || numericUsuId <= 0) {
        throw new Error("El ID de usuario no es válido para votar.");
      }

      await DesignSprintService.puntuarBoceto(targetId, bocetoId, {
        usu_id: numericUsuId,
        valor,
        comentario,
      });
      await cargarSprint();
    } catch (err: any) {
      setError(err?.message || "Error al votar por el boceto");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registrarPrototipo = async (
    data: { nombre_prototipo: string; descripcion: string },
    files: File[] = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      await DesignSprintService.registrarPrototipo(targetId, data, files);
      await cargarSprint();
    } catch (err: any) {
      setError(err?.message || "Error al registrar el prototipo");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registrarTest = async (
    data: { hallazgos: string; conclusion: string; puntuacion_general?: number },
    files: File[] = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      if (typeof (DesignSprintService as any).registrarTest === "function") {
        await (DesignSprintService as any).registrarTest(targetId, data, files);
      } else {
        await DesignSprintService.actualizarVoBo(targetId, {
          comentarios_viabilidad: `Hallazgos: ${data.hallazgos}\nConclusión: ${data.conclusion}`,
          dictamen: data.puntuacion_general ? `Puntuación: ${data.puntuacion_general}/100` : undefined,
        });
      }
      await cargarSprint();
    } catch (err: any) {
      setError(err?.message || "Error al registrar la fase de Validar/Test");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const agregarComentarioDocente = async (
    fase: FaseKey,
    comentario: string,
    usuId: number,
    bocetoId?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const numericUsuId = Number(usuId);
      if (isNaN(numericUsuId) || numericUsuId <= 0) {
        throw new Error("Se requiere un ID de usuario/docente válido para comentar.");
      }

      if (fase === "mapeo") {
        await DesignSprintService.agregarComentarioMapeo(targetId, comentario, numericUsuId);
      } else if (fase === "boceto") {
        if (!bocetoId) {
          throw new Error("Se requiere un ID de boceto válido para dejar un comentario.");
        }
        await DesignSprintService.agregarComentarioBoceto(targetId, bocetoId, comentario, numericUsuId);
      } else if (fase === "prototipo") {
        await DesignSprintService.agregarComentarioPrototipo(targetId, comentario, numericUsuId);
      } else if (fase === "test") {
        if (typeof (DesignSprintService as any).agregarComentarioTest === "function") {
          await (DesignSprintService as any).agregarComentarioTest(targetId, comentario, numericUsuId);
        } else {
          await DesignSprintService.agregarComentarioGeneral(targetId, comentario, numericUsuId);
        }
      } else {
        await DesignSprintService.agregarComentarioGeneral(targetId, comentario, numericUsuId);
      }
      await cargarSprint();
    } catch (err: any) {
      setError(err?.message || "Error al guardar el comentario del docente");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sprint,
    fases,
    loading,
    error,
    refetch: cargarSprint,
    registrarMapeo,
    registrarBoceto,
    puntuarBoceto,
    registrarPrototipo,
    registrarTest,
    agregarComentarioDocente,
  };
}