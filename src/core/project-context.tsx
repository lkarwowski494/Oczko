/**
 * Oczko State — Kontekst stanu projektów, części i powiązanych liczników (SQLite & Facade)
 * Zgodny z zasadami: offline-first, reaktywność, bezpieczna trwałość (BR-PROJ-001...005, BR-LICZ-003, BR-LICZ-005).
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { DatabaseClient, openOczkoDatabase, createInMemoryDatabase, loadPersistedSettings } from './database';
import { autoBackup } from './backup-service';
import { setLang } from './i18n';
import { setUnitSystem } from './unit-converter';
import {
  EnrichedProject,
  CreateProjectInput,
  createFullProject,
  loadAllProjectsWithProgress,
  seedDefaultProjectIfEmpty,
  AddPartInput,
  AddLinkedCounterInput,
  addPartToProject,
  addLinkedCounterToPart,
} from './project-service';
import { ProjectManagerFacade } from './project-facade';
import {
  loadProjectFacade,
  persistProjectStep,
  persistProjectUndo,
} from './project-repository';
import { ComputedCounterState } from './counter-engine';
import { AppAccessProvider } from './app-access-context';
import { ImpulsePaywallModal } from '../components/ImpulsePaywallModal';

export interface LinkedCounterDisplayState extends ComputedCounterState {
  name: string;
  moduloCycle?: number;
}

export interface ProjectContextValue {
  db: DatabaseClient | null;
  projects: EnrichedProject[];
  activeProject: EnrichedProject | null;
  activePartId: string | null;
  activePartName: string | null;
  activeCounterId: string | null;
  activeCounterState: ComputedCounterState | null;
  activeLinkedCounterStates: LinkedCounterDisplayState[];
  isLoading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<string>;
  selectActiveCounter: (projectId: string, counterId: string) => Promise<void>;
  switchActivePart: (partId: string) => Promise<void>;
  addPart: (projectId: string, input: AddPartInput) => Promise<void>;
  addLinkedCounter: (partId: string, parentCounterId: string, input: AddLinkedCounterInput) => Promise<void>;
  stepCounter: (direction: 'increment' | 'decrement') => Promise<void>;
  undoCounter: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export interface ProjectProviderProps {
  children: ReactNode;
  initialDb?: DatabaseClient;
}

export function ProjectProvider({ children, initialDb }: ProjectProviderProps) {
  const [db, setDb] = useState<DatabaseClient | null>(initialDb ?? null);
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeCounterId, setActiveCounterId] = useState<string | null>(null);
  const [activeFacade, setActiveFacade] = useState<ProjectManagerFacade | null>(null);
  const [activeCounterState, setActiveCounterState] = useState<ComputedCounterState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeProjectIdRef = useRef<string | null>(activeProjectId);
  activeProjectIdRef.current = activeProjectId;
  const activeCounterIdRef = useRef<string | null>(activeCounterId);
  activeCounterIdRef.current = activeCounterId;

  // Inicjalizacja bazy SQLite
  useEffect(() => {
    let isMounted = true;

    async function initDb() {
      try {
        let client = initialDb;
        if (!client) {
          try {
            client = await openOczkoDatabase();
          } catch (_e) {
            // Środowisko testowe bez natywnego SQLite (fallback do in-memory)
            client = createInMemoryDatabase();
          }
        }

        if (isMounted) {
          setDb(client);
          loadPersistedSettings(client).then((s) => {
            if (s.language === 'pl' || s.language === 'en') setLang(s.language as any);
            if (s.unitSystem === 'metric' || s.unitSystem === 'imperial') setUnitSystem(s.unitSystem as any);
          }).catch(() => {});
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message ?? 'Błąd inicjalizacji bazy SQLite');
          setIsLoading(false);
        }
      }
    }

    initDb();

    return () => {
      isMounted = false;
    };
  }, [initialDb]);

  // Załadowanie projektów i zainicjowanie aktywnego licznika
  const refreshProjects = useCallback(async () => {
    if (!db) return;
    try {
      setIsLoading(true);
      await seedDefaultProjectIfEmpty(db);
      const allProjects = await loadAllProjectsWithProgress(db);
      setProjects(allProjects);

      // Wybór aktywnego projektu jeśli żaden nie jest wybrany
      let curProjId = activeProjectIdRef.current;
      if (!curProjId && allProjects.length > 0) {
        curProjId = allProjects[0].id;
        setActiveProjectId(curProjId);
      }

      if (curProjId) {
        const facade = await loadProjectFacade(db, curProjId);
        setActiveFacade(facade);

        // Wybór aktywnego licznika
        const currentProject = allProjects.find((p) => p.id === curProjId);
        let curCounterId = activeCounterIdRef.current;
        if (!curCounterId && currentProject && currentProject.parts.length > 0) {
          curCounterId = currentProject.parts[0].counters[0]?.id ?? null;
        }

        if (curCounterId) {
          setActiveCounterId(curCounterId);
          setActiveCounterState(facade.getCounterState(curCounterId));
        }
      }
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message ?? 'Błąd ładowania projektów');
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      refreshProjects();
    }
  }, [db, refreshProjects]);

  // Tworzenie nowego projektu
  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<string> => {
      if (!db) throw new Error('Baza danych nie jest gotowa.');
      const result = await createFullProject(db, input);
      await refreshProjects();
      await selectActiveCounter(result.project.id, result.activeCounterId);
      autoBackup(db).catch(() => {});
      return result.project.id;
    },
    [db, refreshProjects]
  );

  // Wybór aktywnego projektu i licznika
  const selectActiveCounter = useCallback(
    async (projectId: string, counterId: string) => {
      if (!db) return;
      try {
        const facade = await loadProjectFacade(db, projectId);
        setActiveProjectId(projectId);
        setActiveCounterId(counterId);
        setActiveFacade(facade);
        setActiveCounterState(facade.getCounterState(counterId));
      } catch (err: any) {
        setError(err.message ?? 'Błąd wyboru licznika');
      }
    },
    [db]
  );

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  // Przełączanie części w aktywnym projekcie
  const switchActivePart = useCallback(
    async (partId: string) => {
      if (!activeProject) return;
      const part = activeProject.parts.find((p) => p.id === partId);
      const counterId = part?.counters[0]?.id;
      if (counterId) {
        await selectActiveCounter(activeProject.id, counterId);
      }
    },
    [activeProject, selectActiveCounter]
  );

  // Dodawanie nowej części do projektu
  const addPart = useCallback(
    async (projectId: string, input: AddPartInput) => {
      if (!db) return;
      const res = await addPartToProject(db, projectId, input);
      await refreshProjects();
      if (projectId === activeProjectId) {
        await selectActiveCounter(projectId, res.primaryCounter.id);
      }
      autoBackup(db).catch(() => {});
    },
    [db, activeProjectId, refreshProjects, selectActiveCounter]
  );

  // Dodawanie licznika powiązanego (np. warkocz, ażur)
  const addLinkedCounter = useCallback(
    async (partId: string, parentCounterId: string, input: AddLinkedCounterInput) => {
      if (!db || !activeProjectId) return;
      await addLinkedCounterToPart(db, partId, parentCounterId, input);
      await refreshProjects();
      await selectActiveCounter(activeProjectId, parentCounterId);
      autoBackup(db).catch(() => {});
    },
    [db, activeProjectId, refreshProjects, selectActiveCounter]
  );

  // Krok licznika (+1 / -1) z blokadą debounce i trwałym zapisem w SQLite
  const stepCounter = useCallback(
    async (direction: 'increment' | 'decrement') => {
      if (!db || !activeFacade || !activeCounterId) return;
      try {
        await persistProjectStep(
          db,
          activeFacade,
          activeCounterId,
          direction,
          'iphone',
          Date.now(),
          300
        );
        setActiveCounterState(activeFacade.getCounterState(activeCounterId));
        // Ciche odświeżenie postępów na liście projektów
        const updated = await loadAllProjectsWithProgress(db);
        setProjects(updated);
        autoBackup(db).catch(() => {});
      } catch (err: any) {
        setError(err.message ?? 'Błąd zapisu kroku licznika');
      }
    },
    [db, activeFacade, activeCounterId]
  );

  // Cofnięcie (UNDO) ostatniej operacji z trwałym zapisem w SQLite
  const undoCounter = useCallback(async () => {
    if (!db || !activeFacade || !activeCounterId) return;
    try {
      const success = await persistProjectUndo(
        db,
        activeFacade,
        activeCounterId,
        'iphone',
        Date.now()
      );
      if (success) {
        setActiveCounterState(activeFacade.getCounterState(activeCounterId));
        const updated = await loadAllProjectsWithProgress(db);
        setProjects(updated);
        autoBackup(db).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message ?? 'Błąd operacji cofania');
    }
  }, [db, activeFacade, activeCounterId]);

  let activePartId: string | null = null;
  let activePartName: string | null = null;
  if (activeProject && activeCounterId) {
    for (const part of activeProject.parts) {
      if (part.counters.some((c) => c.id === activeCounterId)) {
        activePartId = part.id;
        activePartName = part.name;
        break;
      }
    }
  }

  // Pobranie powiązanych liczników cyklicznych dla aktywnego licznika nadrzędnego
  const activeLinkedConfigs = activeFacade && activeCounterId
    ? activeFacade.getLinkedCounters(activeCounterId)
    : [];

  const activeLinkedCounterStates: LinkedCounterDisplayState[] = activeLinkedConfigs.map((cfg) => {
    const computed = activeFacade!.getCounterState(cfg.id);
    return {
      ...computed,
      name: cfg.name,
      moduloCycle: cfg.moduloCycle,
    };
  });

  const value: ProjectContextValue = {
    db,
    projects,
    activeProject,
    activePartId,
    activePartName,
    activeCounterId,
    activeCounterState,
    activeLinkedCounterStates,
    isLoading,
    error,
    refreshProjects,
    createProject,
    selectActiveCounter,
    switchActivePart,
    addPart,
    addLinkedCounter,
    stepCounter,
    undoCounter,
  };

  return (
    <ProjectContext.Provider value={value}>
      <AppAccessProvider db={db} currentProjectsCount={projects.length}>
        {children}
        <ImpulsePaywallModal />
      </AppAccessProvider>
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject musi być użyte wewnątrz ProjectProvider');
  }
  return context;
}

export function useOptionalProject(): ProjectContextValue | null {
  return useContext(ProjectContext);
}
