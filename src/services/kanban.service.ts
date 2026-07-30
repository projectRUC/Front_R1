import { fetchApi } from "./api";

export const kanbanService = {
  generateCriteria: async (titulo: string, descripcion: string): Promise<{ criterios: string }> => {
    return fetchApi("/ai/generate-criteria", {
      method: "POST",
      body: JSON.stringify({ titulo, descripcion }),
    });
  },
};
