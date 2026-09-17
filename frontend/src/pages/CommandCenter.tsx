import React from 'react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../components/domain/KpiCard';
import { SifFunnel } from '../components/domain/SifFunnel';
import { LiveTriageFeed } from '../components/domain/LiveTriageFeed';
import { AlertTicker } from '../components/domain/AlertTicker';
import { PatternCard } from '../components/domain/PatternCard';
import { HomeScreenMap } from '../components/domain/HomeScreenMap';
import { useDashboard } from '../hooks/use-dashboard';
import { useIncidentStore } from '../stores/incident-store';
import { useDatasetStore } from '../stores/dataset-store';
import { LayoutDashboard } from 'lucide-react';

// Default patterns & alerts for built-in demo
const DEMO_PATTERNS = [
  { id: 'PAT-01', type: 'COMPOUNDING', title: 'Compounding barrier degradation on Wellhead #44 (BOP + Bleed valve)', severity: 'CRITICAL', report_count: 5 },
  { id: 'PAT-02', type: 'EMERGING', title: 'Scaffolding latch failures across Assam drilling clusters', severity: 'HIGH', report_count: 8 },
  { id: 'PAT-03', type: 'RECURRING', title: 'Line-of-fire hazards during pipe stabbing operations', severity: 'HIGH', report_count: 12 }
];

const DEMO_ALERTS = [
  { id: 'ALT-101', title: 'High pressure buildup on Well #44 without secondary barrier active', severity: 'CRITICAL' },
  { id: 'ALT-102', title: 'Repeated bypass of LOTO permit during pump maintenance at GGS-2', severity: 'HIGH' }
];

export default function CommandCenter() {
  const { data: dashboardData } = useDashboard();
  const incidents = useIncidentStore((s) => s.incidents);
  const resolveIncident = useIncidentStore((s) => s.resolveIncident);
  const reopenIncident = useIncidentStore((s) => s.reopenIncident);
  const rawData = useDatasetStore((s) => s.rawData);

  // Use raw data patterns/alerts if a sample dataset is loaded, else demo defaults
  const patterns = rawData?.patterns || DEMO_PATTERNS;
  const alerts = rawData?.alerts || DEMO_ALERTS;

  // Convert reactive incident-store to feed format
  const liveReports = incidents.map(i => ({
    id: i.id,
    title: i.reportText,
    reportText: i.reportText,
    asset: i.asset,
    locationName: i.locationName,
    energySource: i.energySource,
    barrierStatus: i.barrierStatus,
    timestamp: i.timestamp,
    escalation: i.severity,
    status: i.status,
    resolvedAt: i.resolvedAt,
    isLiveWorkerReport: i.isLiveWorkerReport,
  }));

  const openCount = incidents.filter(i => i.status === 'OPEN').length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status === 'OPEN').length;

  const funnel = {
    total: incidents.length,
    highEnergy: incidents.filter(i => ['PRESSURE', 'GRAVITY', 'CHEMICAL', 'THERMAL', 'ELECTRICAL'].includes(i.energySource)).length,
    sifPotential: incidents.filter(i => (i.severity === 'CRITICAL' || i.severity === 'HIGH') && i.barrierStatus !== 'INTACT').length,
    escalated: criticalCount,
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground space-y-4">
      {/* Clean Minimalist Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" /> HSSE Operational Command Center
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Real-time SIF precursor detection, high-energy exposure tracking, and barrier verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-border rounded-lg shadow-2xs text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-foreground">3-Factor Engine Live</span>
            <span className="text-foreground-dim">·</span>
            <span className="text-foreground-dim">{incidents.length} Active Events</span>
          </div>
        </div>
      </div>
      
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard label="Total Reports" value={incidents.length} trend="up" />
        <KpiCard label="SIF-Potential Rate" value={`${incidents.length > 0 ? ((funnel.sifPotential / incidents.length) * 100).toFixed(1) : 0}%`} trend="down" />
        <KpiCard label="CRITICAL Escalations" value={criticalCount} trend="up" />
        <KpiCard label="Open Tickets" value={openCount} trend="flat" />
        <KpiCard label="Mean Time-to-Triage" value="12m" trend="down" />
        <KpiCard label="Barrier Failure Rate" value={`${incidents.length > 0 ? ((incidents.filter(i => i.barrierStatus !== 'INTACT').length / incidents.length) * 100).toFixed(1) : 0}%`} trend="up" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Funnel and Live Triage Feed */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <SifFunnel 
            total={funnel.total} 
            highEnergy={funnel.highEnergy} 
            sifPotential={funnel.sifPotential} 
            escalated={funnel.escalated} 
          />
          <LiveTriageFeed items={liveReports} onResolve={resolveIncident} onReopen={reopenIncident} />
        </div>

        {/* Right Column: Map + Patterns */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <HomeScreenMap />

          {/* Safety Patterns */}
          <div className="flex-1 bg-surface-1 border border-border rounded-lg shadow-sm p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-foreground-muted font-mono text-xs font-semibold uppercase tracking-wider">Top Safety Patterns</h3>
              <Link to="/patterns" className="text-xs text-primary font-medium hover:underline">View All</Link>
            </div>
            <div className="space-y-2.5">
              {patterns.slice(0, 5).map((p: any, i: number) => (
                <PatternCard key={p.id || i} pattern={p} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Alert Ticker */}
      <AlertTicker alerts={alerts} />
    </div>
  );
}