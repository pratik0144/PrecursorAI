import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Box, ShieldAlert, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { BarrierStatusPill } from '../components/domain/BarrierStatusPill';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-4">
      <Link to="/assets" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Asset Registry
      </Link>

      <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 font-mono">
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold">CRITICAL ASSET FOCUS</span>
            <span className="text-xs text-foreground-dim">{id || 'AST-WH-44'}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Wellhead WH-44 (High Pressure Gas Producer)</h1>
          <p className="text-xs text-foreground-muted mt-0.5">Assam Field / Duliajan Exploration Block · Installed 2018</p>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="text-right">
            <div className="text-foreground-dim text-[11px]">BARRIER HEALTH</div>
            <div className="text-lg font-bold text-red-600">38%</div>
          </div>
          <div className="text-right border-l border-border pl-4">
            <div className="text-foreground-dim text-[11px]">PRECURSORS</div>
            <div className="text-lg font-bold text-foreground">5 events</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Barrier Health Scorecard */}
        <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm space-y-3">
          <h3 className="font-mono text-xs font-semibold uppercase text-foreground-muted tracking-wider">
            Barrier Health Scorecard
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-surface-2 rounded-md border border-border">
              <div>
                <div className="text-xs font-semibold text-foreground">Annular BOP Secondary Seal</div>
                <div className="text-[11px] text-foreground-dim font-mono">Hydraulic pressure drop recorded</div>
              </div>
              <BarrierStatusPill status="FAILED" />
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-2 rounded-md border border-border">
              <div>
                <div className="text-xs font-semibold text-foreground">Master Gate Valve Isolation</div>
                <div className="text-[11px] text-foreground-dim font-mono">Stiff operation under high differential</div>
              </div>
              <BarrierStatusPill status="DEGRADED" />
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-2 rounded-md border border-border">
              <div>
                <div className="text-xs font-semibold text-foreground">Surface Safety Valve (SSV) ESD</div>
                <div className="text-[11px] text-foreground-dim font-mono">Trip test passed 3 days ago</div>
              </div>
              <BarrierStatusPill status="INTACT" />
            </div>
          </div>
        </div>

        {/* Precursor Timeline */}
        <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm space-y-3">
          <h3 className="font-mono text-xs font-semibold uppercase text-foreground-muted tracking-wider">
            Compounding Precursor Sequence (Baghjan-type scenario)
          </h3>
          <div className="space-y-3 pl-2 border-l-2 border-primary/40 text-xs">
            <div className="relative pl-3">
              <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <div className="font-mono text-[11px] text-foreground-dim">Today, 08:30</div>
              <p className="font-semibold text-foreground">BOP stack secondary barrier depressurized during casing test</p>
              <Link to="/reports/REP-4091" className="text-primary hover:underline text-[11px] font-mono">View Report REP-4091 →</Link>
            </div>
            <div className="relative pl-3">
              <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <div className="font-mono text-[11px] text-foreground-dim">3 days ago</div>
              <p className="font-semibold text-foreground">Heavy lifting over wellhead without barrier isolation certificate</p>
              <Link to="/reports/REP-4089" className="text-primary hover:underline text-[11px] font-mono">View Report REP-4089 →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
