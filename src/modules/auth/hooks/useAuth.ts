import { useState } from "react";
import { useRouter } from "next/navigation";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (correo: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ correo: correo.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const data = await res.json();
        let errorMsg = data.message || "Error al iniciar sesión";
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg[0];
        }
        throw new Error(errorMsg);
      }

      // La cookie HttpOnly ya fue establecida por el backend
      // Establecemos una cookie de bandera (flag) que JS SÍ pueda leer para protección del cliente
      document.cookie =
        "is_logged_in=true; path=/; max-age=28800; samesite=lax";

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...userData,
        ...(userData.correo && {
          correo: userData.correo.trim().toLowerCase(),
        }),
      };
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        let errorMsg = data.message || "Error al registrarse";
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg[0];
        }
        throw new Error(errorMsg);
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al registrarse.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    // 1. SIEMPRE primero borramos la cookie local del frontend (Next.js) en su propio bloque aislado.
    // Esto garantiza que la sesión se cierre en el navegador incluso si el backend NestJS está apagado o falla.
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.warn("Advertencia al limpiar cookies en ruta local de Next.js:", err);
    }

    // 2. Notificamos al backend NestJS para limpiar la sesión en servidor (silencioso en fallo de red/servidor apagado)
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Si el backend no está corriendo en localhost:4000 o se está reiniciando, el cierre de sesión local de Next.js procede normalmente de forma silenciosa.
    }

    // 3. Limpiamos exhaustivamente cualquier cookie desde el cliente JS combinando directivas
    document.cookie = "is_logged_in=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    document.cookie = "access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    document.cookie = "access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict";

    setIsLoading(false);
    
    // 4. Redireccionamos directamente al login reemplazando el historial para no dejar ciclos de retroceso
    window.location.replace("/login");
  };

  return {
    login,
    register: registerUser,
    logout,
    isLoading,
    error,
  };
};
