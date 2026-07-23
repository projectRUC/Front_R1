'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
} from '@heroui/react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { isValidName, isValidEmail, isStrongPassword } from '@/utils/validations';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para LGPDPPSO - Consentimiento explícito
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Referencias para validación nativa HTML5
  const nameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  
  const { register, isLoading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar validaciones previas
    nameRef.current?.setCustomValidity('');
    lastNameRef.current?.setCustomValidity('');
    emailRef.current?.setCustomValidity('');
    passwordRef.current?.setCustomValidity('');
    privacyRef.current?.setCustomValidity('');
    
    const trimmedNombre = nombre.trim();
    const trimmedApellidos = apellidos.trim();
    const trimmedCorreo = correo.trim();
    const cleanPassword = password.replace(/\s/g, ''); // Sin espacios

    // Verificamos campos vacíos (aunque 'required' nativo detiene la mayoría, esto atrapa puros espacios)
    if (!trimmedNombre) {
      nameRef.current?.setCustomValidity('Por favor, llena este campo con información válida.');
      nameRef.current?.reportValidity();
      return;
    }
    if (!trimmedApellidos) {
      lastNameRef.current?.setCustomValidity('Por favor, llena este campo con información válida.');
      lastNameRef.current?.reportValidity();
      return;
    }
    if (!trimmedCorreo) {
      emailRef.current?.setCustomValidity('Por favor, llena este campo con información válida.');
      emailRef.current?.reportValidity();
      return;
    }
    if (!cleanPassword) {
      passwordRef.current?.setCustomValidity('Por favor, ingresa una contraseña válida.');
      passwordRef.current?.reportValidity();
      return;
    }

    // Validación de Nombres y Apellidos
    if (!isValidName(trimmedNombre)) {
      nameRef.current?.setCustomValidity("El nombre solo debe contener letras.");
      nameRef.current?.reportValidity();
      return;
    }
    if (!isValidName(trimmedApellidos)) {
      lastNameRef.current?.setCustomValidity("Los apellidos solo deben contener letras.");
      lastNameRef.current?.reportValidity();
      return;
    }

    // Validación de Formato de Correo Electrónico
    if (!isValidEmail(trimmedCorreo)) {
      emailRef.current?.setCustomValidity("Por favor, introduce un correo electrónico válido.");
      emailRef.current?.reportValidity();
      return;
    }

    // Validación de Contraseña
    if (!isStrongPassword(cleanPassword)) {
      passwordRef.current?.setCustomValidity("La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.");
      passwordRef.current?.reportValidity();
      return;
    }
    
    // Validación de Aviso de Privacidad
    if (!isPrivacyAccepted) {
      privacyRef.current?.setCustomValidity('Debes aceptar el Aviso de Privacidad para continuar.');
      privacyRef.current?.reportValidity();
      return;
    }
    
    // El backend espera: nombre, apellidoPaterno, correo, password, rolId
    register({
      nombre: trimmedNombre,
      apellidoPaterno: trimmedApellidos,
      correo: trimmedCorreo,
      password: cleanPassword,
      rolId: 1
    });
  };

  return (
    <Card className="w-full max-w-lg p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xl border border-white/20">
      <CardHeader className="flex flex-col gap-2 items-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-tr from-secondary to-primary-500 rounded-2xl flex items-center justify-center shadow-lg mb-2">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Crear Cuenta</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Únete a la plataforma escolar PAEC</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre</label>
              <input
                ref={nameRef}
                required
                placeholder="Ej. Juan"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  e.target.setCustomValidity('');
                }}
                className="w-full h-12 px-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-500 text-gray-900 dark:text-white shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Apellidos</label>
              <input
                ref={lastNameRef}
                required
                placeholder="Ej. Pérez"
                value={apellidos}
                onChange={(e) => {
                  setApellidos(e.target.value);
                  e.target.setCustomValidity('');
                }}
                className="w-full h-12 px-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-500 text-gray-900 dark:text-white shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico</label>
            <input
              ref={emailRef}
              required
              type="email"
              placeholder="tu@escuela.com"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                e.target.setCustomValidity('');
              }}
              className="w-full h-12 px-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-500 text-gray-900 dark:text-white shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
            <input
              ref={passwordRef}
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value.replace(/\s/g, ''));
                e.target.setCustomValidity('');
              }}
              className="w-full h-12 px-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-500 text-gray-900 dark:text-white shadow-sm"
            />
          </div>

          <label className="flex items-center gap-3 mt-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                ref={privacyRef}
                type="checkbox"
                checked={isPrivacyAccepted}
                onChange={(e) => {
                  setIsPrivacyAccepted(e.target.checked);
                  e.target.setCustomValidity('');
                }}
                className="peer appearance-none w-5 h-5 rounded border-2 border-gray-300 dark:border-zinc-600 checked:bg-primary checked:border-primary transition-colors cursor-pointer bg-white dark:bg-zinc-800"
              />
              <svg 
                className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
              He leído y acepto el{' '}
              <button type="button" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} className="text-primary hover:text-primary-600 transition-colors font-semibold underline decoration-primary/30 underline-offset-2">
                Aviso de Privacidad (LGPDPPSO)
              </button>
            </span>
          </label>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center shadow-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full h-12 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Registrarme"
            )}
          </button>
        </form>
        <div className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:text-primary-600 transition-colors font-bold underline decoration-primary/30 underline-offset-4">
            Inicia sesión aquí
          </Link>
        </div>
      </CardContent>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aviso de Privacidad (LGPDPPSO)</h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 dark:text-gray-400 space-y-4">
              <p>
                Con base en la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO),
                el Sistema Escolar PAEC te informa lo siguiente:
              </p>
              <p>
                <strong>1. Uso de Datos:</strong> Tus datos personales (nombre, apellidos, correo, etc.) serán utilizados 
                exclusivamente para fines académicos, administrativos y de gestión dentro de la plataforma.
              </p>
              <p>
                <strong>2. Protección:</strong> Implementamos medidas de seguridad técnicas, físicas y administrativas 
                para evitar la filtración, pérdida o acceso no autorizado a tu información.
              </p>
              <p>
                <strong>3. Derechos ARCO:</strong> En cualquier momento puedes solicitar el Acceso, Rectificación, 
                Cancelación u Oposición del uso de tus datos.
              </p>
              <p>
                Al continuar y crear una cuenta, otorgas tu consentimiento explícito para el tratamiento de tus datos 
                conforme a las finalidades descritas en este aviso.
              </p>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-950/50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Cerrar
              </button>
              <button 
                type="button" 
                onClick={() => { 
                  setIsPrivacyAccepted(true); 
                  setIsModalOpen(false); 
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-600 transition-colors shadow-md shadow-primary/20"
              >
                Entendido y Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
