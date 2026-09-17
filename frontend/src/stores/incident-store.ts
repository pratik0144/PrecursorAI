import { create } from 'zustand';
import setAData from '../data/demo_set_a.json';
import setBData from '../data/demo_set_b.json';

export interface IncidentMarker {
  id: string;
  reportText: string;
  reportType: string;
  locationName: string;
  asset: string;
  lat: number;
  lng: number;
  severity: 'CRITICAL' | 'HIGH' | 'REVIEW' | 'ROUTINE';
  energySource: string;
  barrierStatus: string;
  timestamp: string;
  isLiveWorkerReport?: boolean;
  status: 'OPEN' | 'RESOLVED';
  resolvedAt?: string;
}

interface IncidentState {
  incidents: IncidentMarker[];
  activeIncident: IncidentMarker | null;
  addWorkerIncident: (incident: Omit<IncidentMarker, 'status'>) => void;
  setActiveIncident: (incident: IncidentMarker | null) => void;
  resolveIncident: (id: string) => void;
  reopenIncident: (id: string) => void;
  loadIncidents: (items: IncidentMarker[]) => void;
}

const DEMO_INCIDENTS: IncidentMarker[] = [
  {
    id: 'REP-4091',
    reportText: 'Workover rig #12: Annular preventer pressure loss during casing test with drill string suspended',
    reportType: 'NEAR_MISS',
    locationName: 'Assam / Duliajan / Well #44',
    asset: 'Wellhead WH-44 & Rig #12',
    lat: 27.35, lng: 95.32,
    severity: 'CRITICAL', energySource: 'PRESSURE', barrierStatus: 'FAILED',
    timestamp: '12m ago', status: 'OPEN',
  },
  {
    id: 'REP-4089',
    reportText: 'Heavy mechanical lift near active high-pressure flowline without certified rigger or spotter',
    reportType: 'SAFETY_OBSERVATION',
    locationName: 'Assam / Naharkatia Block',
    asset: 'Wellhead WH-44',
    lat: 27.30, lng: 95.28,
    severity: 'HIGH', energySource: 'GRAVITY', barrierStatus: 'MISSING',
    timestamp: '45m ago', status: 'OPEN',
  },
  {
    id: 'REP-4082',
    reportText: 'Contractor personnel observed in line-of-fire beneath kelly bushing while rotary was engaged',
    reportType: 'UNSAFE_ACT',
    locationName: 'Rajasthan / Barmer Basin',
    asset: 'Drilling Rig DR-03',
    lat: 25.75, lng: 71.38,
    severity: 'HIGH', energySource: 'MOTION', barrierStatus: 'BYPASSED',
    timestamp: '2h ago', status: 'OPEN',
  },
  {
    id: 'REP-4076',
    reportText: 'Minor drip leak from flare knockout drum flange; secondary containment berm verified intact',
    reportType: 'UNSAFE_CONDITION',
    locationName: 'Gujarat / Mehsana Assets',
    asset: 'GGS Plant 01',
    lat: 23.60, lng: 72.40,
    severity: 'REVIEW', energySource: 'CHEMICAL', barrierStatus: 'INTACT',
    timestamp: '5h ago', status: 'OPEN',
  },
  {
    id: 'REP-4065',
    reportText: 'Secondary safety wire on offshore supply crane whip line showed surface abrasion',
    reportType: 'SAFETY_OBSERVATION',
    locationName: 'KG Offshore Deepwater Block',
    asset: 'Platform Alpha',
    lat: 16.50, lng: 82.30,
    severity: 'ROUTINE', energySource: 'MECHANICAL', barrierStatus: 'DEGRADED',
    timestamp: '1d ago', status: 'OPEN',
  }
];

function getInitialIncidents(): IncidentMarker[] {
  try {
    const saved = localStorage.getItem('precursor_active_dataset');
    if (saved === 'setA') return setAData.incidents as unknown as IncidentMarker[];
    if (saved === 'setB') return setBData.incidents as unknown as IncidentMarker[];
  } catch (e) {
    // ignore
  }
  return DEMO_INCIDENTS;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: getInitialIncidents(),
  activeIncident: null,
  addWorkerIncident: (newIncident) =>
    set((state) => ({
      incidents: [{ ...newIncident, status: 'OPEN' as const }, ...state.incidents],
      activeIncident: { ...newIncident, status: 'OPEN' as const },
    })),
  setActiveIncident: (incident) => set({ activeIncident: incident }),
  resolveIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id
          ? { ...inc, status: 'RESOLVED' as const, resolvedAt: new Date().toLocaleTimeString() }
          : inc
      ),
    })),
  reopenIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id
          ? { ...inc, status: 'OPEN' as const, resolvedAt: undefined }
          : inc
      ),
    })),
  loadIncidents: (items) =>
    set({ incidents: items, activeIncident: null }),
}));

export { DEMO_INCIDENTS };
