"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Spinner } from "@heroui/react";
import {
  LineChart,
  Line,
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

interface ScrumMasterDashboardViewProps {
  equipoId: number;
}

export const ScrumMasterDashboardView: React.FC<ScrumMasterDashboardViewProps> = ({ equipoId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sprint, setSprint] = useState<string>("1"); // Default to sprint 1

  useEffect(() => {
    const loadData = async () => {
      if (!equipoId) return;
      try {
        setLoading(true);
        const res = await fetchApi(`/dashboard/metrics/scrum-master/${equipoId}/sprint/${sprint}`);
        setData(res);
      } catch (err) {
        console.error("Error al cargar métricas del Scrum Master", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [equipoId, sprint]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Dashboard Scrum Master - Sprint {sprint}
          </h1>
          <p className="text-gray-500">
            Monitorea el desempeño de tu equipo durante el Sprint.
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <select
            className="w-48 h-9 px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
          >
            <option value="1">Sprint 1</option>
            <option value="2">Sprint 2</option>
            <option value="3">Sprint 3</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">SP Planificados</p>
              <h3 className="text-3xl font-bold text-primary">{data?.spPlanificados || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">SP Completados</p>
              <h3 className="text-3xl font-bold text-success">{data?.spCompletados || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Actividades Pendientes</p>
              <h3 className="text-3xl font-bold text-warning">{data?.actividadesPendientes || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-default-500 font-medium">Actividades Atrasadas</p>
              <h3 className="text-3xl font-bold text-danger">{data?.actividadesAtrasadas || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown Chart */}
        <Card className="shadow-sm border border-default-200 h-96">
          <CardHeader>
            <h3 className="text-lg font-semibold">Burndown Chart</h3>
          </CardHeader>
          <CardContent>
            {data?.burndown && data.burndown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.burndown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ideal" name="Tendencia Ideal" stroke="#a1a1aa" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="stepAfter" dataKey="spRestantes" name="SP Restantes" stroke="#f5a524" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-default-400">
                Datos insuficientes para el burndown chart.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Effort by Member Chart */}
        <Card className="shadow-sm border border-default-200 h-96">
          <CardHeader>
            <h3 className="text-lg font-semibold">Esfuerzo por Integrante (SP)</h3>
          </CardHeader>
          <CardContent>
            {data?.esfuerzoPorIntegrante && data.esfuerzoPorIntegrante.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.esfuerzoPorIntegrante} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completado" name="Completado" fill="#17c964" stackId="a" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="pendiente" name="Pendiente" fill="#006FEE" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-default-400">
                No hay actividades asignadas a los integrantes.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
