import React from 'react';
import { KpiCard } from '../components/domain/KpiCard';
import { SifFunnel } from '../components/domain/SifFunnel';
import { LiveTriageFeed } from '../components/domain/LiveTriageFeed';
import { AlertTicker } from '../components/domain/AlertTicker';
import { PatternCard } from '../components/domain/PatternCard';
import { DemoDataMarker } from '../components/domain/DemoDataMarker';

export default function CommandCenter() {
  const data = {
    kpis: { total_reports: 1240, sif_rate: 15, escalations: 42, open_alerts: 8, mttt: 12, barrier_failure_rate: 28 },
    funnel: { total: 1240, highEnergy: 450, sifPotential: 180, escalated: 42 },
    recent_reports: [],
    patterns: [{id: 1, type: 'EMERGING', title: 'Scaffold Collapse', severity: 'HIGH'}],
    alerts: []
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-4 space-y-4">
      <DemoDataMarker />
      <div className="grid grid-cols-6 gap-4">
        <KpiCard label="Total Reports" value={data.kpis.total_reports} />
        <KpiCard label="SIF-Potential Rate" value={data.kpis.sif_rate + '%'} />
        <KpiCard label="Escalations" value={data.kpis.escalations} />
        <KpiCard label="Open Alerts" value={data.kpis.open_alerts} />
        <KpiCard label="Mean Time-to-Triage" value={data.kpis.mttt + 'm'} />
        <KpiCard label="Barrier-Failure Rate" value={data.kpis.barrier_failure_rate + '%'} />
      </div>
      <div className="flex space-x-4 h-[600px]">
        <div className="flex-1 space-y-4">
          <SifFunnel total={data.funnel.total} highEnergy={data.funnel.highEnergy} sifPotential={data.funnel.sifPotential} escalated={data.funnel.escalated} />
          <LiveTriageFeed items={data.recent_reports} />
        </div>
        <div className="w-[400px] space-y-4 flex flex-col">
          <div className="h-64 bg-gray-900 border border-gray-800 flex items-center justify-center">[Mini-Globe Preview - links to /globe]</div>
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-gray-400 mb-2 font-mono">Top Emerging Patterns</h3>
            {data.patterns.map(p => <PatternCard key={p.id} pattern={p} />)}
          </div>
        </div>
      </div>
      <AlertTicker alerts={data.alerts} />
    </div>
  );
}