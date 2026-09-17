import React, { useState } from 'react';
import { ReviewQueueTable } from '../components/domain/ReviewQueueTable';
import { LinkedFilterBar } from '../components/domain/LinkedFilterBar';
import { ListChecks } from 'lucide-react';

export default function Triage() {
  const [activeFilter, setActiveFilter] = useState('ALL');

  return (
    <div className="p-4 bg-background text-foreground space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" /> Incident Triage & Review Queue
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Operational review queue for field safety observations, near-misses, and SIF precursors.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-1 border border-border rounded-md shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-medium text-foreground-dim">Live Event Ingestion Active</span>
        </div>
      </div>

      <LinkedFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <ReviewQueueTable />
    </div>
  );
}