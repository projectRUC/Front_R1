'use client';
import { useState, useCallback, useEffect } from 'react';
import {
  FaseDesignSprint,
  type AvanceFase,
  type DesignSprintEvidence,
  type PhaseUIState,
  type CreateEvidenceDTO,
} from '@/types/designSprint';
import { registrarEvidencia, consultarAvance, consultarFase, DesignSprintApiError } from '../services/designSprintApi';

interface UseDesignSprintOptions { equipoId: number; proyectoId: string; }
interface UseDesignSprintReturn {
  phases: PhaseUIState[];
  activePhase: FaseDesignSprint;
  evidence: DesignSprintEvidence | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  setActivePhase: (phase: FaseDesignSprint) => void;
  submitEvidence: (data: Omit<CreateEvidenceDTO, 'equipoId' | 'proyectoId'>) => Promise<DesignSprintEvidence>;
  reloadAvance: () => Promise<void>;
  clearMessages: () => void;
}

function mapAvanceToUIState(avance: AvanceFase[]): PhaseUIState[] {
  let previousCompleted = true;
  return avance.map((item) => {
    const status: PhaseUIState['status'] = item.iniciado ? 'completed' : previousCompleted ? 'pending' : 'blocked';
    if (!item.iniciado) previousCompleted = false;
    return { fase: item.fase as FaseDesignSprint, status, hasEvidence: item.iniciado };
  });
}

const DEFAULT_PHASES: PhaseUIState[] = [
  { fase: FaseDesignSprint.MAPEAR, status: 'pending', hasEvidence: false },
  { fase: FaseDesignSprint.BOCETAR, status: 'blocked', hasEvidence: false },
  { fase: FaseDesignSprint.DECIDIR, status: 'blocked', hasEvidence: false },
  { fase: FaseDesignSprint.PROTOTIPAR, status: 'blocked', hasEvidence: false },
];

export function useDesignSprint({ equipoId, proyectoId }: UseDesignSprintOptions): UseDesignSprintReturn {
  const [phases, setPhases] = useState<PhaseUIState[]>(DEFAULT_PHASES);
  const [activePhase, setActivePhase] = useState<FaseDesignSprint>(FaseDesignSprint.MAPEAR);
  const [evidence, setEvidence] = useState<DesignSprintEvidence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => { setError(null); setSuccessMessage(null); }, []);

  const reloadAvance = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const data = await consultarAvance(equipoId, proyectoId);
      setPhases(mapAvanceToUIState(data));
    } catch (err) {
      setError(err instanceof DesignSprintApiError ? err.message : 'Error al cargar avance');
    } finally { setIsLoading(false); }
  }, [equipoId, proyectoId]);

  useEffect(() => { reloadAvance(); }, [reloadAvance]);

  const loadEvidence = useCallback(async (fase: FaseDesignSprint) => {
    setEvidence(null); setError(null); setIsLoading(true);
    try {
      const data = await consultarFase(equipoId, proyectoId, fase);
      setEvidence(data);
    } catch (err) {
      if (err instanceof DesignSprintApiError && err.statusCode === 400) {
        setEvidence(null);
      } else {
        setError(err instanceof DesignSprintApiError ? err.message : 'Error al cargar evidencia');
      }
    } finally { setIsLoading(false); }
  }, [equipoId, proyectoId]);

  useEffect(() => { if (activePhase) loadEvidence(activePhase); }, [activePhase, loadEvidence]);

  const submitEvidence = useCallback(async (data: Omit<CreateEvidenceDTO, 'equipoId' | 'proyectoId'>) => {
    setIsLoading(true); setError(null); setSuccessMessage(null);
    try {
      const payload: CreateEvidenceDTO = { ...data, equipoId, proyectoId };
      console.log('📤 Enviando payload:', {
        equipoId: payload.equipoId, proyectoId: payload.proyectoId, fase: payload.fase,
        archivosUrls: payload.archivosUrls,
        comentarios: payload.comentarios,
      });
      const result = await registrarEvidencia(payload);
      setEvidence(result);
      setSuccessMessage(`¡Fase "${result.fase}" registrada exitosamente!`);
      await reloadAvance();
      setTimeout(() => setSuccessMessage(null), 5000);
      return result;
    } catch (err) {
      const message = err instanceof DesignSprintApiError ? err.message : 'Error al guardar';
      setError(message);
      throw err;
    } finally { setIsLoading(false); }
  }, [equipoId, proyectoId, reloadAvance]);

  return { phases, activePhase, evidence, isLoading, error, successMessage, setActivePhase, submitEvidence, reloadAvance, clearMessages };
}