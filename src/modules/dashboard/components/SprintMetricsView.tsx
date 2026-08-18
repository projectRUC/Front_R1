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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { fetchApi } from "@/services/api";

const COLORS = ['#006FEE', '#17c964', '#f5a524', '#f31260', '#7828c8', '#c4841d'];

export const SprintMetricsView = ({ equipoId }: { equipoId: number }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sprint, setSprint] = useState<string>("1");

  useEffect(() => {
    const loadData = async () => {
      if (!equipoId) return;
      try {
        setLoading(true);
        const res = await fetchApi(`/dashboard/metrics/scrum-master/${equipoId}/sprint/${sprint}`);
        setData(res);
      } catch (err) {
        console.error("Error al cargar métricas del Sprint", err);
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

  // Preparamos datos para la gráfica de Pay/Pie
  const pieData = data?.esfuerzoPorIntegrante?.map((e: any) => ({
    name: e.nombre,
    value: e.completado + e.pendiente
  })) || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Métricas del Sprint
          </h1>
          <p className="text-gray-500">
            Análisis de rendimiento, velocidad e indicadores clave.
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

      {/* Basic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border border-default-200 bg-primary-50">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-primary-700 font-medium">Velocidad Actual (SP Completados)</p>
              <h3 className="text-4xl font-bold text-primary">{data?.spCompletados || 0} <span className="text-lg font-normal">/ {data?.spPlanificados || 0}</span></h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200 bg-warning-50">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-warning-700 font-medium">Tareas Pendientes</p>
              <h3 className="text-4xl font-bold text-warning-700">{data?.actividadesPendientes || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-default-200 bg-danger-50">
          <CardContent className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-danger-700 font-medium">Tareas Atrasadas</p>
              <h3 className="text-4xl font-bold text-danger-700">{data?.actividadesAtrasadas || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Effort Distribution Bar */}
        <Card className="shadow-sm border border-default-200 h-[400px]">
          <CardHeader>
            <h3 className="text-lg font-semibold">Desglose de Esfuerzo (SP)</h3>
          </CardHeader>
          <CardContent>
            {data?.esfuerzoPorIntegrante && data.esfuerzoPorIntegrante.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.esfuerzoPorIntegrante} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="nombre" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completado" name="Completado" fill="#17c964" stackId="a" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="pendiente" name="Pendiente" fill="#f5a524" stackId="a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-default-400">
                Sin datos de integrantes.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Capacity Pie */}
        <Card className="shadow-sm border border-default-200 h-[400px]">
          <CardHeader>
            <h3 className="text-lg font-semibold">Distribución de Carga de Trabajo</h3>
          </CardHeader>
          <CardContent>
            {pieData && pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} SP`, 'Asignados']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-default-400">
                Sin datos suficientes.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
