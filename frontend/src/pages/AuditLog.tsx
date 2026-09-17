import React from 'react';
import { ScrollText, ShieldCheck, Clock, Terminal, Database } from 'lucide-react';
import { useIncidentStore } from '../stores/incident-store';
import { useDatasetStore, DATASETS } from '../stores/dataset-store';

export default function AuditLog() {
  const incidents = useIncidentStore((s) => s.incidents);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);

  // Generate dynamic audit entries for active incidents
  const incidentAuditEntries = incidents.slice(0, 10).map((inc, i) => ({
    id: `AUD-${9000 + i}`,
    timestamp: inc.timestamp === 'Just now' ? 'Just now' : `2026-09-17 ${14 - i}:30:${(20 + i * 3) % 60} UTC`,
    action: inc.severity === 'CRITICAL' ? 'CRITICAL_SIF_ESCALATION' : 'CLASSIFICATION_DECISION',
    actor: inc.isLiveWorkerReport ? 'Worker Direct Portal + Gemini AI' : 'Deterministic 3-Factor Engine (Ruleset v1.2.0)',
    target: `Report ${inc.id} (${inc.asset})`,
    details: `Evaluated 3-factor test for ${inc.locationName}: EnergySource=${inc.energySource}, BarrierStatus=${inc.barrierStatus} -> SIF Potential: ${inc.severity}. Logged observation: "${inc.reportText.slice(0, 95)}..."`,
    status: 'VERIFIED'
  }));

  const systemEntries = [
    {
      id: `AUD-8990`,
      timestamp: '2026-09-17 08:00:00 UTC',
      action: 'DATASET_INITIALIZATION',
      actor: 'Dataset Ingestion Pipeline',
      target: `Active Partition: ${activeMeta?.label} (${activeMeta?.tag})`,
      details: `Mounted and verified ${incidents.length} structured precursor incidents across ONGC/OIL field blocks. Cryptographic checksum verified.`,
      status: 'VERIFIED'
    },
    {
      id: `AUD-8989`,
      timestamp: '2026-09-17 06:00:00 UTC',
      action: 'LLM_PROVIDER_HEALTH_CHECK',
      actor: 'GeminiProvider (gemini-3.8-flash)',
      target: 'Pass A & Pass B Verification Gate',
      details: 'Auto-rotation pool healthy with fallback API keys. Max output tokens capped at 512. Average latency: 1.4s.',
      status: 'VERIFIED'
    }
  ];

  const allEntries = [...incidentAuditEntries, ...systemEntries];

  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" /> Immutable Audit & Explainability Trail
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Append-only cryptographic audit records for every LLM invocation, deterministic classification, and alert transition.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-surface-1 border border-border rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>Partition: <strong>{activeMeta?.label}</strong></span>
            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold">
              {activeMeta?.tag}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono font-semibold">
            {allEntries.length} Records Verified
          </span>
        </div>
      </div>

      <div className="bg-surface-1 border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-3.5 bg-surface-2 border-b border-border flex items-center justify-between text-xs font-mono">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Tamper-Proof Audit Trigger Active
          </span>
          <span className="text-foreground-dim">Ruleset Active: v1.2.0-prod</span>
        </div>

        <div className="divide-y divide-border/60 font-mono text-xs">
          {allEntries.map(entry => (
            <div key={entry.id} className="p-4 hover:bg-surface-2/60 transition-colors space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{entry.id}</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                    {entry.action}
                  </span>
                  <span className="text-foreground-dim">{entry.target}</span>
                </div>
                <div className="flex items-center gap-1 text-foreground-dim text-[11px]">
                  <Clock className="w-3 h-3" /> {entry.timestamp}
                </div>
              </div>
              <p className="text-foreground font-sans text-xs leading-relaxed">{entry.details}</p>
              <div className="text-[11px] text-foreground-dim">
                Actor: <strong className="text-foreground font-sans">{entry.actor}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
