import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAllWells, fetchActiveWell } from '../api';
import type { Well, ActiveWell } from '../types';

interface ActiveWellContextValue {
  /** The full ActiveWell telemetry object for the selected well */
  activeWell: ActiveWell | null;
  /** All available wells that can be selected */
  allWells: Well[];
  /** The ID of the currently selected well */
  selectedWellId: string;
  /** Switch the active well */
  selectWell: (wellId: string) => void;
  /** Lat/Lng of the selected well */
  activeWellLat: number;
  activeWellLng: number;
  /** Loading state */
  loading: boolean;
}

// Default coordinates (DLJ-NEW-01)
const DEFAULT_LAT = 27.374;
const DEFAULT_LNG = 95.318;
const DEFAULT_WELL_ID = 'DLJ-NEW-01';

const ActiveWellContext = createContext<ActiveWellContextValue>({
  activeWell: null,
  allWells: [],
  selectedWellId: DEFAULT_WELL_ID,
  selectWell: () => {},
  activeWellLat: DEFAULT_LAT,
  activeWellLng: DEFAULT_LNG,
  loading: true,
});

export function useActiveWell() {
  return useContext(ActiveWellContext);
}

/**
 * Generates simulated telemetry for a historical well selected as "active".
 * Since only DLJ-NEW-01 has real telemetry from the backend, we derive
 * plausible values from the Well record for other wells.
 */
function wellToActiveWell(well: Well): ActiveWell {
  return {
    id: well.id,
    name: well.name,
    lat: well.lat,
    lng: well.lng,
    spudDate: well.spudDate,
    plannedTD: well.totalDepth + 200,
    currentDepth: well.totalDepth,
    daysOnWell: Math.round((Date.now() - new Date(well.spudDate).getTime()) / (1000 * 60 * 60 * 24)),
    operator: well.operator,
    wellType: well.wellType,
    rig: 'OIL RIG-14 (BHEL BH-350)',
    mudType: 'Water-Based KCl/Polymer',
    mudWeight: well.riskLevel === 'critical' ? 1.52 : well.riskLevel === 'high' ? 1.42 : 1.35,
    rop: +(6 + Math.random() * 6).toFixed(1),
    wob: +(14 + Math.random() * 8).toFixed(1),
    torque: +(10 + Math.random() * 6).toFixed(1),
    rpm: Math.round(100 + Math.random() * 40),
    sppa: Math.round(2600 + Math.random() * 500),
    currentFormation: 'Barail Group',
    casingProgram: [
      { size: '20"', depth: 180, type: 'Conductor Casing' },
      { size: '13⅜"', depth: 750, type: 'Surface Casing' },
      { size: '9⅝"', depth: Math.round(well.totalDepth * 0.5), type: 'Intermediate Casing' },
    ],
    trajectory: [
      { md: 0, tvd: 0, displacement: 0 },
      { md: Math.round(well.totalDepth * 0.25), tvd: Math.round(well.totalDepth * 0.248), displacement: 15 },
      { md: Math.round(well.totalDepth * 0.5), tvd: Math.round(well.totalDepth * 0.495), displacement: 45 },
      { md: Math.round(well.totalDepth * 0.75), tvd: Math.round(well.totalDepth * 0.738), displacement: 100 },
      { md: well.totalDepth, tvd: Math.round(well.totalDepth * 0.975), displacement: 160 },
    ],
  };
}

export function ActiveWellProvider({ children }: { children: React.ReactNode }) {
  const [activeWell, setActiveWell] = useState<ActiveWell | null>(null);
  const [allWells, setAllWells] = useState<Well[]>([]);
  const [selectedWellId, setSelectedWellId] = useState<string>(DEFAULT_WELL_ID);
  const [loading, setLoading] = useState(true);

  // Initial load: fetch all wells + the real active well
  useEffect(() => {
    Promise.all([fetchActiveWell(), fetchAllWells()])
      .then(([aw, wells]) => {
        setActiveWell(aw);
        setAllWells(wells);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectWell = useCallback(
    (wellId: string) => {
      setSelectedWellId(wellId);
      if (wellId === DEFAULT_WELL_ID) {
        // Fetch the real active well telemetry
        setLoading(true);
        fetchActiveWell()
          .then((aw) => {
            setActiveWell(aw);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        // Generate simulated telemetry from the well record
        const well = allWells.find((w) => w.id === wellId);
        if (well) {
          setActiveWell(wellToActiveWell(well));
        }
      }
    },
    [allWells]
  );

  const activeWellLat = activeWell?.lat ?? DEFAULT_LAT;
  const activeWellLng = activeWell?.lng ?? DEFAULT_LNG;

  return (
    <ActiveWellContext.Provider
      value={{
        activeWell,
        allWells,
        selectedWellId,
        selectWell,
        activeWellLat,
        activeWellLng,
        loading,
      }}
    >
      {children}
    </ActiveWellContext.Provider>
  );
}
