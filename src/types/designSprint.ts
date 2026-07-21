export enum FaseDesignSprint {
  MAPEAR = 'mapear',
  BOCETAR = 'bocetar',
  DECIDIR = 'decidir',
  PROTOTIPAR = 'prototipar',
}

export const FASE_INFO: Record<FaseDesignSprint, { title: string; day: number; dayName: string; description: string }> = {
  [FaseDesignSprint.MAPEAR]: { title: 'Mapear', day: 1, dayName: 'Lunes', description: 'Definir el problema y mapear el desafío' },
  [FaseDesignSprint.BOCETAR]: { title: 'Bocetar', day: 2, dayName: 'Martes', description: 'Generar ideas y bocetar soluciones' },
  [FaseDesignSprint.DECIDIR]: { title: 'Decidir', day: 3, dayName: 'Miércoles', description: 'Seleccionar las mejores ideas' },
  [FaseDesignSprint.PROTOTIPAR]: { title: 'Prototipar', day: 4, dayName: 'Jueves', description: 'Crear prototipo para validar' },
};

export interface EvidenceFile {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface CreateEvidenceDTO {
  equipoId: number;
  proyectoId: string;
  fase: FaseDesignSprint;
  archivosUrls?: string[];
  comentarios?: string;
}

export interface DesignSprintEvidence {
  _id: string;
  equipoId: number;
  proyectoId: string;
  fase: FaseDesignSprint;
  fechaRegistro: string;
  comentarios: string;
  created_at: string;
  archivosUrls: string[];
}

export interface AvanceFase {
  fase: FaseDesignSprint;
  dia: string;
  iniciado: boolean;
  fechaRegistro: string | null;
  comentarios: string | null;
  cantidadArchivos: number;
}

export type AvanceDesignSprint = AvanceFase[];

export interface PhaseUIState {
  fase: FaseDesignSprint;
  status: 'completed' | 'pending' | 'blocked';
  hasEvidence: boolean;
}

export interface Evidence {
  id: string;
  phase: string;
  imageBase64: string;
  description?: string;
  createdAt: string;
}

export interface ApiErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}