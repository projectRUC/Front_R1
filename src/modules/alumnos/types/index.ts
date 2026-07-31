export interface Alumno {
  id: number | string;
  nombre: string;
  grupo: string;
  equipoProyecto: string;
  rol: string;
  avatarUrl?: string;
}

export interface PaginatedAlumnosResponse {
  data: Alumno[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AlumnosFilters {
  grupo: string;
  equipo: string;
  buscar: string;
}
