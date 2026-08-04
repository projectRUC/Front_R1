import { useState } from "react";
import { useRouter } from "next/navigation";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccountPaused, setIsAccountPaused] = useState(false);
  const router = useRouter();

  const login = async (correo: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setIsAccountPaused(false);
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
        const data = await res.json().catch(() => ({}));
        let errorMsg = data.message || "Error al iniciar sesión";
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg[0];
        }

        // Detección de cuenta pausada / inactiva
        if (
          res.status === 403 ||
          data.error === "ACCOUNT_PAUSED" ||
          (typeof errorMsg === "string" &&
            (errorMsg.includes("pausada") ||
              errorMsg.includes("inactiva") ||
              errorMsg.includes("ACCOUNT_PAUSED")))
        ) {
          setIsAccountPaused(true);
          const err = new Error(errorMsg);
          (err as any).code = "ACCOUNT_PAUSED";
          throw err;
        }

        throw new Error(errorMsg);
      }

      // La cookie HttpOnly ya fue establecida por el backend
      // Establecemos una cookie de bandera (flag) que JS SÍ pueda leer para protección del cliente
      document.cookie =
        "is_logged_in=true; path=/; max-age=28800; samesite=lax";

      router.push("/dashboard");
    } catch (err: any) {
      if (err.code !== "ACCOUNT_PAUSED") {
        setError(err.message || "Ocurrió un error inesperado al iniciar sesión.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reactivarYLogin = async (correo: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reactivar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ correo: correo.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let errorMsg = data.message || "Error al reactivar la cuenta";
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg[0];
        }
        throw new Error(errorMsg);
      }

      document.cookie =
        "is_logged_in=true; path=/; max-age=28800; samesite=lax";

      setIsAccountPaused(false);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al reactivar la cuenta.");
      throw err;
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
        const data = await res.json().catch(() => ({}));
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
    
    // 1. Limpiar cookie local de Next.js
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.warn("Advertencia al limpiar cookies en ruta local de Next.js:", err);
    }

    // 2. Notificar al backend NestJS para limpiar la sesión
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignorar si el backend no responde
    }

    // 3. Limpiar exhaustivamente cookies en el cliente JS
    document.cookie = "is_logged_in=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    document.cookie = "access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    document.cookie = "access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict";

    setIsLoading(false);
    
    // 4. Redirección limpia al login
    window.location.replace("/login");
  };

  return {
    login,
    reactivarYLogin,
    register: registerUser,
    logout,
    isLoading,
    error,
    isAccountPaused,
    setIsAccountPaused,
  };
};
