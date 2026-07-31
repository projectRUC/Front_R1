"use client";

import { useState, useEffect, useCallback } from "react";
import { DesignSprintService } from "./services/designSprintApi";
import DesignSprintPage from "./page";

interface Props {
  eqId: number;
  proyectoId: number;
  usuId: number;
  esDocente?: boolean;
}

export default function DesignSprintGate({ eqId, proyectoId, usuId, esDocente = false }: Props) {
  const [sprintId, setSprintId] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [noExiste, setNoExiste] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async () => {
    setBuscando(true);
    setError(null);
    setNoExiste(false);
    try {
      const sprint = await DesignSprintService.obtenerPorEquipoYProyecto(
        eqId,
        String(proyectoId)
      );

      if (sprint && sprint._id) {
        setSprintId(sprint._id);
      } else {
        setNoExiste(true);
      }
    } catch (e: any) {
      if (e.message?.toLowerCase().includes("no encontrado")) {
        setNoExiste(true);
      } else {
        setError(e.message);
      }
    } finally {
      setBuscando(false);
    }
  }, [eqId, proyectoId]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  const handleCrear = async () => {
    setCreando(true);
    setError(null);
    try {
      const nuevo = await DesignSprintService.crear(eqId, String(proyectoId));
      if (nuevo && nuevo._id) {
        setSprintId(nuevo._id);
        setNoExiste(false);
      } else {
        throw new Error("No se pudo obtener el ID del nuevo ciclo de ideación.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreando(false);
    }
  };

  if (buscando) {
    return (
      <p className="text-sm text-gray-500 p-6">
        Buscando ciclo de ideación del equipo...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={buscar}
          className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (noExiste) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h2 className="font-semibold text-lg mb-2">Aún no hay un ciclo de ideación</h2>
        <p className="text-sm text-gray-500 mb-4">
          Este equipo todavía no ha iniciado el Design Sprint para este proyecto.
        </p>
        <button
          disabled={creando}
          onClick={handleCrear}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {creando ? "Creando..." : "Iniciar ciclo de ideación"}
        </button>
      </div>
    );
  }

  if (!sprintId) {
    return (
      <p className="text-sm text-gray-500 p-6">
        No se pudo determinar el ciclo de ideación.
      </p>
    );
  }

  return <DesignSprintPage sprintId={sprintId} usuId={usuId} esDocente={esDocente} />;
}