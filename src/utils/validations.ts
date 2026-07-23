/**
 * Utilidades globales para validación de datos en el frontend.
 */

// Validación de Nombres y Apellidos (solo letras, acentos y espacios)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return nameRegex.test(name);
};

// Validación de Formato de Correo Electrónico
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de Seguridad de Contraseña
// Retorna true si tiene al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.
export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers;
};
