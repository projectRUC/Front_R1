import { useState, useEffect, useCallback } from "react";
import { SprintDesign } from "@/types/designSprint";
import { DesignSprintService } from "../services/designSprintApi";

export type FaseKey = "mapeo" | "boceto" | "decidir" | "prototipo";

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
  ];

  const registrarMapeo = async (
    data: { proyecto_problema: string; proyecto_objective: string; enfoque: string },
    files: File[] = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      await DesignSprintService.registrarMapeo(sprintId, data, files);
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
        sprintId,
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

      await DesignSprintService.puntuarBoceto(sprintId, bocetoId, {
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
      await DesignSprintService.registrarPrototipo(sprintId, data, files);
      await cargarSprint();
    } catch (err: any) {
      setError(err?.message || "Error al registrar el prototipo");
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
        await DesignSprintService.agregarComentarioMapeo(sprintId, comentario, numericUsuId);
      } else if (fase === "boceto") {
        if (!bocetoId) {
          throw new Error("Se requiere un ID de boceto válido para dejar un comentario.");
        }
        await DesignSprintService.agregarComentarioBoceto(sprintId, bocetoId, comentario, numericUsuId);
      } else if (fase === "prototipo") {
        await DesignSprintService.agregarComentarioPrototipo(sprintId, comentario, numericUsuId);
      } else {
        await DesignSprintService.agregarComentarioGeneral(sprintId, comentario, numericUsuId);
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
    agregarComentarioDocente,
  };
}