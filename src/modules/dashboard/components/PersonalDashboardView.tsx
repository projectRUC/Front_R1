"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Spinner, Chip, Progress } from "@heroui/react";
import { fetchApi } from "@/services/api";
import { EstatusActividad } from "@/types/actividad";

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
        <Spinner size="lg" label="Cargando tus métricas..." />
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
            <Progress 
              size="lg"
              radius="md"
              classNames={{
                base: "max-w-md",
                track: "drop-shadow-md border border-default",
                indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                label: "tracking-wider font-medium text-default-600",
                value: "text-foreground/60",
              }}
              label="Avance de responsabilidades asignadas"
              value={data?.porcentajeAvance || 0}
              showValueLabel={true}
            />
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
                    <Chip size="sm" color={getStatusColor(act.estatus) as any} variant="flat">
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
