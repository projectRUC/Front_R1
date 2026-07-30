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
  equipoId?: number;
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
  proyectoId?: number | null;
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

export interface CrearProyectoEquipoPayload {
  nombreProyecto: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  nombreEquipo: string;
}

export interface CrearProyectoEquipoResponse {
  message: string;
  proyectoId: number;
  equipoId: number;
}

export interface SprintPeriodo {
  num_sprint?: number;
  num_parcial?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  objetivo?: string;
  aprobado?: boolean;
  docenteAprobadorId?: number;
  fechaAprobacion?: string;
  comentariosDocente?: string;
}

export interface ActividadProyectoItem {
  id: string;
  nombreActividad: string;
  nombreProyecto: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  estatus: string;
  usuarioAsignado: string;
}

export interface CandidatoAlumno {
  usuId: number;
  nombreCompleto: string;
  correo: string;
  grupo: string;
}

export interface DetalleProyectoEquipoResponse {
  equipo: {
    id: number;
    nombre: string;
    grupo: string;
    creador: string;
    miembros: {
      usuId: number;
      nombre: string;
      rol: string;
      correo: string;
      esCreador: boolean;
    }[];
  };
  proyecto: {
    id: number | string;
    mongoId?: string | null;
    nombre: string;
    descripcion: string;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    parciales: SprintPeriodo[];
    sprints: SprintPeriodo[];
  };
  actividades: ActividadProyectoItem[];
  rolesDisponibles?: string[];
  candidatos?: CandidatoAlumno[];
}

/**
 * Servicio de Dashboard para consumir los endpoints optimizados
 * y renderizar tarjetas sin recarga de datos pesados innecesarios.
 */
export const dashboardService = {
  getCurrentUser: () => fetchApi<UserProfile>("/auth/me", { method: "POST" }),
  getAlumnoProyectosEquipos: () =>
    fetchApi<AlumnoProyectosEquiposResponse>("/dashboard/alumno/proyectos-equipos"),
  getAlumnoActividades: () =>
    fetchApi<ActividadCard[]>("/dashboard/alumno/actividades"),
  getDocenteProyectos: () =>
    fetchApi<ProyectoCard[]>("/dashboard/docente/proyectos"),
  getDocenteAlumnos: () =>
    fetchApi<AlumnoCard[]>("/dashboard/docente/alumnos"),
  crearProyectoEquipo: (payload: CrearProyectoEquipoPayload) =>
    fetchApi<CrearProyectoEquipoResponse>("/dashboard/alumno/crear-proyecto-equipo", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getDetalleProyectoEquipo: (equipoId: number) =>
    fetchApi<DetalleProyectoEquipoResponse>(`/dashboard/detalle-proyecto-equipo/${equipoId}`),
  
  // BFF Edición para Alumno / Scrum Master
  updateProyectoInfo: (equipoId: number, payload: { nombre?: string; descripcion?: string; fechaInicio?: string; fechaFin?: string }) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/info`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  createSprints: (equipoId: number, cantidad: number) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/sprints`, {
      method: "POST",
      body: JSON.stringify({ cantidad }),
    }),
  updateSprint: (equipoId: number, numSprint: number, payload: { fechaInicio?: string; fechaFin?: string; objetivo?: string }) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/sprints/${numSprint}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  createParciales: (equipoId: number, cantidad: number) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/parciales`, {
      method: "POST",
      body: JSON.stringify({ cantidad }),
    }),
  updateParcial: (equipoId: number, numParcial: number, payload: { fechaInicio?: string; fechaFin?: string; objetivo?: string }) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/parciales/${numParcial}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  aprobarParcial: (equipoId: number, numParcial: number, payload: { comentarios: string }) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/parciales/${numParcial}/aprobar`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  createActividad: (equipoId: number, payload: { nombreActividad: string; fechaInicio: string; fechaFin: string; usuarioAsignadoId: number }) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/actividades`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Gestión de Miembros y Roles
  addMiembroEquipo: (equipoId: number, payload: { usuId: number; rol: string }) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/miembros`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateRolMiembro: (equipoId: number, usuId: number, payload: { rol: string }) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/miembros/${usuId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  removeMiembroEquipo: (equipoId: number, usuId: number) =>
    fetchApi<{ message: string }>(`/dashboard/detalle-proyecto-equipo/${equipoId}/miembros/${usuId}`, {
      method: "DELETE",
    }),

  // Tablero Kanban
  updateActividadEstatus: (actividadId: string, estatus: string) =>
    fetchApi<{ message: string; estatus: string }>(`/dashboard/actividades/${actividadId}/estatus`, {
      method: "PATCH",
      body: JSON.stringify({ estatus }),
    }),
};
