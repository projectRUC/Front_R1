import { fetchApi } from "./api";

export interface UserProfile {
  id: number;
  nombre: string;
  correo: string;
  rol: "Alumno" | "Scrum Master" | "Docente" | string;
  grupo?: string | null;
}

export interface ProyectoCard {
  id: number | string;
  nombreProyecto: string;
  nombreEquipo: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  grupo?: string;
}

export interface MiembroEquipo {
  nombre: string;
  rol: string;
  correo: string;
}

export interface EquipoCard {
  id: number;
  nombreEquipo: string;
  nombreProyecto: string;
  grupo?: string;
  miembros: MiembroEquipo[];
}

export interface ActividadCard {
  id: string;
  nombreActividad: string;
  nombreProyecto: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  estatus: string;
  soyAsignado?: boolean;
}

export interface AlumnoCard {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: string;
  grupo: string;
  equipos: {
    nombreEquipo: string;
    rol: string;
    proyecto?: string;
  }[];
}

export interface AlumnoProyectosEquiposResponse {
  proyectos: ProyectoCard[];
  equipos: EquipoCard[];
}

/**
 * Servicio de Dashboard para consumir los endpoints optimizados
 * y renderizar tarjetas sin recarga de datos pesados innecesarios.
 */
export const dashboardService = {
  getCurrentUser: () => fetchApi<UserProfile>("/auth/me"),
  getAlumnoProyectosEquipos: () =>
    fetchApi<AlumnoProyectosEquiposResponse>("/dashboard/alumno/proyectos-equipos"),
  getAlumnoActividades: () =>
    fetchApi<ActividadCard[]>("/dashboard/alumno/actividades"),
  getDocenteProyectos: () =>
    fetchApi<ProyectoCard[]>("/dashboard/docente/proyectos"),
  getDocenteAlumnos: () =>
    fetchApi<AlumnoCard[]>("/dashboard/docente/alumnos"),
};
