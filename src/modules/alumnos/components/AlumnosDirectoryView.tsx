'use client';

import React from 'react';
import { Input } from '@heroui/react';
import { useAlumnosDirectory } from '../hooks/useAlumnosDirectory';
import { AlumnosTable } from './AlumnosTable';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export const AlumnosDirectoryView: React.FC = () => {
  const { 
    data, 
    isLoading, 
    error, 
    page, 
    setPage, 
    totalPages, 
    filters, 
    updateFilter,
    opcionesFiltros
  } = useAlumnosDirectory();

  const { user, loading: userLoading } = useUser();

  // Mostrar spinner general si se está cargando el usuario
  if (userLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 font-medium text-sm">Verificando permisos...</span>
        </div>
      </div>
    );
  }

  // Protección de ruta: Solo docentes
  if (user?.rol !== 'Docente') {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center px-4 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
          Esta sección es exclusiva para personal docente. No tienes los permisos necesarios para visualizar el padrón general de alumnos.
        </p>
        <Link 
          href="/dashboard"
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Padrón de Alumnos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona y visualiza la lista completa de estudiantes inscritos en el sistema.
          </p>
        </div>
      </div>

      {/* Barra de Herramientas y Filtros */}
      <div className="flex flex-col md:flex-row items-end gap-4 p-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        
        <div className="w-full md:flex-1 md:min-w-[300px]">
          <Input
            placeholder="Buscar por nombre del alumno..."
            value={filters.buscar}
            onChange={(e) => updateFilter('buscar', e.target.value)}
            className="w-full text-ellipsis"
          />
        </div>

        <div className="w-full md:w-64">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Grupo Escolar</label>
          <div className="relative">
            <select
              value={filters.grupo}
              onChange={(e) => updateFilter('grupo', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 dark:text-white shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Todos los grupos</option>
              {opcionesFiltros.grupos.map((grupo) => (
                <option key={grupo} value={grupo}>
                  {grupo}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Equipo / Proyecto</label>
          <div className="relative">
            <select
              value={filters.equipo}
              onChange={(e) => updateFilter('equipo', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 dark:text-white shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Todos los equipos</option>
              {opcionesFiltros.equipos.map((equipo) => (
                <option key={equipo} value={equipo}>
                  {equipo}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

      </div>

      {/* Manejo de Error de Red */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-medium text-sm text-center">
          {error}
        </div>
      )}

      {/* Tabla Paginada */}
      <AlumnosTable 
        data={data}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
      
    </div>
  );
};
