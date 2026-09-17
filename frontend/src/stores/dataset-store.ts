import { create } from 'zustand';
import setAData from '../data/demo_set_a.json';
import setBData from '../data/demo_set_b.json';
import { useIncidentStore, DEMO_INCIDENTS, IncidentMarker } from './incident-store';

export type DatasetId = 'demo' | 'setA' | 'setB';

export interface DatasetMeta {
  id: DatasetId;
  label: string;
  tag: string;
  description: string;
  file: string | null;
}

export const DATASETS: DatasetMeta[] = [
  { id: 'demo', label: 'Built-in Demo', tag: 'DEFAULT', description: 'Standard synthetic baseline incidents', file: null },
  { id: 'setA', label: 'Sample Data A', tag: 'SET A', description: 'Assam & Barmer field data — H2S leaks, BOP failures, dropped objects', file: '/data/demo_set_a.json' },
  { id: 'setB', label: 'Sample Data B', tag: 'SET B', description: 'KG Offshore & Mehsana field data — subsea blowouts, VSD faults, excavator strikes', file: '/data/demo_set_b.json' },
];

export interface RawDataset {
  incidents: any[];
  patterns: any[];
  alerts: any[];
  workerNarratives: any[];
}

const STORAGE_KEY = 'precursor_active_dataset';

function getSavedDatasetId(): DatasetId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'setA' || saved === 'setB' || saved === 'demo') {
      return saved;
    }
  } catch (e) {
    // localStorage may be unavailable
  }
  return 'demo';
}

function getRawDataForId(id: DatasetId): RawDataset | null {
  if (id === 'setA') return setAData as unknown as RawDataset;
  if (id === 'setB') return setBData as unknown as RawDataset;
  return null;
}

function getIncidentsForId(id: DatasetId): IncidentMarker[] {
  if (id === 'setA') return setAData.incidents as unknown as IncidentMarker[];
  if (id === 'setB') return setBData.incidents as unknown as IncidentMarker[];
  return DEMO_INCIDENTS;
}

interface DatasetState {
  activeDatasetId: DatasetId;
  rawData: RawDataset | null;
  isLoading: boolean;
  setActiveDataset: (id: DatasetId) => void;
  loadDataset: (id: DatasetId) => Promise<void>;
}

const initialId = getSavedDatasetId();
const initialRaw = getRawDataForId(initialId);

export const useDatasetStore = create<DatasetState>((set, get) => ({
  activeDatasetId: initialId,
  rawData: initialRaw,
  isLoading: false,

  setActiveDataset: (id: DatasetId) => {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      // ignore
    }

    const raw = getRawDataForId(id);
    const incs = getIncidentsForId(id);

    // Atomically sync the incident store with this dataset's incidents
    useIncidentStore.getState().loadIncidents(incs);

    set({ activeDatasetId: id, rawData: raw, isLoading: false });
  },

  loadDataset: async (id: DatasetId) => {
    get().setActiveDataset(id);
  },
}));
