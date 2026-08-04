export type EstadoCuenta = 'ACTIVO' | 'INACTIVO' | 'ANONIMIZADO' | 'PAUSADO';

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: 'Alumno' | 'Scrum Master' | 'Docente' | string;
  grupoId?: number;
  grupo?: string | null;
  estadoCuenta?: 'ACTIVO' | 'INACTIVO' | 'ANONIMIZADO';
  oposicionTratamiento?: boolean;
}

export interface Usuario extends User {}
