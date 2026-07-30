const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

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
      console.warn(
        `[Servidor Offline] Inaccesible: ${url}. ¿Está corriendo 'npm run start:dev' en Back_R1?`,
      );
      throw new Error(
        "No se pudo contactar con el servidor (API offline). Asegúrate de iniciar Back_R1 en el puerto 4000.",
      );
    }
    throw err;
  }

  // Leemos el cuerpo como texto plano primero para evitar crash en respuestas vacías
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

  // Si la respuesta está vacía (status 204 o retorno null), devuelve null sin fallar
  return text ? JSON.parse(text) : (null as unknown as T);
}

/**
 * Variante para envíos multipart/form-data (subida de archivos).
 * NO se fija Content-Type manualmente: el navegador debe generar el boundary
 * automáticamente al ver que el body es un FormData. Si forzamos
 * "application/json" aquí, el backend (Multer) no podrá parsear los archivos.
 */
export async function fetchApiForm<T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      ...options,
      body: formData,
      credentials: "include",
    });
  } catch (err: any) {
    if (
      err instanceof TypeError ||
      err?.message?.includes("fetch") ||
      err?.name === "TypeError"
    ) {
      console.warn(
        `[Servidor Offline] Inaccesible: ${url}. ¿Está corriendo 'npm run start:dev' en Back_R1?`,
      );
      throw new Error(
        "No se pudo contactar con el servidor (API offline). Asegúrate de iniciar Back_R1 en el puerto 4000.",
      );
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
