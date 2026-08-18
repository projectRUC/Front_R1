"use client";

import { useState, useEffect, useCallback } from "react";
import { DesignSprintService, extraerId } from "./services/designSprintApi";
import DesignSprintPage from "./page";

interface Props {
  eqId: number;
  proyectoId: string;
  usuId: number;
  esDocente?: boolean;
}

export default function DesignSprintGate({
  eqId,
  proyectoId,
  usuId,
  esDocente = false,
}: Props) {
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
      const sprint = await DesignSprintService.obtenerPorEquipoYProyecto(eqId, proyectoId);
      const idEncontrado = extraerId(sprint?._id);

      if (idEncontrado) {
        setSprintId(idEncontrado);
      } else {
        setNoExiste(true);
      }
    } catch (e: any) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("no encontrado")) {
        setNoExiste(true);
      } else {
        setError(e?.message || "Error al consultar el ciclo de ideación.");
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
      const nuevo = await DesignSprintService.crear(eqId, proyectoId);
      const idNuevo = extraerId(nuevo?._id);

      if (idNuevo) {
        setSprintId(idNuevo);
        setNoExiste(false);
      } else {
        throw new Error("No se pudo obtener el ID del nuevo ciclo de ideación.");
      }
    } catch (e: any) {
      setError(e?.message || "Error al crear el ciclo de ideación.");
    } finally {
      setCreando(false);
    }
  };

  if (buscando) {
    return (
      <p className="text-sm text-gray-500 dark:text-zinc-400 p-6">
        Buscando ciclo de ideación del equipo...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
        <button
          onClick={buscar}
          className="border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (noExiste) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h2 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
          Aún no hay un ciclo de ideación
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
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
      <p className="text-sm text-gray-500 dark:text-zinc-400 p-6">
        No se pudo determinar el ciclo de ideación.
      </p>
    );
  }

  return <DesignSprintPage sprintId={sprintId} usuId={usuId} esDocente={esDocente} />;
}