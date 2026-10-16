import { useState, useEffect } from 'react';
import { UnitSystem, getUnitSystem, subscribeUnitSystem } from './unit-converter';

/**
 * Reaktywny hook do odczytu i subskrypcji aktywnego systemu jednostek (metryczny / imperialny).
 */
export function useUnitSystem(): UnitSystem {
  const [system, setSystem] = useState<UnitSystem>(getUnitSystem());

  useEffect(() => {
    return subscribeUnitSystem(setSystem);
  }, []);

  return system;
}
