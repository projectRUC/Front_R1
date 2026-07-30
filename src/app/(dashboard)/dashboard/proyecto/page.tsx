'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardService, DetalleProyectoEquipoResponse, ActividadProyectoItem } from '@/services/dashboard.service';
import { useUser } from '@/context/UserContext';
import { Loader } from '@/components/Loader';
import { HerramientasEvaluadasTable } from '@/app/herramientas/components/HerramientasEvaluadasTable';
import { DocenteFeedbackBox } from '@/app/herramientas/components/DocenteFeedbackBox';
import DesignSprintGate from '@/app/designSprint/DesignSprintGate';
import { kanbanService } from '@/services/kanban.service';
import { DocenteParcialApprovalBar } from '@/components/Projects/DocenteParcialApprovalBar';

type TabType = 'info' | 'miembros' | 'design_sprint' | 'actividades' | 'kanban' | 'herramientas';

const KANBAN_COLUMNS = [
  { id: 'Backlog', label: 'Backlog', icon: '', headerClass: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
  { id: 'sin empezar', label: 'Sin Empezar', icon: '', headerClass: 'bg-cyan-100/70 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800' },
  { id: 'En proceso', label: 'En Proceso', icon: '', headerClass: 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  { id: 'Prueba', label: 'Prueba / QA', icon: '', headerClass: 'bg-purple-100/70 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800' },
  { id: 'Terminado', label: 'Terminado', icon: '', headerClass: 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
];

const getNormalizedStatus = (status?: string | null) => {
  if (!status) return 'sin empezar';
  const lim = status.trim().toLowerCase();
  if (lim === 'backlog') return 'Backlog';
  if (lim === 'en proceso') return 'En proceso';
  if (lim === 'prueba' || lim === 'en prueba' || lim === 'testing' || lim === 'qa') return 'Prueba';
  if (lim === 'terminado' || lim === 'completado' || lim === 'done') return 'Terminado';
  return 'sin empezar';
};

function ProyectoDetalleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const proyectoIdParam = searchParams.get('proyectoId');
  const equipoIdParam = searchParams.get('equipoId');

  const [data, setData] = useState<DetalleProyectoEquipoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Permiso de solo lectura para Docente
  const isReadOnly = user?.rol === 'Docente';
  const canEdit = !isReadOnly && (user?.rol === 'Alumno' || user?.rol === 'Scrum Master' || Boolean(user));

  // Estados de Modales y Ediciones de Proyecto / Períodos
  const [editInfoModal, setEditInfoModal] = useState<boolean>(false);
  const [infoForm, setInfoForm] = useState({ nombre: '', descripcion: '', fechaInicio: '', fechaFin: '' });
  const [savingInfo, setSavingInfo] = useState<boolean>(false);

  // Sprints & Parciales
  const [sprintCant, setSprintCant] = useState<number>(2);
  const [generatingSprints, setGeneratingSprints] = useState<boolean>(false);
  const [editingSprintNum, setEditingSprintNum] = useState<number | null>(null);
  const [sprintEditForm, setSprintEditForm] = useState({ fechaInicio: '', fechaFin: '', objetivo: '' });
  const [savingSprint, setSavingSprint] = useState<boolean>(false);

  const [parcialCant, setParcialCant] = useState<number>(3);
  const [generatingParciales, setGeneratingParciales] = useState<boolean>(false);
  const [editingParcialNum, setEditingParcialNum] = useState<number | null>(null);
  const [parcialEditForm, setParcialEditForm] = useState({ fechaInicio: '', fechaFin: '', objetivo: '' });
  const [savingParcial, setSavingParcial] = useState<boolean>(false);

  // Actividades & Kanban Drag
  const [actModal, setActModal] = useState<boolean>(false);
  const [actForm, setActForm] = useState({ nombreActividad: '', descripcion: '', criterios: '', fechaInicio: '', fechaFin: '', usuarioAsignadoId: 0 });
  const [savingAct, setSavingAct] = useState<boolean>(false);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [draggedActId, setDraggedActId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Gestión de Miembros y Roles
  const [memberModal, setMemberModal] = useState<boolean>(false);
  const [searchCandidato, setSearchCandidato] = useState<string>('');
  const [memberForm, setMemberForm] = useState({ usuId: 0, rol: 'Developer', customRol: '', isCustom: false });
  const [savingMember, setSavingMember] = useState<boolean>(false);

  // Edición en línea de rol de miembro
  const [editingMemberRolId, setEditingMemberRolId] = useState<number | null>(null);
  const [inlineRolValue, setInlineRolValue] = useState<string>('');
  const [savingInlineRol, setSavingInlineRol] = useState<boolean>(false);

  const equipoId = equipoIdParam ? parseInt(equipoIdParam, 10) : null;

  const fetchDetalle = async () => {
    if (!equipoId) {
      setError('No se proporcionó el identificador del equipo para consultar el proyecto.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await dashboardService.getDetalleProyectoEquipo(equipoId);
      setData(res);
      // Inicializar formulario de info básica
      if (res && res.proyecto) {
        setInfoForm({
          nombre: res.proyecto.nombre || '',
          descripcion: res.proyecto.descripcion || '',
          fechaInicio: res.proyecto.fechaInicio ? new Date(res.proyecto.fechaInicio).toISOString().split('T')[0] : '',
          fechaFin: res.proyecto.fechaFin ? new Date(res.proyecto.fechaFin).toISOString().split('T')[0] : '',
        });
        if (res.equipo.miembros.length > 0 && actForm.usuarioAsignadoId === 0) {
          setActForm((prev) => ({ ...prev, usuarioAsignadoId: res.equipo.miembros[0].usuId }));
        }
        if (res.candidatos && res.candidatos.length > 0) {
          setMemberForm((prev) => ({ ...prev, usuId: res.candidatos![0].usuId }));
        }
      }
    } catch (err: any) {
      console.error('Error al obtener detalle del proyecto y equipo:', err);
      setError(err.message || 'No fue posible cargar el ecosistema de este proyecto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalle();
  }, [equipoId]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Por definir';
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const toInputDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // --- Handlers de Edición Proyecto y Períodos ---
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoId) return;
    try {
      setSavingInfo(true);
      await dashboardService.updateProyectoInfo(equipoId, infoForm);
      setEditInfoModal(false);
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'Error al modificar información.');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleCreateSprints = async () => {
    if (!equipoId || sprintCant <= 0) return;
    try {
      setGeneratingSprints(true);
      await dashboardService.createSprints(equipoId, sprintCant);
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'Error al generar Sprints.');
    } finally {
      setGeneratingSprints(false);
    }
  };

  const handleUpdateSprint = async (numSprint: number) => {
    if (!equipoId) return;
    try {
      setSavingSprint(true);
      await dashboardService.updateSprint(equipoId, numSprint, sprintEditForm);
      setEditingSprintNum(null);
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar Sprint.');
    } finally {
      setSavingSprint(false);
    }
  };

  const handleCreateParciales = async () => {
    if (!equipoId || parcialCant <= 0) return;
    try {
      setGeneratingParciales(true);
      await dashboardService.createParciales(equipoId, parcialCant);
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'Error al generar Parciales.');
    } finally {
      setGeneratingParciales(false);
    }
  };

  const handleUpdateParcial = async (numParcial: number) => {
    if (!equipoId) return;
    try {
      setSavingParcial(true);
      await dashboardService.updateParcial(equipoId, numParcial, parcialEditForm);
      setEditingParcialNum(null);
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar Parcial.');
    } finally {
      setSavingParcial(false);
    }
  };

  const handleCreateActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoId) return;
    try {
      setSavingAct(true);
      await dashboardService.createActividad(equipoId, actForm);
      setActModal(false);
      setActForm({ nombreActividad: '', descripcion: '', criterios: '', fechaInicio: '', fechaFin: '', usuarioAsignadoId: data?.equipo.miembros[0]?.usuId || 0 });
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'Error al crear actividad.');
    } finally {
      setSavingAct(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!actForm.nombreActividad || !actForm.descripcion) {
      alert("Por favor ingresa al menos el nombre y la descripción para que la IA genere los criterios.");
      return;
    }
    try {
      setLoadingAI(true);
      const res = await kanbanService.generateCriteria(actForm.nombreActividad, actForm.descripcion);
      if (res && res.criterios) {
        setActForm(prev => ({ ...prev, criterios: res.criterios }));
      }
    } catch (error) {
      console.error("Error generando criterios con IA:", error);
      alert("Ocurrió un error al generar los criterios con IA.");
    } finally {
      setLoadingAI(false);
    }
  };

  // --- Handlers Tablero Kanban & Drag & Drop ---
  const handleUpdateActividadStatus = async (actividadId: string, nuevoEstatus: string) => {
    if (!data || updatingStatusId === actividadId) return;
    const item = data.actividades.find((a) => a.id === actividadId);
    if (!item || getNormalizedStatus(item.estatus) === nuevoEstatus) return;

    try {
      setUpdatingStatusId(actividadId);
      // Optimistic update
      const actualizados = data.actividades.map((a) => {
        if (a.id === actividadId) {
          return { ...a, estatus: nuevoEstatus };
        }
        return a;
      });
      setData({ ...data, actividades: actualizados });

      await dashboardService.updateActividadEstatus(actividadId, nuevoEstatus);
    } catch (err: any) {
      console.error('Error al actualizar estatus en Kanban:', err);
      alert(err.message || 'No se pudo sincronizar el cambio de estatus de la actividad.');
      await fetchDetalle();
    } finally {
      setUpdatingStatusId(null);
      setDraggedActId(null);
    }
  };

  const handleDrop = (columnId: string) => {
    if (!draggedActId || !canEdit) return;
    handleUpdateActividadStatus(draggedActId, columnId);
  };

  // --- Handlers de Gestión de Miembros y Roles ---
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoId) return;
    const rolFinal = memberForm.isCustom ? memberForm.customRol : memberForm.rol;
    if (!rolFinal || !rolFinal.trim()) {
      alert('Debe especificar o seleccionar el rol para el nuevo miembro.');
      return;
    }
    try {
      setSavingMember(true);
      await dashboardService.addMiembroEquipo(equipoId, {
        usuId: Number(memberForm.usuId),
        rol: rolFinal.trim(),
      });
      setMemberModal(false);
      setSearchCandidato('');
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'Error al inscribir miembro.');
    } finally {
      setSavingMember(false);
    }
  };

  const handleUpdateMemberRol = async (usuId: number) => {
    if (!equipoId || !inlineRolValue.trim()) return;
    try {
      setSavingInlineRol(true);
      await dashboardService.updateRolMiembro(equipoId, usuId, { rol: inlineRolValue.trim() });
      setEditingMemberRolId(null);
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar rol.');
    } finally {
      setSavingInlineRol(false);
    }
  };

  const handleRemoveMember = async (usuId: number, nombre: string) => {
    if (!equipoId) return;
    if (!confirm(`¿Estás seguro de eliminar a ${nombre} de tu equipo?`)) return;
    try {
      await dashboardService.removeMiembroEquipo(equipoId, usuId);
      await fetchDetalle();
    } catch (err: any) {
      alert(err.message || 'No fue posible eliminar al integrante.');
    }
  };

  if (loading && !data) {
    return <Loader message="Sincronizando portal del proyecto y equipo..." />;
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-3xl text-center space-y-4">
        <svg className="w-14 h-14 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Portal No Disponible</h2>
        <p className="text-sm text-red-600 dark:text-red-300">{error || 'El proyecto solicitado no pudo ser resuelto.'}</p>
        <button
          onClick={() => router.push('/dashboard/proyectos-equipos')}
          className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-red-700 transition-all"
        >
          Regresar a Proyectos y Equipos
        </button>
      </div>
    );
  }

  const { proyecto, equipo, actividades, rolesDisponibles = ['Scrum Master', 'Developer', 'QA / Tester', 'Diseñador UI/UX'], candidatos = [] } = data;

  const candidatosFiltrados = candidatos.filter((c) =>
    c.nombreCompleto.toLowerCase().includes(searchCandidato.toLowerCase()) ||
    c.correo.toLowerCase().includes(searchCandidato.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 relative">
      {/* Barra de Navegación e Identificadores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => router.push('/dashboard/proyectos-equipos')}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white transition-colors w-fit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Proyectos y Equipos
        </button>
        <div className="flex items-center gap-2">
          {isReadOnly && (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              👁 Modo Docente (Solo Lectura)
            </span>
          )}
          <span className="text-xs font-semibold px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-full border border-gray-200 dark:border-zinc-700">
            Proyecto ID: {proyectoIdParam || proyecto.id}
          </span>
          <span className="text-xs font-semibold px-3 py-1 bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
            Equipo: {equipo.nombre}
          </span>
        </div>
      </div>

      {isReadOnly && (
        <DocenteParcialApprovalBar 
          equipoId={equipo.id}
          parciales={proyecto.parciales || []}
          onApproveSuccess={() => {
            fetchDetalle();
          }} 
        />
      )}

      {/* Banner Principal Vibrante */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-950 text-white p-8 md:p-10 shadow-2xl border border-white/10"
      >
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                {equipo.grupo}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/10 text-gray-300">
                Líder: {equipo.creador}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{proyecto.nombre}</h1>
            <p className="text-sm text-gray-300 line-clamp-2 bg-black/30 p-4 rounded-2xl border border-white/10">
              {proyecto.descripcion}
            </p>
          </div>

          {/* Menú de Pestañas (Tabs) */}
          <div className="flex flex-wrap p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 h-fit self-start md:self-end gap-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'info' ? 'bg-white text-indigo-950 shadow-md' : 'text-gray-200 hover:text-white'
                }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab('miembros')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${activeTab === 'miembros' ? 'bg-white text-indigo-950 shadow-md' : 'text-gray-200 hover:text-white'
                }`}
            >
              Miembros ({equipo.miembros.length})
            </button>
            <button
              onClick={() => setActiveTab('design_sprint')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'design_sprint' ? 'bg-white text-indigo-950 shadow-md' : 'text-gray-200 hover:text-white'
                }`}
            >
              Design Sprint
            </button>
            <button
              onClick={() => setActiveTab('actividades')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'actividades' ? 'bg-white text-indigo-950 shadow-md' : 'text-gray-200 hover:text-white'
                }`}
            >
              Actividades ({actividades.length})
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${activeTab === 'kanban' ? 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30' : 'text-cyan-300 hover:text-white bg-cyan-500/10'
                }`}
            >
              <span>📊</span> Tablero Kanban
            </button>
            <button
              onClick={() => setActiveTab('herramientas')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'herramientas' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-300 hover:text-white'
                }`}
            >
              🛠 Herramientas
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- PESTAÑAS (con AnimatePresence) --- */}
      <AnimatePresence mode="wait">
        {activeTab === 'info' && (
          <motion.div
            key="tab-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Sección 1: Datos Generales */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-sm relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-5 mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Detalles del Proyecto</h2>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Especificaciones de fechas y objetivos globales</p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setEditInfoModal(true)}
                    className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-extrabold hover:bg-indigo-100 transition-all self-start sm:self-auto flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Editar Información
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                  <span className="text-xs font-bold text-gray-400 uppercase">Nombre Proyecto</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-1 truncate">{proyecto.nombre}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                  <span className="text-xs font-bold text-gray-400 uppercase">Equipo Asignado</span>
                  <p className="text-base font-bold text-purple-600 dark:text-purple-400 mt-1 truncate">{equipo.nombre}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                  <span className="text-xs font-bold text-gray-400 uppercase">Fecha Inicio</span>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">{formatDate(proyecto.fechaInicio)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                  <span className="text-xs font-bold text-gray-400 uppercase">Fecha Término</span>
                  <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatDate(proyecto.fechaFin)}</p>
                </div>
              </div>
            </div>

            {/* Sección 2: Sprints del Proyecto */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Planificación de Sprints</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Iteraciones ágiles de trabajo del equipo</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                  Total: {proyecto.sprints.length} Sprint(s)
                </span>
              </div>

              {proyecto.sprints.length === 0 ? (
                <div className="p-8 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-dashed border-gray-300 dark:border-zinc-700 text-center space-y-3">
                  <p className="text-sm font-semibold text-gray-600 dark:text-zinc-400">Este proyecto aún no ha dividido sus fechas en Sprints ágiles.</p>
                  {canEdit && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-xs text-gray-500 font-bold">Generar</span>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={sprintCant}
                        onChange={(e) => setSprintCant(parseInt(e.target.value) || 1)}
                        className="w-16 h-10 px-3 text-center rounded-xl bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-500 font-bold">Sprints automáticamente</span>
                      <button
                        onClick={handleCreateSprints}
                        disabled={generatingSprints}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all ml-2 disabled:opacity-50"
                      >
                        {generatingSprints ? 'Generando...' : 'Crear Sprints'}
                      </button>
                    </div>
                  )}
                  {isReadOnly && <p className="text-xs text-amber-500 font-medium">El equipo de alumnos aún no ha configurado sus Sprints.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proyecto.sprints.map((sp, idx) => {
                    const num = sp.num_sprint || idx + 1;
                    const isEditing = editingSprintNum === num;
                    return (
                      <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">SPRINT #{num}</span>
                          {canEdit && !isEditing && (
                            <button
                              onClick={() => {
                                setEditingSprintNum(num);
                                setSprintEditForm({
                                  fechaInicio: toInputDate(sp.fecha_inicio),
                                  fechaFin: toInputDate(sp.fecha_fin),
                                  objetivo: sp.objetivo || '',
                                });
                              }}
                              className="text-xs text-gray-400 hover:text-indigo-500 font-bold underline transition-colors"
                            >
                              Editar Sprint
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-3 pt-2">
                            <input
                              type="text"
                              placeholder="Objetivo del Sprint..."
                              value={sprintEditForm.objetivo}
                              onChange={(e) => setSprintEditForm({ ...sprintEditForm, objetivo: e.target.value })}
                              className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-white"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block">Fecha Inicio</label>
                                <input
                                  type="date"
                                  value={sprintEditForm.fechaInicio}
                                  onChange={(e) => setSprintEditForm({ ...sprintEditForm, fechaInicio: e.target.value })}
                                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block">Fecha Fin</label>
                                <input
                                  type="date"
                                  value={sprintEditForm.fechaFin}
                                  onChange={(e) => setSprintEditForm({ ...sprintEditForm, fechaFin: e.target.value })}
                                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <button onClick={() => setEditingSprintNum(null)} className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg">Cancelar</button>
                              <button onClick={() => handleUpdateSprint(num)} disabled={savingSprint} className="px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm">Guardar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                              {sp.objetivo || 'Sin objetivo definido'}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-200/60 dark:border-zinc-700/60">
                              <span>Inicio: <strong className="text-gray-700 dark:text-zinc-300">{formatDate(sp.fecha_inicio)}</strong></span>
                              <span>Fin: <strong className="text-indigo-500">{formatDate(sp.fecha_fin)}</strong></span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sección 3: Parciales del Proyecto */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Períodos y Parciales de Evaluación</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Cortes de calificación escolar del proyecto</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300">
                  Total: {proyecto.parciales.length} Parcial(es)
                </span>
              </div>

              {proyecto.parciales.length === 0 ? (
                <div className="p-8 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-dashed border-gray-300 dark:border-zinc-700 text-center space-y-3">
                  <p className="text-sm font-semibold text-gray-600 dark:text-zinc-400">No se han dividido los parciales del semestre en el sistema.</p>
                  {canEdit && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-xs text-gray-500 font-bold">Crear</span>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={parcialCant}
                        onChange={(e) => setParcialCant(parseInt(e.target.value) || 1)}
                        className="w-16 h-10 px-3 text-center rounded-xl bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-500 font-bold">Parciales en este lapso</span>
                      <button
                        onClick={handleCreateParciales}
                        disabled={generatingParciales}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all ml-2 disabled:opacity-50"
                      >
                        {generatingParciales ? 'Creando...' : 'Generar Parciales'}
                      </button>
                    </div>
                  )}
                  {isReadOnly && <p className="text-xs text-amber-500 font-medium">El equipo no ha inicializado las fechas de sus parciales.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {proyecto.parciales.map((pr, idx) => {
                    const num = pr.num_parcial || idx + 1;
                    const isEditing = editingParcialNum === num;
                    return (
                      <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">PARCIAL #{num}</span>
                            {canEdit && !isEditing && (
                              <button
                                onClick={() => {
                                  setEditingParcialNum(num);
                                  setParcialEditForm({
                                    fechaInicio: toInputDate(pr.fecha_inicio),
                                    fechaFin: toInputDate(pr.fecha_fin),
                                    objetivo: pr.objetivo || '',
                                  });
                                }}
                                className="text-xs text-gray-400 hover:text-emerald-500 font-bold underline transition-colors"
                              >
                                Editar
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-3 pt-2">
                              <input
                                type="text"
                                placeholder="Metas del Parcial..."
                                value={parcialEditForm.objetivo}
                                onChange={(e) => setParcialEditForm({ ...parcialEditForm, objetivo: e.target.value })}
                                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-white"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 block">Inicio</label>
                                  <input
                                    type="date"
                                    value={parcialEditForm.fechaInicio}
                                    onChange={(e) => setParcialEditForm({ ...parcialEditForm, fechaInicio: e.target.value })}
                                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 block">Fin</label>
                                  <input
                                    type="date"
                                    value={parcialEditForm.fechaFin}
                                    onChange={(e) => setParcialEditForm({ ...parcialEditForm, fechaFin: e.target.value })}
                                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-white"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setEditingParcialNum(null)} className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg">Cancelar</button>
                                <button onClick={() => handleUpdateParcial(num)} disabled={savingParcial} className="px-4 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">Guardar</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                              {pr.objetivo || 'Sin objetivo registrado'}
                            </p>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-200/60 dark:border-zinc-700/60 mt-2">
                            <span>Del: <strong className="text-gray-700 dark:text-zinc-300">{formatDate(pr.fecha_inicio)}</strong></span>
                            <span>Al: <strong className="text-emerald-500">{formatDate(pr.fecha_fin)}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'miembros' && (
          <motion.div
            key="tab-miembros"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-7 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Nómina y Roles del Equipo</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Administra a los colaboradores de tu proyecto, asigna sus puestos ágiles o retira integrantes.
                </p>
              </div>
              {canEdit && (
                <button
                  onClick={() => {
                    if (candidatos.length > 0 && memberForm.usuId === 0) {
                      setMemberForm({ ...memberForm, usuId: candidatos[0].usuId });
                    }
                    setMemberModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2 self-start sm:self-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  Agregar Nuevo Miembro
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipo.miembros.map((m) => {
                const isEditingRol = editingMemberRolId === m.usuId;
                return (
                  <motion.div
                    key={m.usuId}
                    whileHover={{ scale: 1.015, y: -2 }}
                    className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition-all flex flex-col justify-between space-y-5 relative overflow-hidden shadow-md ${m.esCreador ? 'border-purple-300 dark:border-purple-800 shadow-purple-500/5' : 'border-gray-200/80 dark:border-zinc-800'
                      }`}
                  >
                    {m.esCreador && (
                      <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
                    )}

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
                          {m.nombre.charAt(0).toUpperCase()}
                        </div>
                        {m.esCreador ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wider">
                            👑 Líder / Creador
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
                            Colaborador
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white truncate">{m.nombre}</h3>
                        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 truncate">{m.correo}</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Rol en el Equipo:</span>
                        {isEditingRol ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={inlineRolValue}
                              placeholder="Ej. Developer, QA, UI/UX"
                              onChange={(e) => setInlineRolValue(e.target.value)}
                              className="w-full h-8 px-2.5 text-xs font-bold rounded-lg bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-white"
                            />
                            <button
                              onClick={() => handleUpdateMemberRol(m.usuId)}
                              disabled={savingInlineRol}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs shadow"
                              title="Guardar Rol"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingMemberRolId(null)}
                              className="p-1.5 bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded-lg text-xs"
                              title="Cancelar"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-300">{m.rol || 'Miembro'}</span>
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingMemberRolId(m.usuId);
                                  setInlineRolValue(m.rol || 'Developer');
                                }}
                                className="text-[11px] text-gray-400 hover:text-purple-600 font-bold underline"
                              >
                                Cambiar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {canEdit && (
                      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 flex justify-end">
                        {m.esCreador ? (
                          <span className="text-[11px] font-bold text-gray-400 italic">No es posible eliminar al líder</span>
                        ) : (
                          <button
                            onClick={() => handleRemoveMember(m.usuId, m.nombre)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Eliminar del Equipo
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

{activeTab === 'design_sprint' && (
  <DesignSprintGate
    eqId={Number(equipoId)}
    proyectoId={Number(proyecto.id)}
    usuId={user?.id ?? 0}
  />
)}

        {activeTab === 'actividades' && (
          <motion.div
            key="tab-actividades"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Actividades del Proyecto (Vista Tarjetas)</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Control y seguimiento del avance con responsables designados del equipo.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('kanban')}
                  className="px-5 py-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 rounded-2xl text-xs font-extrabold hover:bg-purple-100 transition-all border border-purple-200 dark:border-purple-800 flex items-center gap-2"
                >
                  <span>📊</span> Abrir Tablero Kanban
                </button>
                {canEdit && (
                  <button
                    onClick={() => setActModal(true)}
                    className="px-6 py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Crear Nueva Actividad
                  </button>
                )}
              </div>
            </div>

            {actividades.length === 0 ? (
              <div className="p-16 rounded-3xl bg-white dark:bg-zinc-900/50 border border-dashed border-gray-300 dark:border-zinc-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-zinc-800 text-indigo-500 flex items-center justify-center mx-auto text-2xl">📋</div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-zinc-200">No hay actividades registradas en el proyecto</h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
                  {canEdit ? 'Aún no has registrado tareas en esta unidad. Presiona "Crear Nueva Actividad" para comenzar.' : 'El equipo aún no ha reportado actividades en este proyecto.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actividades.map((act) => {
                  const currStatus = getNormalizedStatus(act.estatus);
                  const statusInfo = KANBAN_COLUMNS.find((c) => c.id === currStatus) || KANBAN_COLUMNS[1];
                  return (
                    <motion.div
                      key={act.id}
                      whileHover={{ scale: 1.015, y: -2 }}
                      className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide border border-indigo-200 dark:border-indigo-800">
                            {act.nombreProyecto}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.headerClass}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-2">
                          {act.nombreActividad}
                        </h3>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-bold uppercase text-[10px]">Asignado a:</span>
                          <span className="font-extrabold text-gray-800 dark:text-gray-200 truncate">{act.usuarioAsignado}</span>
                        </div>
                        <div className="border-t border-gray-200/60 dark:border-zinc-700/60 pt-2 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-gray-400 block font-semibold">Inicio:</span>
                            <span className="font-bold text-gray-700 dark:text-zinc-300">{formatDate(act.fechaInicio)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 block font-semibold">Fin:</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatDate(act.fechaFin)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'kanban' && (
          <motion.div
            key="tab-kanban"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Tablero Kanban Ágil</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    5 Estatus Oficiales
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  {canEdit ? 'Arrastra las tarjetas entre columnas o utiliza los selectores para actualizar las etapas.' : '👁 Observa el estado del flujo del trabajo del equipo de forma sincronizada.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('actividades')}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                  Ver en Tarjetas Clásicas
                </button>
                {canEdit && (
                  <button
                    onClick={() => setActModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all"
                  >
                    + Nueva Actividad
                  </button>
                )}
              </div>
            </div>

            {actividades.length === 0 ? (
              <div className="p-16 rounded-3xl bg-white dark:bg-zinc-900/50 border border-dashed border-gray-300 dark:border-zinc-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-zinc-800 text-purple-500 flex items-center justify-center mx-auto text-2xl">📊</div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-zinc-200">El tablero Kanban está esperando tareas</h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
                  {canEdit ? 'Presiona "+ Nueva Actividad" y comiencen a movilizar el trabajo del proyecto.' : 'El equipo aún no cuenta con tareas asignadas para visualizar en el Kanban.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5 pb-6">
                {KANBAN_COLUMNS.map((col) => {
                  const actInCol = actividades.filter((a) => getNormalizedStatus(a.estatus) === col.id);
                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => {
                        if (canEdit) e.preventDefault();
                      }}
                      onDrop={() => handleDrop(col.id)}
                      className="flex flex-col rounded-3xl bg-gray-100/70 dark:bg-zinc-900/60 border border-gray-200/80 dark:border-zinc-800 min-h-[500px] overflow-hidden transition-all shadow-sm hover:border-purple-300 dark:hover:border-zinc-700"
                    >
                      {/* Cabecera de la Columna */}
                      <div className={`p-4 border-b flex items-center justify-between font-black text-sm ${col.headerClass}`}>
                        <div className="flex items-center gap-2 truncate">
                          <span>{col.icon}</span>
                          <span className="truncate">{col.label}</span>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs flex items-center justify-center shadow-sm font-extrabold border border-black/5 dark:border-white/10">
                          {actInCol.length}
                        </span>
                      </div>

                      {/* Lista de Tarjetas en Columna */}
                      <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto">
                        {actInCol.map((act) => {
                          const isUpdating = updatingStatusId === act.id;
                          return (
                            <div
                              key={act.id}
                              draggable={canEdit && !isUpdating}
                              onDragStart={() => setDraggedActId(act.id)}
                              className={`p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700/80 shadow-sm transition-all space-y-3 ${canEdit ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600' : ''
                                } ${isUpdating ? 'opacity-50 animate-pulse pointer-events-none' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                                  {act.nombreActividad}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2 py-1.5 px-2 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800">
                                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                  {act.usuarioAsignado ? act.usuarioAsignado.charAt(0).toUpperCase() : '👤'}
                                </div>
                                <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 truncate">
                                  {act.usuarioAsignado || 'Sin asignar'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-zinc-700/60 font-medium">
                                <span>📅 {formatDate(act.fechaFin)}</span>
                                {canEdit ? (
                                  <select
                                    value={col.id}
                                    onChange={(e) => handleUpdateActividadStatus(act.id, e.target.value)}
                                    className="text-[10px] font-bold py-0.5 px-1.5 rounded-lg bg-indigo-50 dark:bg-zinc-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 focus:outline-none cursor-pointer hover:bg-indigo-100"
                                  >
                                    {KANBAN_COLUMNS.map((c) => (
                                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-gray-500 font-bold">● {col.label}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {actInCol.length === 0 && (
                          <div className="h-32 flex items-center justify-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center p-4">
                            <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500">
                              {canEdit ? 'Arrastra tareas aquí' : 'Sin actividades'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* --- PESTAÑA HERRAMIENTAS (movida dentro de AnimatePresence) --- */}
        {activeTab === 'herramientas' && (
          <motion.div
            key="tab-herramientas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <HerramientasEvaluadasTable proyectoId={proyecto.id} userRol={user?.rol || ''} />
            <DocenteFeedbackBox designSprintId={proyecto.id} userRol={user?.rol || ''} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL AGREGAR MIEMBRO (TAB 2) --- */}
      <AnimatePresence>
        {memberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  👥
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Inscribir Nuevo Miembro</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Agrega compañeros y asigna su puesto en el proyecto</p>
                </div>
              </div>

              {candidatos.length === 0 ? (
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">No hay alumnos externos disponibles para agregar</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Todos los estudiantes registrados en el sistema ya forman parte de tu equipo actual.</p>
                  <div className="pt-3">
                    <button onClick={() => setMemberModal(false)} className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs">Cerrar</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Buscar Candidato</label>
                    <input
                      type="text"
                      placeholder="Filtrar por nombre o correo..."
                      value={searchCandidato}
                      onChange={(e) => setSearchCandidato(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">
                      Seleccionar Alumno <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={memberForm.usuId}
                      onChange={(e) => setMemberForm({ ...memberForm, usuId: parseInt(e.target.value) || 0 })}
                      className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-extrabold text-gray-900 dark:text-white"
                    >
                      <option value="0" disabled>Selecciona al alumno...</option>
                      {candidatosFiltrados.map((c) => (
                        <option key={c.usuId} value={c.usuId}>
                          {c.nombreCompleto} — ({c.correo}) [{c.grupo}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400">Rol en el Equipo <span className="text-red-500">*</span></label>
                      <button
                        type="button"
                        onClick={() => setMemberForm({ ...memberForm, isCustom: !memberForm.isCustom })}
                        className="text-[11px] font-bold text-purple-600 dark:text-purple-400 underline"
                      >
                        {memberForm.isCustom ? 'Seleccionar de lista de roles' : '✍️ Escribir rol personalizado'}
                      </button>
                    </div>

                    {memberForm.isCustom ? (
                      <input
                        type="text"
                        required
                        placeholder="Ej. Arquitecto Cloud, DevOps Engineer..."
                        value={memberForm.customRol}
                        onChange={(e) => setMemberForm({ ...memberForm, customRol: e.target.value })}
                        className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white"
                      />
                    ) : (
                      <select
                        value={memberForm.rol}
                        onChange={(e) => setMemberForm({ ...memberForm, rol: e.target.value })}
                        className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-extrabold text-indigo-600 dark:text-indigo-400"
                      >
                        {rolesDisponibles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button type="button" onClick={() => setMemberModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-zinc-400">Cancelar</button>
                    <button
                      type="submit"
                      disabled={savingMember || memberForm.usuId === 0}
                      className="px-6 py-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-extrabold text-sm shadow-md disabled:opacity-50"
                    >
                      {savingMember ? 'Inscribiendo...' : 'Confirmar e Inscribir'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL EDICIÓN PROYECTO (TAB 1) --- */}
      <AnimatePresence>
        {editInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-5"
            >
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Modificar Datos del Proyecto</h3>
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={infoForm.nombre}
                    onChange={(e) => setInfoForm({ ...infoForm, nombre: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Descripción / Alcance</label>
                  <textarea
                    rows={3}
                    value={infoForm.descripcion}
                    onChange={(e) => setInfoForm({ ...infoForm, descripcion: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      required
                      value={infoForm.fechaInicio}
                      onChange={(e) => setInfoForm({ ...infoForm, fechaInicio: e.target.value })}
                      className="w-full h-12 px-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      required
                      value={infoForm.fechaFin}
                      onChange={(e) => setInfoForm({ ...infoForm, fechaFin: e.target.value })}
                      className="w-full h-12 px-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setEditInfoModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-zinc-400">Cancelar</button>
                  <button type="submit" disabled={savingInfo} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-sm shadow-md disabled:opacity-50">
                    {savingInfo ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL CREAR ACTIVIDAD (TABS 4 y 5) --- */}
      <AnimatePresence>
        {actModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  +
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Nueva Actividad</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Asigna tareas claras a tu equipo</p>
                </div>
              </div>

              <form onSubmit={handleCreateActividad} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Nombre de la Actividad <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Diseñar mockups de interfaz principal"
                    value={actForm.nombreActividad}
                    onChange={(e) => setActForm({ ...actForm, nombreActividad: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Descripción</label>
                  <textarea
                    required
                    placeholder="Detalles de lo que se debe hacer..."
                    value={actForm.descripcion}
                    onChange={(e) => setActForm({ ...actForm, descripcion: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-sm text-gray-900 dark:text-white resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block">Criterios de Aceptación</label>
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={loadingAI}
                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loadingAI ? 'Generando...' : '✨ Generar con IA'}
                    </button>
                  </div>
                  <textarea
                    value={actForm.criterios}
                    onChange={(e) => setActForm({ ...actForm, criterios: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-gray-900 dark:text-white resize-none"
                    rows={3}
                    placeholder="- [ ] Criterio 1..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Miembro Asignado <span className="text-red-500">*</span></label>
                  <select
                    value={actForm.usuarioAsignadoId}
                    onChange={(e) => setActForm({ ...actForm, usuarioAsignadoId: parseInt(e.target.value) || 0 })}
                    className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white"
                  >
                    {equipo.miembros.map((m) => (
                      <option key={m.usuId} value={m.usuId}>
                        {m.nombre} ({m.rol}) {m.esCreador ? '- Líder' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Fecha Inicio <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={actForm.fechaInicio}
                      onChange={(e) => setActForm({ ...actForm, fechaInicio: e.target.value })}
                      className="w-full h-12 px-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-400 block mb-1">Fecha Fin <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={actForm.fechaFin}
                      onChange={(e) => setActForm({ ...actForm, fechaFin: e.target.value })}
                      className="w-full h-12 px-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setActModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-zinc-400">Cancelar</button>
                  <button type="submit" disabled={savingAct} className="px-6 py-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-extrabold text-sm shadow-md disabled:opacity-50">
                    {savingAct ? 'Registrando...' : 'Asignar Actividad'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProyectoDetallePage() {
  return (
    <Suspense fallback={<Loader message="Desplegando pestañas y vistas del proyecto..." />}>
      <ProyectoDetalleContent />
    </Suspense>
  );
}