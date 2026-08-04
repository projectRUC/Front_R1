"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Spinner, Chip } from "@heroui/react";
import { fetchApi } from "@/services/api";

export const PersonalDashboardView = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchApi(`/dashboard/metrics/personal`);
        setData(res);
      } catch (err) {
        console.error("Error al cargar métricas personales", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'Terminado': return 'success';
      case 'Prueba': return 'warning';
      case 'En proceso': return 'primary';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Mi Dashboard Personal
        </h1>
        <p className="text-gray-500">
          Revisa tu progreso, horas registradas y tareas pendientes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Tareas Completadas</p>
              <h3 className="text-3xl font-bold text-success">{data?.tareasCompletadas || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Tareas Pendientes</p>
              <h3 className="text-3xl font-bold text-warning">{data?.tareasPendientes || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Horas Registradas (SP)</p>
              <h3 className="text-3xl font-bold text-primary">{data?.horasRegistradas || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Horas Pendientes (SP)</p>
              <h3 className="text-3xl font-bold text-default-600">{data?.horasPendientes || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border border-default-200">
          <CardHeader>
            <h3 className="text-lg font-semibold">Tu Progreso</h3>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-zinc-300">
                <span>Avance de responsabilidades asignadas</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(data?.porcentajeAvance || 0)}%
                </span>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-amber-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(Math.max(data?.porcentajeAvance || 0, 0), 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-default-500 mt-2">
              Basado en los Story Points / Horas estimadas.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-default-200">
          <CardHeader>
            <h3 className="text-lg font-semibold">Tus Actividades Pendientes</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {data?.listaPendientes && data.listaPendientes.length > 0 ? (
                data.listaPendientes.map((act: any) => (
                  <div key={act.id} className="flex justify-between items-center p-3 border border-default-100 rounded-lg hover:bg-default-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{act.nombre}</span>
                      <span className="text-xs text-gray-500">
                        Vence: {act.fechaFin ? new Date(act.fechaFin).toLocaleDateString() : 'Sin fecha'} | {act.estimacion} SP
                      </span>
                    </div>
                    <Chip size="sm" color={getStatusColor(act.estatus) as any} variant="soft">
                      {act.estatus}
                    </Chip>
                  </div>
                ))
              ) : (
                <div className="text-center text-default-500 py-6">
                  ¡Felicidades! No tienes tareas pendientes.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
