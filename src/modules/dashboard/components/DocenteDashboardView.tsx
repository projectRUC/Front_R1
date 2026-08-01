"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Spinner } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchApi } from "@/services/api";

export const DocenteDashboardView = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar qué equipo se ha seleccionado para ver detalles
  const [selectedEquipoId, setSelectedEquipoId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchApi("/dashboard/metrics/docente");
        setData(res);
      } catch (err) {
        console.error("Error al cargar métricas de docente", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" label="Cargando métricas del docente..." />
      </div>
    );
  }

  // Obtenemos los datos del equipo seleccionado si existe
  const selectedTeamData = data?.histograma?.find((t: any) => t.equipoId === selectedEquipoId);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Dashboard General - Docente
          </h1>
          <p className="text-gray-500">
            Monitorea el progreso de los equipos. Haz clic en una tarjeta para ver sus detalles.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Proyectos Activos</p>
              <h3 className="text-3xl font-bold text-primary">{data?.resumen?.proyectosActivos || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Proyectos Finalizados</p>
              <h3 className="text-3xl font-bold text-success">{data?.resumen?.proyectosFinalizados || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Actividades Pendientes</p>
              <h3 className="text-3xl font-bold text-warning">{data?.resumen?.pendientes || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Actividades Atrasadas</p>
              <h3 className="text-3xl font-bold text-danger">{data?.resumen?.vencidas || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de Equipos / Proyectos */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Equipos y Proyectos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.histograma?.map((equipo: any) => (
            <Card 
              key={equipo.equipoId} 
              onClick={() => setSelectedEquipoId(equipo.equipoId)}
              className={`cursor-pointer shadow-sm border transition-colors text-left ${selectedEquipoId === equipo.equipoId ? 'border-primary bg-primary-50 dark:bg-primary-900/20' : 'border-default-200 hover:border-primary/50'}`}
            >
              <CardContent className="p-4 flex flex-col gap-3 w-full">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{equipo.nombreEquipo}</h3>
                    <p className="text-sm text-default-500">{equipo.nombreProyecto}</p>
                  </div>
                  <span className="text-xl font-bold text-primary">{equipo.porcentaje}%</span>
                </div>
                
                <div className="w-full">
                  <div className="w-full bg-default-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${equipo.porcentaje}%` }}></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-default-500 w-full">
                  <span>Tareas: {equipo.actividadesCompletadas}/{equipo.totalActividades}</span>
                  <span>SP: {equipo.storyPointsCompletados}/{equipo.totalStoryPoints}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!data?.histograma || data.histograma.length === 0) && (
            <p className="text-default-400">No hay equipos registrados.</p>
          )}
        </div>
      </div>

      {/* Vista Detallada del Equipo Seleccionado */}
      {selectedTeamData && (
        <div className="mt-4 flex flex-col gap-4 animate-appearance-in">
          <h2 className="text-xl font-bold border-b border-default-200 pb-2 text-gray-800 dark:text-gray-100">
            Detalle del Equipo: <span className="text-primary">{selectedTeamData.nombreEquipo}</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfica 1: Story Points del Proyecto */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader>
                <h3 className="text-lg font-semibold">Story Points: Completados vs Estimados</h3>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[selectedTeamData]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="nombreProyecto" />
                      <YAxis />
                      <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                      <Legend />
                      <Bar dataKey="totalStoryPoints" name="SP Totales" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="storyPointsCompletados" name="SP Completados" fill="#17c964" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfica 2: Esfuerzo por Integrante */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader>
                <h3 className="text-lg font-semibold">Esfuerzo por Integrante (SP)</h3>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  {selectedTeamData.miembrosEsfuerzo && selectedTeamData.miembrosEsfuerzo.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedTeamData.miembrosEsfuerzo} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="nombre" type="category" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                        <Legend />
                        <Bar dataKey="completado" name="Completados" stackId="a" fill="#17c964" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="pendiente" name="Pendientes" stackId="a" fill="#f5a524" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-default-400">
                      No hay integrantes asignados a tareas.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
          </div>
        </div>
      )}
    </div>
  );
};
