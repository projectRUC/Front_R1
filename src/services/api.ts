const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Cliente HTTP unificado para el consumo de la API REST del backend NestJS.
 * Utiliza credentials: "include" para enviar automáticamente las cookies HttpOnly de sesión.
 * Maneja de forma controlada desconexiones del servidor local (Failed to fetch).
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
    // Si el servidor backend no está corriendo o hay bloqueo de red
    if (err instanceof TypeError || err?.message?.includes("fetch") || err?.name === "TypeError") {
      console.warn(`[Servidor Offline] Inaccesible: ${url}. ¿Está corriendo 'npm run start:dev' en Back_R1?`);
      throw new Error("No se pudo contactar con el servidor (API offline). Asegúrate de iniciar Back_R1 en el puerto 4000.");
    }
    throw err;
  }

  if (!response.ok) {
    let errorMessage = `Error en la solicitud HTTP (${response.status})`;
    try {
      const errorData = await response.json();
      errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || errorMessage;
    } catch {
      // Si la respuesta no es JSON, conservar mensaje por defecto
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
