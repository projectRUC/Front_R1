import {
  FaseDesignSprint,
  type CreateEvidenceDTO,
  type DesignSprintEvidence,
  type AvanceDesignSprint,
  type ApiErrorResponse,
} from '@/types/designSprint';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class DesignSprintApiError extends Error {
  constructor(public statusCode: number, message: string, public backendError?: string) {
    super(message);
    this.name = 'DesignSprintApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try { errorData = await response.json(); } catch {
      throw new DesignSprintApiError(response.status, `Error ${response.status}: ${response.statusText}`);
    }
    throw new DesignSprintApiError(errorData.statusCode || response.status, errorData.message || 'Error desconocido', errorData.error);
  }
  return response.json();
}

function getHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

export async function registrarEvidencia(data: CreateEvidenceDTO): Promise<DesignSprintEvidence> {
  console.log('📤 Enviando:', { ...data, archivosIds: data.archivosUrls  });
  const response = await fetch(`${API_BASE_URL}/design-sprint/evidencias`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
  });
  return handleResponse<DesignSprintEvidence>(response);
}

export async function consultarAvance(equipoId: number, proyectoId: string): Promise<AvanceDesignSprint> {
  const response = await fetch(`${API_BASE_URL}/design-sprint/equipos/${equipoId}/proyectos/${proyectoId}`, {
    method: 'GET', headers: getHeaders(),
  });
  return handleResponse<AvanceDesignSprint>(response);
}

export async function consultarFase(equipoId: number, proyectoId: string, fase: FaseDesignSprint): Promise<DesignSprintEvidence> {
  const response = await fetch(`${API_BASE_URL}/design-sprint/equipos/${equipoId}/proyectos/${proyectoId}/fases/${fase}`, {
    method: 'GET', headers: getHeaders(),
  });
  return handleResponse<DesignSprintEvidence>(response);
}