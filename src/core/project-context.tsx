/**
 * Oczko State — Kontekst stanu projektów i aktywnego licznika (SQLite & Facade)
 * Zgodny z zasadami: offline-first, reaktywność, bezpieczna trwałość (BR-PROJ-001...005, BR-LICZ-008).
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DatabaseClient, openOczkoDatabase, createInMemoryDatabase } from './database';
import {
  EnrichedProject,
  CreateProjectInput,
  createFullProject,
  loadAllProjectsWithProgress,
  seedDefaultProjectIfEmpty,
} from './project-service';
import { ProjectManagerFacade } from './project-facade';
import {
  loadProjectFacade,
  persistProjectStep,
  persistProjectUndo,
} from './project-repository';
import { ComputedCounterState } from './counter-engine';

export interface ProjectContextValue {
  db: DatabaseClient | null;
  projects: EnrichedProject[];
  activeProject: EnrichedProject | null;
  activePartName: string | null;
  activeCounterId: string | null;
  activeCounterState: ComputedCounterState | null;
  isLoading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<string>;
  selectActiveCounter: (projectId: string, counterId: string) => Promise<void>;
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
      let curProjId = activeProjectId;
      if (!curProjId && allProjects.length > 0) {
        curProjId = allProjects[0].id;
        setActiveProjectId(curProjId);
      }

      if (curProjId) {
        const facade = await loadProjectFacade(db, curProjId);
        setActiveFacade(facade);

        // Wybór aktywnego licznika
        const currentProject = allProjects.find((p) => p.id === curProjId);
        let curCounterId = activeCounterId;
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
  }, [db, activeProjectId, activeCounterId]);

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
      }
    } catch (err: any) {
      setError(err.message ?? 'Błąd operacji cofania');
    }
  }, [db, activeFacade, activeCounterId]);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;
  let activePartName: string | null = null;
  if (activeProject && activeCounterId) {
    for (const part of activeProject.parts) {
      if (part.counters.some((c) => c.id === activeCounterId)) {
        activePartName = part.name;
        break;
      }
    }
  }

  const value: ProjectContextValue = {
    db,
    projects,
    activeProject,
    activePartName,
    activeCounterId,
    activeCounterState,
    isLoading,
    error,
    refreshProjects,
    createProject,
    selectActiveCounter,
    stepCounter,
    undoCounter,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject musi być użyte wewnątrz ProjectProvider');
  }
  return context;
}
