import axios from 'axios';

// Instancia centralizada para llamadas Axios si se necesitan
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export default api;

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `/api${cleanEndpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
    });
  } catch (err: any) {
    if (
      err instanceof TypeError ||
      err?.message?.includes("fetch") ||
      err?.name === "TypeError"
    ) {
      console.warn(`[Servidor Inaccesible]: ${url}`);
      throw new Error("No se pudo contactar con el servidor. Verifica tu conexión.");
    }
    throw err;
  }

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `Error en la solicitud HTTP (${response.status})`;
    if (text) {
      try {
        const errorData = JSON.parse(text);
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || errorMessage;
      } catch {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }

  return text ? JSON.parse(text) : (null as unknown as T);
}

export async function fetchApiForm<T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `/api${cleanEndpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      ...options,
      headers: {
        ...(options.headers || {}),
      },
      body: formData,
      credentials: "include",
    });
  } catch (err: any) {
    if (
      err instanceof TypeError ||
      err?.message?.includes("fetch") ||
      err?.name === "TypeError"
    ) {
      console.warn(`[Servidor Inaccesible]: ${url}`);
      throw new Error("No se pudo contactar con el servidor. Verifica tu conexión.");
    }
    throw err;
  }

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `Error en la solicitud HTTP (${response.status})`;
    if (text) {
      try {
        const errorData = JSON.parse(text);
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || errorMessage;
      } catch {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }

  return text ? JSON.parse(text) : (null as unknown as T);
}
