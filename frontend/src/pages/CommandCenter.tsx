import React from 'react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../components/domain/KpiCard';
import { SifFunnel } from '../components/domain/SifFunnel';
import { LiveTriageFeed } from '../components/domain/LiveTriageFeed';
import { AlertTicker } from '../components/domain/AlertTicker';
import { PatternCard } from '../components/domain/PatternCard';
import { DemoDataMarker } from '../components/domain/DemoDataMarker';
import { HomeScreenMap } from '../components/domain/HomeScreenMap';
import { useDashboard } from '../hooks/use-dashboard';
import { useIncidentStore } from '../stores/incident-store';
import { HardHat, Users, ArrowRight } from 'lucide-react';

export default function CommandCenter() {
  const { data: dashboardData } = useDashboard();
  const incidents = useIncidentStore((s) => s.incidents);
  const resolveIncident = useIncidentStore((s) => s.resolveIncident);
  const reopenIncident = useIncidentStore((s) => s.reopenIncident);

  // Convert reactive incident-store to feed format so worker submissions show up instantly
  const liveReports = incidents.map(i => ({
    id: i.id,
    title: `${i.asset}: ${i.reportText.length > 90 ? i.reportText.slice(0, 90) + '...' : i.reportText}`,
    escalation: i.severity,
    status: i.status,
    resolvedAt: i.resolvedAt,
  }));

  const data: any = dashboardData || {
    kpis: { 
      total_reports: 1240 + (incidents.length - 5), 
      sif_rate: 14.5, 
      escalations: 42, 
      open_alerts: 8, 
      mttt: 12, 
      barrier_failure_rate: 28.4 
    },
    funnel: { 
      total: 1240 + (incidents.length - 5), 
      highEnergy: 450 + (incidents.length - 5), 
      sifPotential: 180 + (incidents.length - 5), 
      escalated: 42 
    },
    patterns: [
      { id: 'PAT-01', type: 'COMPOUNDING', title: 'Compounding barrier degradation on Wellhead #44 (BOP + Bleed valve)', severity: 'CRITICAL', report_count: 5 },
      { id: 'PAT-02', type: 'EMERGING', title: 'Scaffolding latch failures across Assam drilling clusters', severity: 'HIGH', report_count: 8 },
      { id: 'PAT-03', type: 'RECURRING', title: 'Line-of-fire hazards during pipe stabbing operations', severity: 'HIGH', report_count: 12 }
    ],
    alerts: [
      { id: 'ALT-101', title: 'High pressure buildup on Well #44 without secondary barrier active', severity: 'CRITICAL' },
      { id: 'ALT-102', title: 'Repeated bypass of LOTO permit during pump maintenance at GGS-2', severity: 'HIGH' }
    ]
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground space-y-4">
      {/* Top Banner with Role Switch Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <DemoDataMarker className="flex-1" />
        <Link 
          to="/worker"
          className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
        >
          <HardHat className="w-4 h-4 text-orange-600" />
          <span>Worker Reporting Portal</span>
          <ArrowRight className="w-3 h-3 text-orange-600" />
        </Link>
      </div>
      
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard label="Total Reports" value={data.kpis?.total_reports || 1240} trend="up" />
        <KpiCard label="SIF-Potential Rate" value={`${data.kpis?.sif_rate || 14.5}%`} trend="down" />
        <KpiCard label="CRITICAL Escalations" value={data.kpis?.escalations || 42} trend="up" />
        <KpiCard label="Open Tickets" value={incidents.filter(i => i.status === 'OPEN').length} trend="flat" />
        <KpiCard label="Mean Time-to-Triage" value={`${data.kpis?.mttt || 12}m`} trend="down" />
        <KpiCard label="Barrier Failure Rate" value={`${data.kpis?.barrier_failure_rate || 28.4}%`} trend="up" />
      </div>

      {/* Main Grid: Funnel + Feed on Left, Interactive Satellite Map & Patterns on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Funnel and Live Triage Feed */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <SifFunnel 
            total={data.funnel?.total || 1240} 
            highEnergy={data.funnel?.highEnergy || 450} 
            sifPotential={data.funnel?.sifPotential || 180} 
            escalated={data.funnel?.escalated || 42} 
          />
          <LiveTriageFeed items={liveReports} onResolve={resolveIncident} onReopen={reopenIncident} />
        </div>

        {/* Right Column: Embedded Satellite Map + Top Safety Patterns */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Live Satellite Map with Location Selector & Worker Hotspots */}
          <HomeScreenMap />

          {/* Top Emerging Patterns */}
          <div className="flex-1 bg-surface-1 border border-border rounded-lg shadow-sm p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-foreground-muted font-mono text-xs font-semibold uppercase tracking-wider">Top Safety Patterns</h3>
              <Link to="/patterns" className="text-xs text-primary font-medium hover:underline">View All</Link>
            </div>
            <div className="space-y-2.5">
              {data.patterns.map((p: any, i: number) => (
                <PatternCard key={p.id || i} pattern={p} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Alert Ticker */}
      <AlertTicker alerts={data.alerts} />
    </div>
  );
}