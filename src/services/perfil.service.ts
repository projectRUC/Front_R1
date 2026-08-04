import { fetchApi } from './api';

export interface UsuarioPerfilDetalle {
  id?: number;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
  nombreCompleto?: string;
  correo?: string;
  rol?: string;
  rolId?: number;
  grupoId?: number | null;
  grupo?: string | { grupoId: number; grupoNom: string; grupoDesc?: string | null } | null;
  estadoCuenta?: 'ACTIVO' | 'INACTIVO' | 'ANONIMIZADO' | 'PAUSADO';
  oposicionTratamiento?: boolean;
  createdAt?: string;

  // Aliases para compatibilidad
  usuId?: number;
  usuNom?: string;
  usuApp?: string;
  usuApm?: string | null;
  usuEmail?: string;
  rolUsuario?: {
    rolUsuId: number;
    rolUsuNom: string;
    rolUsuDesc?: string | null;
  };
}

export interface UpdatePerfilDto {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  grupoId?: number | null;
}

export interface GrupoItem {
  grupoId: number;
  grupoNom: string;
  grupoDesc?: string | null;
}

export interface CambiarPasswordDto {
  passwordActual: string;
  passwordNuevo: string;
}

export const perfilService = {
  /**
   * Derecho de Acceso ARCO: Obtiene la información completa del usuario autenticado
   */
  async getPerfil(): Promise<UsuarioPerfilDetalle> {
    return fetchApi<UsuarioPerfilDetalle>('/perfil/mi-cuenta', {
      method: 'GET',
    });
  },

  /**
   * Derecho de Rectificación ARCO: Actualiza los datos del usuario autenticado
   */
  async updatePerfil(data: UpdatePerfilDto): Promise<{ message: string; usuario: UsuarioPerfilDetalle }> {
    return fetchApi<{ message: string; usuario: UsuarioPerfilDetalle }>('/perfil/actualizar', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cambio de Contraseña: Valida contraseña actual y cifra la nueva contraseña
   */
  async cambiarPassword(data: CambiarPasswordDto): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/perfil/cambiar-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Derecho de Oposición ARCO: Actualiza la preferencia de oposición al tratamiento de datos (LGPDPPSO)
   */
  async updateOposicion(oposicion: boolean): Promise<{ message: string; oposicionTratamiento: boolean }> {
    return fetchApi<{ message: string; oposicionTratamiento: boolean }>('/perfil/oposicion', {
      method: 'PATCH',
      body: JSON.stringify({ oposicion }),
    });
  },

  /**
   * Pausa / Desactiva temporalmente la cuenta del usuario autenticado
   */
  async desactivarCuenta(): Promise<{ message: string; estadoCuenta: string }> {
    return fetchApi<{ message: string; estadoCuenta: string }>('/perfil/desactivar', {
      method: 'PATCH',
    });
  },

  /**
   * Reactiva una cuenta previamente pausada
   */
  async reactivarCuenta(correo?: string, password?: string): Promise<{ message: string }> {
    if (correo && password) {
      return fetchApi<{ message: string }>('/auth/reactivar', {
        method: 'POST',
        body: JSON.stringify({ correo: correo.trim().toLowerCase(), password }),
      });
    }

    return fetchApi<{ message: string }>('/perfil/reactivar', {
      method: 'PATCH',
    });
  },

  /**
   * Derecho de Cancelación ARCO: Anonimiza irreversiblemente todos los datos personales del usuario (Cero PII)
   */
  async cancelarCuenta(): Promise<{ message: string; estadoCuenta: string }> {
    return fetchApi<{ message: string; estadoCuenta: string }>('/perfil/cancelar', {
      method: 'DELETE',
    });
  },

  /**
   * Obtiene la lista de grupos disponibles para el selector de estudiantes
   */
  async getGrupos(): Promise<GrupoItem[]> {
    return fetchApi<GrupoItem[]>('/grupos', {
      method: 'GET',
    });
  },
};
