'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { perfilService, UsuarioPerfilDetalle, GrupoItem } from '@/services/perfil.service';

export default function PerfilPage() {
  const { user, refetchUser } = useUser();
  const { logout } = useAuth();

  // Estados principales
  const [activeTab, setActiveTab] = useState<'datos' | 'privacidad' | 'riesgo'>('datos');
  const [loadingPerfil, setLoadingPerfil] = useState<boolean>(true);
  const [perfil, setPerfil] = useState<UsuarioPerfilDetalle | null>(null);
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);

  // Formulario Mis Datos
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [grupoId, setGrupoId] = useState<number | null>(null);
  const [isSavingDatos, setIsSavingDatos] = useState(false);

  // Privacidad (Oposición)
  const [oposicion, setOposicion] = useState(false);
  const [isSavingOposicion, setIsSavingOposicion] = useState(false);

  // Modales
  const [showDesactivarModal, setShowDesactivarModal] = useState(false);
  const [isDesactivando, setIsDesactivando] = useState(false);

  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [confirmarPalabra, setConfirmarPalabra] = useState('');
  const [isCancelando, setIsCancelando] = useState(false);

  // Modal Cambiar Contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [showPassActual, setShowPassActual] = useState(false);
  const [showPassNuevo, setShowPassNuevo] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Feedback Toasts / Notificaciones
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Cargar perfil completo y lista de grupos
  const loadData = async () => {
    setLoadingPerfil(true);
    try {
      const [perfilData, gruposData] = await Promise.all([
        perfilService.getPerfil(),
        perfilService.getGrupos().catch(() => []),
      ]);

      let app = perfilData.apellidoPaterno || perfilData.usuApp || '';
      let apm = perfilData.apellidoMaterno || perfilData.usuApm || '';

      // Si el usuario tenía ambos apellidos guardados en un solo campo, los separamos
      if (app && !apm && app.trim().includes(' ')) {
        const parts = app.trim().split(/\s+/);
        app = parts[0];
        apm = parts.slice(1).join(' ');
      }

      setPerfil(perfilData);
      setNombre(perfilData.nombre || perfilData.usuNom || '');
      setApellidoPaterno(app);
      setApellidoMaterno(apm);
      setGrupoId(perfilData.grupoId !== undefined ? perfilData.grupoId : null);
      setOposicion(Boolean(perfilData.oposicionTratamiento));
      setGrupos(gruposData);
    } catch (err: any) {
      showToast(err?.message || 'Error al cargar los datos del perfil.', 'error');
    } finally {
      setLoadingPerfil(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rolNom = perfil?.rol || perfil?.rolUsuario?.rolUsuNom || user?.rol || '';
  const isAlumno =
    rolNom.toLowerCase() === 'alumno' ||
    rolNom.toLowerCase() === 'scrum master' ||
    rolNom.toLowerCase().includes('estudiante');
  const isDocente =
    rolNom.toLowerCase() === 'docente' ||
    rolNom.toLowerCase().includes('profesor') ||
    rolNom.toLowerCase() === 'administrador';

  // Guardar Cambios de Mis Datos (Rectificación ARCO)
  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellidoPaterno.trim()) {
      showToast('Nombre y Apellido Paterno son obligatorios.', 'error');
      return;
    }

    setIsSavingDatos(true);
    try {
      const res = await perfilService.updatePerfil({
        nombre: nombre.trim(),
        apellidoPaterno: apellidoPaterno.trim(),
        apellidoMaterno: apellidoMaterno.trim() || undefined,
        grupoId: isAlumno ? grupoId : null,
      });

      if (res.usuario) {
        setPerfil(res.usuario);
        setNombre(res.usuario.nombre || res.usuario.usuNom || nombre.trim());
        setApellidoPaterno(res.usuario.apellidoPaterno || res.usuario.usuApp || apellidoPaterno.trim());
        setApellidoMaterno(res.usuario.apellidoMaterno || res.usuario.usuApm || apellidoMaterno.trim());
        setGrupoId(res.usuario.grupoId !== undefined ? res.usuario.grupoId : grupoId);
      }
      await refetchUser();
      showToast(res.message || 'Tus datos han sido actualizados exitosamente.');
    } catch (err: any) {
      showToast(err?.message || 'Error al actualizar tus datos.', 'error');
    } finally {
      setIsSavingDatos(false);
    }
  };

  // Cambiar Contraseña
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const act = passwordActual.trim();
    const nva = passwordNuevo.trim();

    if (!act) {
      showToast('Debes ingresar tu contraseña actual.', 'error');
      return;
    }
    if (!nva || nva.length < 8) {
      showToast('La nueva contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    if (act === nva) {
      showToast('La nueva contraseña debe ser diferente a la contraseña actual.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await perfilService.cambiarPassword({
        passwordActual: act,
        passwordNuevo: nva,
      });
      showToast(res.message || 'Contraseña actualizada exitosamente.');
      setShowPasswordModal(false);
      setPasswordActual('');
      setPasswordNuevo('');
    } catch (err: any) {
      showToast(err?.message || 'Error al actualizar la contraseña. Verifica tu clave actual.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Cambiar Derecho de Oposición (LGPDPPSO)
  const handleToggleOposicion = async (checked: boolean) => {
    setOposicion(checked);
    setIsSavingOposicion(true);
    try {
      await perfilService.updateOposicion(checked);
      showToast(
        checked
          ? 'Derecho de Oposición activado: Tus datos no serán tratados para fines secundarios.'
          : 'Preferencia actualizada: Oposición desactivada.'
      );
    } catch (err: any) {
      setOposicion(!checked); // Revertir en caso de error
      showToast(err?.message || 'Error al actualizar tu preferencia de oposición.', 'error');
    } finally {
      setIsSavingOposicion(false);
    }
  };

  // Desactivar / Pausar Cuenta
  const handleDesactivar = async () => {
    setIsDesactivando(true);
    try {
      await perfilService.desactivarCuenta();
      showToast('Tu cuenta ha sido desactivada. Cerrando sesión...');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err: any) {
      showToast(err?.message || 'Error al desactivar la cuenta.', 'error');
      setIsDesactivando(false);
      setShowDesactivarModal(false);
    }
  };

  // Cancelar / Anonimizar Cuenta (Cancelación ARCO)
  const handleCancelarCuenta = async () => {
    if (confirmarPalabra.trim() !== 'CANCELAR') {
      showToast('Debes escribir exactamente "CANCELAR" para confirmar.', 'error');
      return;
    }

    setIsCancelando(true);
    try {
      await perfilService.cancelarCuenta();
      showToast('Cuenta cancelada y anonimizada permanentemente conforme a LGPDPPSO.');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      showToast(err?.message || 'Error al procesar la cancelación de cuenta.', 'error');
      setIsCancelando(false);
      setShowCancelarModal(false);
    }
  };

  if (loadingPerfil) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
          Cargando información de perfil y derechos ARCO...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/20'
              : 'bg-red-500/90 text-white border-red-400 shadow-red-500/20'
          }`}
        >
          <Icon
            icon={toastMessage.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'}
            className="w-5 h-5 flex-shrink-0"
          />
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Icon icon="mdi:close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Ajustes de Perfil y Privacidad ARCO
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                perfil?.estadoCuenta === 'ACTIVO'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}
            >
              {perfil?.estadoCuenta || 'ACTIVO'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Gestiona tus datos personales y ejerce tus derechos de Acceso, Rectificación, Cancelación y Oposición (LGPDPPSO).
          </p>
        </div>

        {/* Mini resumen de usuario */}
        <div className="flex items-center space-x-3 bg-gray-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl border border-gray-200/60 dark:border-zinc-700/60">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-sm uppercase">
            {(perfil?.nombre || perfil?.usuNom || user?.nombre || 'U').charAt(0)}
          </div>
          <div className="text-left text-xs">
            <p className="font-bold text-gray-900 dark:text-white">
              {perfil?.nombreCompleto ||
                (perfil?.nombre
                  ? `${perfil.nombre} ${perfil.apellidoPaterno || ''}`
                  : `${perfil?.usuNom || ''} ${perfil?.usuApp || ''}`.trim()) ||
                user?.nombre ||
                'Usuario'}
            </p>
            <p className="text-gray-500 dark:text-zinc-400">
              {perfil?.rol || perfil?.rolUsuario?.rolUsuNom || user?.rol || 'Usuario'}
              {perfil?.grupo
                ? typeof perfil.grupo === 'string'
                  ? ` · Grupo ${perfil.grupo}`
                  : ` · Grupo ${perfil.grupo.grupoNom}`
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Selector de Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab('datos')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'datos'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 shadow-xs'
              : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200'
          }`}
        >
          <Icon icon="mdi:account-outline" className="w-5 h-5" />
          <span>Mis Datos (Acceso y Rectificación)</span>
        </button>

        <button
          onClick={() => setActiveTab('privacidad')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'privacidad'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 shadow-xs'
              : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200'
          }`}
        >
          <Icon icon="mdi:shield-lock-outline" className="w-5 h-5" />
          <span>Privacidad (Oposición y Pausa)</span>
        </button>

        <button
          onClick={() => setActiveTab('riesgo')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'riesgo'
              ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 shadow-xs'
              : 'text-gray-600 dark:text-zinc-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 hover:text-red-600'
          }`}
        >
          <Icon icon="mdi:alert-octagon-outline" className="w-5 h-5" />
          <span>Zona de Riesgo (Cancelación ARCO)</span>
        </button>
      </div>

      {/* CONTENIDO TAB 1: MIS DATOS (ACCESO Y RECTIFICACIÓN) */}
      {activeTab === 'datos' && (
        <Card className="p-6 md:p-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl">
          <CardHeader className="flex flex-col items-start gap-1 pb-6 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <Icon icon="mdi:card-account-details-outline" className="w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Datos de Identificación y Contacto
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Puedes rectificar y actualizar tus datos personales en cualquier momento para mantener tu expediente actualizado.
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleGuardarDatos} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Nombre(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-gray-900 dark:text-white transition-all shadow-xs"
                  />
                </div>

                {/* Apellido Paterno */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Apellido Paterno <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={apellidoPaterno}
                    onChange={(e) => setApellidoPaterno(e.target.value)}
                    placeholder="Primer apellido"
                    className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-gray-900 dark:text-white transition-all shadow-xs"
                  />
                </div>

                {/* Apellido Materno */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    value={apellidoMaterno}
                    onChange={(e) => setApellidoMaterno(e.target.value)}
                    placeholder="Segundo apellido (opcional)"
                    className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-gray-900 dark:text-white transition-all shadow-xs"
                  />
                </div>

                {/* Correo Electrónico (Informativo / No editable) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                      Correo Institucional
                    </label>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                      Identificador de Cuenta (No modificable)
                    </span>
                  </div>
                  <input
                    disabled
                    type="email"
                    value={perfil?.correo || perfil?.usuEmail || user?.correo || ''}
                    className="w-full h-11 px-4 rounded-xl bg-gray-200/60 dark:bg-zinc-800/40 border border-gray-300 dark:border-zinc-700 text-sm text-gray-500 dark:text-zinc-400 cursor-not-allowed opacity-80"
                  />
                </div>

                {/* Rol de Usuario */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Rol en el Sistema
                  </label>
                  <input
                    disabled
                    type="text"
                    value={perfil?.rol || perfil?.rolUsuario?.rolUsuNom || user?.rol || 'Alumno'}
                    className="w-full h-11 px-4 rounded-xl bg-gray-200/60 dark:bg-zinc-800/40 border border-gray-300 dark:border-zinc-700 text-sm text-gray-500 dark:text-zinc-400 cursor-not-allowed opacity-80 font-medium"
                  />
                </div>

                {/* Selector de Grupo Escolar: Solo visible si es Alumno o Scrum Master */}
                {isAlumno && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                      Grupo Escolar Asignado
                    </label>
                    <select
                      value={grupoId || ''}
                      onChange={(e) => setGrupoId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-gray-900 dark:text-white transition-all shadow-xs"
                    >
                      <option value="">-- Sin Grupo Asignado --</option>
                      {grupos.map((g) => (
                        <option key={g.grupoId} value={g.grupoId}>
                          {g.grupoNom} {g.grupoDesc ? `(${g.grupoDesc})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Pie con botón de actualizar contraseña y botón de guardar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordActual('');
                    setPasswordNuevo('');
                    setShowPassActual(false);
                    setShowPassNuevo(false);
                    setShowPasswordModal(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 font-semibold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                >
                  <Icon icon="mdi:key-change" className="w-5 h-5 text-indigo-500" />
                  <span>Actualizar Contraseña</span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingDatos}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSavingDatos ? (
                    <>
                      <Spinner size="sm" color="current" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:content-save-outline" className="w-5 h-5" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* CONTENIDO TAB 2: PRIVACIDAD (OPOSICIÓN Y DESACTIVACIÓN) */}
      {activeTab === 'privacidad' && (
        <div className="space-y-6">
          {/* Card Derecho de Oposición */}
          <Card className="p-6 md:p-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl">
            <CardHeader className="flex flex-col items-start gap-1 pb-4">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <Icon icon="mdi:shield-account-outline" className="w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Derecho de Oposición al Tratamiento de Datos
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Conforme a los artículos aplicables de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO), puedes manifestar tu negativa al tratamiento de tus datos para fines adicionales.
              </p>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/60 flex items-start space-x-4">
                <input
                  type="checkbox"
                  id="checkbox-oposicion"
                  checked={oposicion}
                  disabled={isSavingOposicion}
                  onChange={(e) => handleToggleOposicion(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded-lg text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    htmlFor="checkbox-oposicion"
                    className="font-bold text-sm text-gray-900 dark:text-white cursor-pointer select-none"
                  >
                    Manifestar Derecho de Oposición
                  </label>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Me opongo a que mis datos personales e historial de actividades sean utilizados para fines estadísticos, métricas globales comparativas o finalidades secundarias no esenciales para la operación educativa del sistema.
                  </p>
                </div>
                {isSavingOposicion && <Spinner size="sm" />}
              </div>
            </CardContent>
          </Card>

          {/* Card Pausar / Desactivar Cuenta */}
          <Card className="p-6 md:p-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl border border-amber-500/30 dark:border-amber-500/20 rounded-2xl">
            <CardHeader className="flex flex-col items-start gap-1 pb-4">
              <div className="flex items-center space-x-2 text-amber-500">
                <Icon icon="mdi:pause-circle-outline" className="w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pausar / Desactivar Cuenta Temporalmente
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Si requieres un descanso temporal o suspensión de actividades escolares, puedes desactivar tu cuenta.
              </p>
            </CardHeader>

            <CardContent className="pt-2 space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium leading-relaxed">
                <strong>¿Qué sucede al desactivar mi cuenta?</strong>
                <br />
                Tus datos e información de proyectos se conservarán intactos, pero tu sesión actual se cerrará y no podrás acceder a las secciones privadas. Podrás reactivar tu cuenta en cualquier momento simplemente iniciando sesión con tus credenciales y aceptando el diálogo de reactivación.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDesactivarModal(true)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center space-x-2"
                >
                  <Icon icon="mdi:account-off-outline" className="w-5 h-5" />
                  <span>Desactivar mi cuenta</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONTENIDO TAB 3: ZONA DE RIESGO (CANCELACIÓN ARCO / ANONIMIZACIÓN) */}
      {activeTab === 'riesgo' && (
        <Card className="p-6 md:p-8 bg-red-500/5 dark:bg-red-950/20 backdrop-blur-md shadow-xl border border-red-500/40 dark:border-red-800/60 rounded-2xl">
          <CardHeader className="flex flex-col items-start gap-1 pb-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <Icon icon="mdi:alert-octagon" className="w-7 h-7" />
              <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400 tracking-tight">
                Derecho de Cancelación ARCO (Anonimización Permanente)
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              Acción crítica y definitiva conforme al régimen de protección de datos personales.
            </p>
          </CardHeader>

          <CardContent className="pt-2 space-y-6">
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm space-y-3 leading-relaxed">
              <p className="font-bold flex items-center gap-2">
                <Icon icon="mdi:information-outline" className="w-5 h-5 flex-shrink-0" />
                ADVERTENCIA LEGAL Y OPERATIVA IRREVERSIBLE:
              </p>
              <p>
                Al ejercer tu <strong>Derecho de Cancelación</strong>, el sistema procederá a la <strong>anonimización irreversible</strong> de todos tus datos personales de identificación (nombre, apellidos, correo electrónico, credenciales y contraseñas) mediante técnicas de ofuscación criptográfica (Cero PII).
              </p>
              <p>
                Esta acción es <strong>permanente e irrecuperable</strong>. Perderás el acceso a tu cuenta para siempre y ningún administrador podrá restaurar tu identidad.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmarPalabra('');
                  setShowCancelarModal(true);
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center space-x-2"
              >
                <Icon icon="mdi:delete-forever" className="w-5 h-5" />
                <span>Eliminar y Anonimizar Cuenta Permanentemente</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL DE CONFIRMACIÓN: DESACTIVAR CUENTA */}
      {showDesactivarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-amber-500/30 transform transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:account-pause-outline" className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  ¿Pausar tu cuenta?
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Suspensión temporal de acceso
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-zinc-300 mb-6 leading-relaxed">
              Tu sesión se cerrará de inmediato. Tus datos seguirán guardados de forma segura y podrás volver a ingresar cuando lo desees reactivando tu cuenta en el login.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isDesactivando}
                onClick={() => setShowDesactivarModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={isDesactivando}
                onClick={handleDesactivar}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isDesactivando ? (
                  <>
                    <Spinner size="sm" color="current" />
                    <span>Pausando...</span>
                  </>
                ) : (
                  'Sí, Desactivar Cuenta'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN ESTRICTO: CANCELACIÓN ARCO */}
      {showCancelarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 md:p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border-2 border-red-500 transform transition-all space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:alert-octagon" className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-600 dark:text-red-400">
                  CONFIRMACIÓN DE CANCELACIÓN ARCO
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Anonimización de datos (Cero PII)
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 space-y-2">
              <p className="font-bold">Esta acción no se puede deshacer.</p>
              <p>
                Tu cuenta será marcada como ANONIMIZADO y tus datos serán destruidos criptográficamente en la base de datos de acuerdo con el protocolo LGPDPPSO.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                Para confirmar la eliminación definitiva, escribe la palabra <span className="text-red-600 font-mono font-black">CANCELAR</span>:
              </label>
              <input
                type="text"
                value={confirmarPalabra}
                onChange={(e) => setConfirmarPalabra(e.target.value)}
                placeholder="Escribe CANCELAR"
                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border-2 border-red-300 dark:border-red-800/80 focus:border-red-600 outline-none text-sm font-mono text-gray-900 dark:text-white transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isCancelando}
                onClick={() => setShowCancelarModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Abortar
              </button>
              <button
                type="button"
                disabled={confirmarPalabra.trim() !== 'CANCELAR' || isCancelando}
                onClick={handleCancelarCuenta}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isCancelando ? (
                  <>
                    <Spinner size="sm" color="current" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  'Confirmar y Eliminar Cuenta'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE CAMBIO DE CONTRASEÑA */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 transform transition-all space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:lock-reset" className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Actualizar Contraseña
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Ingresa tu clave actual y define tu nueva contraseña
                </p>
              </div>
            </div>

            <form onSubmit={handleCambiarPassword} className="space-y-4">
              {/* Contraseña Actual */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Contraseña Actual <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPassActual ? 'text' : 'password'}
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    placeholder="Escribe tu contraseña actual"
                    className="w-full h-11 px-4 pr-11 rounded-xl bg-gray-50 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-gray-900 dark:text-white transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassActual(!showPassActual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <Icon icon={showPassActual ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassNuevo ? 'text' : 'password'}
                    value={passwordNuevo}
                    onChange={(e) => setPasswordNuevo(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full h-11 px-4 pr-11 rounded-xl bg-gray-50 dark:bg-zinc-800/90 border border-gray-300 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-gray-900 dark:text-white transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassNuevo(!showPassNuevo)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <Icon icon={showPassNuevo ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Debe ser diferente a la contraseña actual y tener mínimo 8 caracteres.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isChangingPassword}
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <>
                      <Spinner size="sm" color="current" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
