// useDesignSprint.ts
import { useState, useEffect, useCallback } from "react";
import { SprintDesign } from "@/types/designSprint";
import { fetchApi, fetchApiForm } from "@/services/api";

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
    try {
      setError(null);
      const data = await fetchApi<SprintDesign>(`/design-sprint/${sprintId}`);
      setSprint(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar el Design Sprint");
    }
  }, [sprintId]);

  useEffect(() => {
    if (sprintId) cargarSprint();
  }, [sprintId, cargarSprint]);

  // Construcción de la lista de fases para el Timeline
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
    files: File[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("proyecto_problema", data.proyecto_problema);
      formData.append("proyecto_objective", data.proyecto_objective);
      formData.append("enfoque", data.enfoque);

      files.forEach((file) => formData.append("archivos", file));

      await fetchApiForm(`/design-sprint/${sprintId}/mapeo`, formData);
      await cargarSprint();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREGIDO: Recibe usuId por parámetro y actualiza el sprint
  const puntuarBoceto = async (bocetoId: string, usuId: number, valor: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      await fetchApi(`/design-sprint/${sprintId}/boceto/${bocetoId}/puntuacion`, {
        method: "POST",
        body: JSON.stringify({
          usu_id: Number(usuId),
          valor: valor,
        }),
      });
      await cargarSprint();
    } catch (err: any) {
      setError(err.message || "Error al votar por el boceto");
    } finally {
      setLoading(false);
    }
  };

  const registrarBoceto = async (
    data: { propuesta: string; usu_id: number },
    files: File[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const numericUsuId = Number(data.usu_id);
      if (isNaN(numericUsuId) || numericUsuId <= 0) {
        throw new Error("El ID de usuario no es válido para registrar el boceto.");
      }

      const formData = new FormData();
      formData.append("propuesta", data.propuesta);
      formData.append("usu_id", String(numericUsuId));

      files.forEach((file) => formData.append("archivos", file));

      await fetchApiForm(`/design-sprint/${sprintId}/boceto`, formData);
      await cargarSprint();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registrarPrototipo = async (
    data: { nombre_prototipo: string; descripcion: string },
    files: File[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("nombre_prototipo", data.nombre_prototipo);
      formData.append("descripcion", data.descripcion);

      files.forEach((file) => formData.append("archivos", file));

      await fetchApiForm(`/design-sprint/${sprintId}/prototipo`, formData);
      await cargarSprint();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    sprint,
    fases,
    loading,
    error,
    registrarMapeo,
    registrarBoceto,
    puntuarBoceto, // 👈 Importante: Agregado al return
    registrarPrototipo,
  };
}