import React from 'react';
import { ScrollText, ShieldCheck, Clock, Terminal } from 'lucide-react';

export default function AuditLog() {
  const auditEntries = [
    {
      id: 'AUD-9021',
      timestamp: '2026-09-16 14:32:18 UTC',
      action: 'CLASSIFICATION_DECISION',
      actor: 'Deterministic Engine (Ruleset v1.2.0)',
      target: 'Report REP-4091',
      details: 'Evaluated 3-factor test: HighEnergy=true, PersonInZone=true, BarrierCompromised=true -> SIF Precursor (PSIF). Risk score: 82.',
      status: 'VERIFIED'
    },
    {
      id: 'AUD-9020',
      timestamp: '2026-09-16 14:32:16 UTC',
      action: 'LLM_INVOCATION',
      actor: 'GeminiProvider (gemini-2.0-flash)',
      target: 'Pass B Reasoning (REP-4091)',
      details: 'Tokens: 412 in / 128 out. Latency: 1.12s. Extraction valid according to ExtractionPassB Pydantic schema.',
      status: 'VERIFIED'
    },
    {
      id: 'AUD-9019',
      timestamp: '2026-09-16 14:15:02 UTC',
      action: 'ALERT_LIFECYCLE_TRANSITION',
      actor: 'User: r.sharma@oil.in (HSSE Officer)',
      target: 'Alert ALT-801',
      details: 'Status transitioned: OPEN -> ACKNOWLEDGED. SLA timer reset: 18 mins to review.',
      status: 'VERIFIED'
    },
    {
      id: 'AUD-9018',
      timestamp: '2026-09-16 12:00:00 UTC',
      action: 'PATTERN_SWEEP_EXECUTION',
      actor: 'Tier-2 Sweep Worker (arq background task)',
      target: 'SweepRun SR-44',
      details: 'Scanned 142 reports across 30 days. Found 3 clusters. 1 new compounding pattern created.',
      status: 'VERIFIED'
    }
  ];

  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-4">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" /> Immutable Audit & Explainability Trail
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Append-only cryptographic audit records for every LLM invocation, deterministic classification, and alert transition.
        </p>
      </div>

      <div className="bg-surface-1 border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-3.5 bg-surface-2 border-b border-border flex items-center justify-between text-xs font-mono">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Tamper-Proof Audit Trigger Active
          </span>
          <span className="text-foreground-dim">Ruleset Active: v1.2.0-prod</span>
        </div>

        <div className="divide-y divide-border/60 font-mono text-xs">
          {auditEntries.map(entry => (
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
