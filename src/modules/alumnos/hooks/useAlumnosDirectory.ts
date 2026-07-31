import { useState, useEffect, useCallback } from 'react';
import { Alumno, PaginatedAlumnosResponse, AlumnosFilters } from '../types';


import { fetchApi } from '@/services/api';

export const useAlumnosDirectory = () => {
  const [data, setData] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación y filtros
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<AlumnosFilters>({
    grupo: '',
    equipo: '',
    buscar: '',
  });

  const [opcionesFiltros, setOpcionesFiltros] = useState({ grupos: [] as string[], equipos: [] as string[] });

  const fetchAlumnos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Construir Query Params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (filters.grupo) params.append('grupo', filters.grupo);
      if (filters.equipo) params.append('equipo', filters.equipo);
      if (filters.buscar) params.append('buscar', filters.buscar);

      // Usar fetchApi para enviar automáticamente las credenciales de sesión
      const result = await fetchApi<PaginatedAlumnosResponse>(`/alumnos?${params.toString()}`);
      
      setData(result.data);
      setTotalPages(result.meta.totalPages);

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al obtener los alumnos');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  // Cargar las opciones dinámicas de Grupos y Equipos
  useEffect(() => {
    const loadFiltros = async () => {
      try {
        const [resGrupos, resEquipos] = await Promise.all([
          fetchApi<any[]>('/grupos'),
          fetchApi<any[]>('/equipos')
        ]);
        setOpcionesFiltros({
          grupos: resGrupos.map(g => g.grupoNom),
          equipos: resEquipos.map(e => e.eqNom)
        });
      } catch (err) {
        console.error("No se pudieron cargar los filtros", err);
      }
    };
    loadFiltros();
  }, []);

  useEffect(() => {
    fetchAlumnos();
  }, [fetchAlumnos]);

  // Actualizadores de filtros
  const updateFilter = (key: keyof AlumnosFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Resetear a la primera página cuando cambian los filtros
  };

  return {
    data,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    filters,
    updateFilter,
    opcionesFiltros,
    refresh: fetchAlumnos,
  };
};
