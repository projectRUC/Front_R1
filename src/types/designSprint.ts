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
  usu_id?: number;
  texto: string;
}

export interface Mapeo {
  proyecto_problema: string;
  proyecto_objective: string;
  enfoque: string;
  archivos: FileEntity[];
  comentarios: Comentario[];
}

export interface Puntuacion {
  usu_id: number;
  valor: number;
  comentario?: Comentario;
}

export interface Boceto {
  _id: string;
  propuesta: string;
  usu_id: number;
  status: string;
  archivos: FileEntity[];
  puntuaciones: Puntuacion[];
  comentarios: Comentario[];
  created_at?: string;
}

export interface Prototipo {
  nombre_prototipo: string;
  descripcion: string;
  archivos: FileEntity[];
  comentarios: Comentario[];
}

export interface SprintDesign {
  _id: string;
  eq_id: number;
  proyecto_id: string;
  status: string;
  mapeo?: Mapeo;
  bocetos: Boceto[];
  prototipo?: Prototipo;
  entrevistas: any[];
  comentarios_generales: Comentario[];
}