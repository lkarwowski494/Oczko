/**
 * Oczko Core — Zarządzanie częściami projektu i hierarchią liczników
 */

export interface ProjectPartDefinition {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  targetRows?: number;
}

export interface ProjectHierarchyNode {
  part: ProjectPartDefinition;
  counters: Array<{
    id: string;
    name: string;
    type: string;
    currentValue: number;
  }>;
}

/**
 * Organizuje płaską listę części i liczników w drzewo strukturalne projektu.
 */
export function buildProjectHierarchy(
  parts: ProjectPartDefinition[],
  counters: Array<{ id: string; partId: string; name: string; counterType: string; currentValue: number }>
): ProjectHierarchyNode[] {
  const sortedParts = [...parts].sort((a, b) => a.sortOrder - b.sortOrder);

  return sortedParts.map((part) => {
    const partCounters = counters
      .filter((c) => c.partId === part.id)
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: c.counterType,
        currentValue: c.currentValue,
      }));

    return {
      part,
      counters: partCounters,
    };
  });
}
