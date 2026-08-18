import { fetchApi } from "@/services/api";
import { FileEntity } from "@/types/designSprint";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const FilesService = {
  listar: () => fetchApi<FileEntity[]>("/files"),

  obtener: (id: string) => fetchApi<FileEntity>(`/files/${id}`),

  eliminar: (id: string) =>
    fetchApi<{ message: string }>(`/files/${id}`, { method: "DELETE" }),

  // Arma la URL pública completa a partir del "url" relativo que guarda FileEntity
  urlPublica: (archivo: FileEntity) => `${API_BASE_URL}${archivo.url}`,
};