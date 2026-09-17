import React, { useState } from 'react';
import { ReviewQueueTable } from '../components/domain/ReviewQueueTable';
import { LinkedFilterBar } from '../components/domain/LinkedFilterBar';
import { ListChecks, Database } from 'lucide-react';
import { useDatasetStore, DATASETS } from '../stores/dataset-store';

export default function Triage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);

  return (
    <div className="p-4 bg-background text-foreground space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" /> Incident Triage & Review Queue
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Operational review queue for field safety observations, near-misses, and SIF precursors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-surface-1 border border-border rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>Dataset: <strong>{activeMeta?.label}</strong></span>
            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold">
              {activeMeta?.tag}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-1 border border-border rounded-lg shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium text-foreground-dim">Live Ingestion Active</span>
          </div>
        </div>
      </div>

      <LinkedFilterBar 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <ReviewQueueTable filter={activeFilter} searchTerm={searchTerm} />
    </div>
  );
}