import React from 'react';
import { EscalationBadge } from '../components/domain/EscalationBadge';
import { SifClassificationBadge } from '../components/domain/SifClassificationBadge';
import { ConfidenceMeter } from '../components/domain/ConfidenceMeter';
import { EnergyWheel } from '../components/domain/EnergyWheel';
import { BarrierStatusPill } from '../components/domain/BarrierStatusPill';
import { LsrChip } from '../components/domain/LsrChip';
import { ThreeFactorGate } from '../components/domain/ThreeFactorGate';
import { RiskScoreReceipt } from '../components/domain/RiskScoreReceipt';
import { BarrierChainSwissCheese } from '../components/domain/BarrierChainSwissCheese';
import { OisdReferenceCard } from '../components/domain/OisdReferenceCard';
import { AuditTimeline } from '../components/domain/AuditTimeline';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportDetail() {
  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-4">
      <Link to="/triage" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Triage Queue
      </Link>

      {/* Top Summary Bar */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-surface-1 border border-border rounded-lg shadow-sm">
        <div className="flex items-center space-x-3 font-mono">
          <span className="text-xl font-bold text-foreground">REP-2026-0941</span>
          <EscalationBadge level="HIGH" />
          <span className="px-2 py-0.5 text-xs font-bold font-mono bg-red-100 text-red-700 border border-red-200 rounded">
            SIF PRECURSOR (PSIF)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-foreground-dim font-mono">AI Model Confidence:</span>
          <ConfidenceMeter score={0.85} />
        </div>
      </div>

      {/* Three Column Explainability Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Raw Report */}
        <div className="border border-border bg-surface-1 p-5 rounded-lg shadow-sm">
          <h2 className="text-foreground-dim font-mono text-xs font-semibold uppercase tracking-wider mb-3">
            1. Raw Field Report
          </h2>
          <div className="p-3.5 bg-surface-2 border border-border/70 rounded-md text-sm text-foreground leading-relaxed font-sans mb-4">
            "Scaffolding plank near the flare stack knock-out drum collapsed while operators were working underneath during line charging. High pressure hydrocarbon gas present in adjacent 6-inch flowline. No personnel injuries reported, but potential for serious strike or release was high."
          </div>
          <div className="space-y-2 text-xs font-mono text-foreground-muted border-t border-border pt-3">
            <div><strong className="text-foreground">Asset:</strong> Wellhead WH-04 / Flare System</div>
            <div><strong className="text-foreground">Location:</strong> Assam / Duliajan Field</div>
            <div><strong className="text-foreground">Reported By:</strong> Shift Supervisor (Mechanical)</div>
            <div><strong className="text-foreground">Report Type:</strong> NEAR_MISS / HIPO</div>
          </div>
        </div>

        {/* Column 2: AI Extraction */}
        <div className="border border-blue-200 bg-blue-50/60 p-5 rounded-lg shadow-sm">
          <h2 className="text-blue-800 font-mono text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>2. AI Extraction</span>
            <span className="text-[10px] font-normal text-blue-600">Reasoning, not decision</span>
          </h2>
          <EnergyWheel activeSegments={['GRAVITY', 'PRESSURE']} />
          <div className="mt-4 space-y-2.5">
            <div className="text-xs text-blue-900 font-sans leading-snug">
              <strong>Extracted Hazard:</strong> Suspended structural weight loss & high-pressure gas proximity.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-800">Barrier:</span>
              <BarrierStatusPill status="FAILED" />
            </div>
            <div className="p-2.5 bg-white/80 border border-blue-200 rounded text-xs text-blue-950 font-sans">
              <strong>IOGP Rule:</strong> Working at Height / Line of Fire
            </div>
          </div>
        </div>

        {/* Column 3: Deterministic Decision */}
        <div className="border border-orange-200 bg-orange-50/60 p-5 rounded-lg shadow-sm">
          <h2 className="text-orange-800 font-mono text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>3. Deterministic Decision</span>
            <span className="text-[10px] font-normal text-orange-600">Strict Rule Output</span>
          </h2>
          <ThreeFactorGate highEnergy={true} personInDangerZone={true} barrierCompromised={true} />
          <div className="mt-5 space-y-3.5">
            <BarrierChainSwissCheese barriers={[{status: 'FAILED'}, {status: 'INTACT'}]} />
            <RiskScoreReceipt score={70} />
          </div>
        </div>
      </div>
    </div>
  );
}