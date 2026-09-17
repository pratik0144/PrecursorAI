import React from 'react';
import { Shield, Zap, AlertTriangle, CheckCircle, BarChart2, Database } from 'lucide-react';
import { SifFunnel } from '../components/domain/SifFunnel';
import { EnergyWheel } from '../components/domain/EnergyWheel';
import { useIncidentStore } from '../stores/incident-store';
import { useDatasetStore, DATASETS } from '../stores/dataset-store';

export default function SifAnalysis() {
  const incidents = useIncidentStore((s) => s.incidents);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);

  const total = incidents.length;
  const highEnergyCount = incidents.filter(i => 
    ['PRESSURE', 'GRAVITY', 'MOTION', 'ELECTRICAL', 'CHEMICAL', 'THERMAL', 'MECHANICAL'].includes(i.energySource)
  ).length;
  const sifPotentialCount = incidents.filter(i => 
    (i.severity === 'CRITICAL' || i.severity === 'HIGH') && i.barrierStatus !== 'INTACT'
  ).length;
  const escalatedCount = incidents.filter(i => i.severity === 'CRITICAL').length;

  // Dynamic Energy Sources breakdown
  const energyCounts: Record<string, number> = {};
  incidents.forEach(i => {
    const src = i.energySource?.toUpperCase() || 'MECHANICAL';
    energyCounts[src] = (energyCounts[src] || 0) + 1;
  });

  const energySources = Object.entries(energyCounts)
    .map(([type, count]) => ({
      type,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      high_energy: ['PRESSURE', 'GRAVITY', 'MOTION', 'ELECTRICAL', 'THERMAL'].includes(type)
    }))
    .sort((a, b) => b.count - a.count);

  // Dynamic Barrier Breakdown
  const barrierCounts: Record<string, number> = {};
  incidents.forEach(i => {
    const st = i.barrierStatus?.toUpperCase() || 'DEGRADED';
    barrierCounts[st] = (barrierCounts[st] || 0) + 1;
  });

  const barrierColorMap: Record<string, string> = {
    FAILED: 'bg-red-500',
    BYPASSED: 'bg-orange-500',
    DEGRADED: 'bg-amber-500',
    MISSING: 'bg-rose-500',
    INTACT: 'bg-emerald-500'
  };

  const barriers = Object.entries(barrierCounts).map(([status, count]) => ({
    name: status === 'FAILED' ? 'Critical Engineered Barrier Failure' :
          status === 'BYPASSED' ? 'Procedural / Permit Isolation Bypassed' :
          status === 'DEGRADED' ? 'Partial Barrier / Secondary Defense Degraded' :
          status === 'MISSING' ? 'Absence of Required Barrier Defense' :
          'Primary Barrier Intact & Operational',
    status,
    count,
    color: barrierColorMap[status] || 'bg-blue-500'
  })).sort((a, b) => b.count - a.count);

  const maxBarrierCount = Math.max(...barriers.map(b => b.count), 1);
  const topEnergySegments = energySources.slice(0, 3).map(e => e.type);

  return (
    <div className="p-4 bg-background text-foreground space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> SIF (Serious Injury & Fatality) Precursor Workspace
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Deep analytics on high-energy hazard exposure, barrier failure rates, and SCL classification distributions.
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
          <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-mono font-bold">
            {escalatedCount} SIF Escalations
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: SIF Funnel + Energy Wheel */}
        <div className="lg:col-span-6 space-y-4">
          <SifFunnel 
            total={total} 
            highEnergy={highEnergyCount} 
            sifPotential={sifPotentialCount} 
            escalated={escalatedCount} 
          />

          <div className="bg-surface-1 border border-border rounded-lg shadow-sm p-5">
            <h3 className="text-foreground-muted font-mono text-xs font-semibold uppercase tracking-wider mb-4">
              Energy Source Distribution (≥1,500 Joules Threshold)
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <EnergyWheel activeSegments={topEnergySegments} />
              <div className="flex-1 w-full space-y-2.5">
                {energySources.map((es, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-semibold text-foreground">{es.type}</span>
                      <span className="text-foreground-dim">{es.count} events ({es.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${es.high_energy ? 'bg-orange-500' : 'bg-primary'}`} 
                        style={{ width: `${es.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Barrier Degradation Analysis */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-surface-1 border border-border rounded-lg shadow-sm p-5 space-y-4">
            <h3 className="text-foreground-muted font-mono text-xs font-semibold uppercase tracking-wider">
              Barrier Degradation & Failure Breakdown
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Tracking EEI-SCL direct control and safety barrier health. Precursors accumulate when barrier defense layers become compromised.
            </p>
            <div className="space-y-3 pt-2">
              {barriers.map((b, i) => (
                <div key={i} className="p-3 bg-surface-2/60 border border-border rounded-lg flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-foreground">{b.name}</h4>
                    <span className="text-[10px] font-mono text-foreground-dim uppercase">
                      Status: <strong className="text-foreground">{b.status}</strong> · {b.count} reports
                    </span>
                  </div>
                  <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden shrink-0">
                    <div className={`h-full ${b.color}`} style={{ width: `${(b.count / maxBarrierCount) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-1 border border-border rounded-lg shadow-sm p-5">
            <h3 className="text-foreground-muted font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              The Three-Factor Strict AND Test
            </h3>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 font-mono leading-relaxed">
              HIGH_ENERGY (≥1500 J) <strong>AND</strong> PERSON_IN_DANGER_ZONE <strong>AND</strong> BARRIER_COMPROMISED = <strong>SIF PRECURSOR</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
