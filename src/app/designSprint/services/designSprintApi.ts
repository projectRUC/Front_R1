import { fetchApi, fetchApiForm } from "@/services/api";
import { SprintDesign } from "@/types/designSprint";

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

  // CORREGIDO: Cumple exactamente con CreatePuntuacionDto
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
};