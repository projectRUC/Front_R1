import { fetchApi, fetchApiForm } from "@/services/api";
import { SprintDesign } from "@/types/designSprint";

export interface UpdateVoBoData {
  nombre_experto?: string;
  profesion_institucion?: string;
  comentarios_viabilidad?: string;
  dictamen?: string;
  vobo_docente?: boolean;
  nombreExperto?: string;
  profesionInstitucion?: string;
  comentariosViabilidad?: string;
  voboDocente?: boolean;
}

export interface PitchCoachResponse {
  puntuacion_general?: number;
  fortalezas?: string[];
  areas_mejora?: string[];
  sugerencias_pitch?: string[];
  [key: string]: any;
}

/**
 * Extrae de forma segura un ID en formato string.
 * Protege contra ObjectId serializados como objeto, evitando URLs con "[object Object]".
 */
export const extraerId = (valor: any): string => {
  if (!valor) return "";
  if (typeof valor === "string") return valor;
  if (typeof valor === "number") return String(valor);
  if (typeof valor === "object") {
    if (valor.$oid) return String(valor.$oid);
    if (typeof valor.toString === "function") {
      const s = valor.toString();
      if (s && s !== "[object Object]") return s;
    }
    if (valor._id) return extraerId(valor._id);
    if (valor.id) return extraerId(valor.id);
  }
  return "";
};

export const DesignSprintService = {
  crear: (eq_id: number, proyecto_id: string) =>
    fetchApi<SprintDesign>("/design-sprint", {
      method: "POST",
      body: JSON.stringify({ eq_id, proyecto_id }),
    }),

  obtenerPorId: (id: string) => fetchApi<SprintDesign>(`/design-sprint/${id}`),

  obtenerPorEquipoYProyecto: (eq_id: number, proyecto_id: string) =>
    fetchApi<SprintDesign>(`/design-sprint?eq_id=${eq_id}&proyecto_id=${proyecto_id}`),

  registrarMapeo: (
    id: string,
    data: { proyecto_problema: string; proyecto_objective: string; enfoque: string; comentario?: string },
    archivos: File[]
  ) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => v && form.append(k, v));
    archivos.forEach((f) => form.append("archivos", f));
    return fetchApiForm<SprintDesign>(`/design-sprint/${id}/mapeo`, form);
  },

  registrarBoceto: (
    id: string,
    data: { propuesta: string; usu_id: number; status?: string; comentario?: string },
    archivos: File[]
  ) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => v !== undefined && form.append(k, String(v)));
    archivos.forEach((f) => form.append("archivos", f));
    return fetchApiForm<SprintDesign>(`/design-sprint/${id}/boceto`, form);
  },

  puntuarBoceto: (
    id: string,
    bocetoId: string,
    data: { usu_id: number; valor?: number; comentario?: string }
  ) =>
    fetchApi<SprintDesign>(`/design-sprint/${id}/boceto/${bocetoId}/puntuacion`, {
      method: "POST",
      body: JSON.stringify({
        usu_id: Number(data.usu_id),
        valor: data.valor ?? 1,
        ...(data.comentario ? { comentario: data.comentario } : {}),
      }),
    }),

  registrarPrototipo: (
    id: string,
    data: { nombre_prototipo: string; descripcion: string },
    archivos: File[]
  ) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => v && form.append(k, v));
    archivos.forEach((f) => form.append("archivos", f));
    return fetchApiForm<SprintDesign>(`/design-sprint/${id}/prototipo`, form);
  },

  // ---------- COMENTARIOS Y RETROALIMENTACIÓN DOCENTE ----------

  agregarComentarioMapeo: (id: string, texto: string, usu_id: number) =>
    fetchApi<SprintDesign>(`/design-sprint/${id}/mapeo/comentario`, {
      method: "POST",
      body: JSON.stringify({ texto, usu_id: Number(usu_id) }),
    }),

  agregarComentarioBoceto: (id: string, bocetoId: string, texto: string, usu_id: number) =>
    fetchApi<SprintDesign>(`/design-sprint/${id}/boceto/${bocetoId}/comentario`, {
      method: "POST",
      body: JSON.stringify({ texto, usu_id: Number(usu_id) }),
    }),

  agregarComentarioPrototipo: (id: string, texto: string, usu_id: number) =>
    fetchApi<SprintDesign>(`/design-sprint/${id}/prototipo/comentario`, {
      method: "POST",
      body: JSON.stringify({ texto, usu_id: Number(usu_id) }),
    }),

  agregarComentarioGeneral: (id: string, texto: string, usu_id: number) =>
    fetchApi<SprintDesign>(`/design-sprint/${id}/comentario-general`, {
      method: "POST",
      body: JSON.stringify({ texto, usu_id: Number(usu_id) }),
    }),

  // ---------- VALIDACIÓN Y VOBO (Viernes) ----------

  actualizarVoBo: (id: string, data: UpdateVoBoData) => {
    const nombreExperto = data.nombre_experto ?? data.nombreExperto;
    const profesionInstitucion = data.profesion_institucion ?? data.profesionInstitucion;
    const comentariosViabilidad = data.comentarios_viabilidad ?? data.comentariosViabilidad;
    const dictamen = data.dictamen;
    const voboDocente = data.vobo_docente ?? data.voboDocente;

    const dtoPayload: Record<string, any> = {};

    if (nombreExperto !== undefined && nombreExperto !== null) {
      dtoPayload.nombre_experto = String(nombreExperto);
    }
    if (profesionInstitucion !== undefined && profesionInstitucion !== null) {
      dtoPayload.profesion_institucion = String(profesionInstitucion);
    }
    if (comentariosViabilidad !== undefined && comentariosViabilidad !== null) {
      dtoPayload.comentarios_viabilidad = String(comentariosViabilidad);
    }
    if (dictamen !== undefined && dictamen !== null) {
      dtoPayload.dictamen = String(dictamen);
    }
    if (voboDocente !== undefined && voboDocente !== null) {
      dtoPayload.vobo_docente = Boolean(voboDocente);
    }

    console.log("ID:", id);
    console.log("Payload:", dtoPayload);

    return fetchApi<SprintDesign>(`/design-sprint/${id}/vobo`, {
      method: "PATCH",
      body: JSON.stringify(dtoPayload),
    });
  },

  // ---------- IA PITCH COACH ----------

  ejecutarPitchCoach: (id: string) =>
    fetchApi<PitchCoachResponse>(`/design-sprint/${id}/ai-pitch-coach`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};