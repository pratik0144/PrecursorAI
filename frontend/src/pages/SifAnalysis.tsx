import React from 'react';
import { Shield, Zap, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import { SifFunnel } from '../components/domain/SifFunnel';
import { EnergyWheel } from '../components/domain/EnergyWheel';

export default function SifAnalysis() {
  const energySources = [
    { type: 'PRESSURE', count: 184, pct: 38, high_energy: true },
    { type: 'GRAVITY', count: 142, pct: 29, high_energy: true },
    { type: 'MOTION', count: 88, pct: 18, high_energy: true },
    { type: 'ELECTRICAL', count: 42, pct: 9, high_energy: true },
    { type: 'CHEMICAL', count: 28, pct: 6, high_energy: false }
  ];

  const barriers = [
    { name: 'Blowout Preventer (BOP) & Well Control', status: 'FAILED', count: 14, color: 'bg-red-500' },
    { name: 'Work Permit & Lock-Out Tag-Out (LOTO)', status: 'BYPASSED', count: 22, color: 'bg-orange-500' },
    { name: 'Secondary Containment Berms & Dikes', status: 'DEGRADED', count: 18, color: 'bg-amber-500' },
    { name: 'Mechanical Lifting Rigging & Sling Certification', status: 'DEGRADED', count: 12, color: 'bg-amber-500' },
    { name: 'Pressure Relief Valves & Rupture Discs', status: 'INTACT', count: 45, color: 'bg-emerald-500' },
  ];

  return (
    <div className="p-4 bg-background text-foreground space-y-5">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> SIF (Serious Injury & Fatality) Precursor Workspace
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Deep analytics on high-energy hazard exposure, barrier failure rates, and SCL classification distributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: SIF Funnel + Energy Wheel */}
        <div className="lg:col-span-6 space-y-4">
          <SifFunnel total={1240} highEnergy={450} sifPotential={180} escalated={42} />

          <div className="bg-surface-1 border border-border rounded-lg shadow-sm p-5">
            <h3 className="text-foreground-muted font-mono text-xs font-semibold uppercase tracking-wider mb-4">
              Energy Source Distribution (≥1,500 Joules Threshold)
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <EnergyWheel activeSegments={['PRESSURE', 'GRAVITY', 'MOTION']} />
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
                    <div className={`h-full ${b.color}`} style={{ width: `${(b.count / 45) * 100}%` }}></div>
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
