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
        comentario: data.comentario,
      }),
    }),

  // ... registrarPrototipo
};
  