export interface FileEntity {
  _id?: string;
  originalName: string;
  fileName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  extension: string;
  uploadedBy?: string | null;
  category: string;
}

export interface Comentario {
  _id?: string;
  usu_id?: number;
  texto: string;
  fecha?: string;
}

export interface Mapeo {
  proyecto_problema?: string;
  proyecto_objective?: string;
  enfoque?: string;
  meta_a_largo_plazo?: string;
  preguntas_como_podriamos?: string[];
  archivos?: FileEntity[];
  comentarios?: Comentario[];
}

export interface Puntuacion {
  _id?: string;
  usu_id: number;
  valor: number;
  comentario?: string;
}

export interface Boceto {
  _id: string;
  propuesta: string;
  usu_id: number;
  status?: string;
  archivos?: FileEntity[];
  puntuaciones?: Puntuacion[];
  comentarios?: Comentario[];
  created_at?: string;
}

export interface Prototipo {
  nombre_prototipo?: string;
  descripcion?: string;
  enlace?: string;
  archivos?: FileEntity[];
  comentarios?: Comentario[];
}

export interface VoBo {
  nombre_experto?: string;
  profesion_institucion?: string;
  comentarios_viabilidad?: string;
  dictamen?: string;
  vobo_docente?: boolean;
}

export interface PitchCoachAnalysis {
  puntuacion_general?: number;
  fortalezas?: string[];
  areas_mejora?: string[];
  sugerencias_pitch?: string[];
  [key: string]: any;
}

export interface SprintDesign {
  _id: string;
  eq_id: number;
  proyecto_id: string;
  status?: string;
  mapeo?: Mapeo;
  bocetos?: Boceto[];
  prototipo?: Prototipo;
  vobo?: VoBo;
  entrevistas?: any[];
  comentarios_generales?: Comentario[];
  created_at?: string;
  updated_at?: string;
}