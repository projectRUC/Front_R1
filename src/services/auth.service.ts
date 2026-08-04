import { fetchApi } from './api';

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo: string;
  password: string;
  rolId: number;
  grupoId: number;
}

export const authService = {
  /**
   * Inicia sesión autenticando credenciales y estableciendo cookie HttpOnly
   */
  async login(credentials: LoginCredentials): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        correo: credentials.correo.trim().toLowerCase(),
        password: credentials.password,
      }),
    });
  },

  /**
   * Registra un nuevo usuario en la plataforma
   */
  async register(data: RegisterPayload): Promise<any> {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        correo: data.correo.trim().toLowerCase(),
      }),
    });
  },

  /**
   * Reactiva una cuenta inactiva e inicia sesión inmediatamente
   */
  async reactivar(credentials: LoginCredentials): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/auth/reactivar', {
      method: 'POST',
      body: JSON.stringify({
        correo: credentials.correo.trim().toLowerCase(),
        password: credentials.password,
      }),
    });
  },

  /**
   * Cierra la sesión en el servidor y limpia la cookie
   */
  async logout(): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Obtiene la lista pública de grupos para el registro de alumnos
   */
  async getGrupos(): Promise<{ grupoId: number; grupoNom: string; grupoDesc?: string | null }[]> {
    return fetchApi<{ grupoId: number; grupoNom: string; grupoDesc?: string | null }[]>('/auth/grupos', {
      method: 'GET',
    });
  },

  /**
   * Obtiene la información básica del usuario autenticado
   */
  async getMe(): Promise<any> {
    return fetchApi('/auth/me', {
      method: 'GET',
    });
  },
};
