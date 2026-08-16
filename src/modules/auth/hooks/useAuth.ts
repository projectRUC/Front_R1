import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const res = await fetch('/api/auth/login', {
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
      const res = await fetch('/api/auth/reactivar', {
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
      const res = await fetch('/api/auth/register', {
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
    
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignorar si el backend no responde
    }

    document.cookie = "is_logged_in=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    document.cookie = "access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    document.cookie = "access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict";

    setIsLoading(false);
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
