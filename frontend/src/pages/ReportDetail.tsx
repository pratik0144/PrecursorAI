import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { EscalationBadge } from '../components/domain/EscalationBadge';
import { ConfidenceMeter } from '../components/domain/ConfidenceMeter';
import { EnergyWheel } from '../components/domain/EnergyWheel';
import { BarrierStatusPill } from '../components/domain/BarrierStatusPill';
import { ThreeFactorGate } from '../components/domain/ThreeFactorGate';
import { RiskScoreReceipt } from '../components/domain/RiskScoreReceipt';
import { BarrierChainSwissCheese } from '../components/domain/BarrierChainSwissCheese';
import { ArrowLeft, ShieldAlert, ArrowRight, CheckCircle2, RotateCcw, AlertOctagon, FileCheck, Clock, UserCheck } from 'lucide-react';
import { useIncidentStore } from '../stores/incident-store';
import { getIncidentNextSteps } from '@/lib/incident-actions';

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const incidents = useIncidentStore((s) => s.incidents);
  const resolveIncident = useIncidentStore((s) => s.resolveIncident);
  const reopenIncident = useIncidentStore((s) => s.reopenIncident);
  const found = incidents.find((i) => i.id === id);

  const reportId = found?.id || id || 'REP-4091';
  const severity = found?.severity || 'HIGH';
  const reportText = found?.reportText || 'Scaffolding plank near the flare stack knock-out drum collapsed while operators were working underneath during line charging. High pressure hydrocarbon gas present in adjacent 6-inch flowline.';
  const asset = found?.asset || 'Wellhead WH-04 / Flare System';
  const location = found?.locationName || 'Assam / Duliajan Field';
  const energySource = found?.energySource || 'PRESSURE';
  const barrierStatus = found?.barrierStatus || 'FAILED';
  const isResolved = found?.status === 'RESOLVED';
  const isSif = severity === 'CRITICAL' || severity === 'HIGH';

  const riskScore = severity === 'CRITICAL' ? 92 : severity === 'HIGH' ? 74 : severity === 'REVIEW' ? 45 : 20;

  const guidance = getIncidentNextSteps({
    reportText,
    severity,
    energySource,
    barrierStatus,
    asset,
  });

  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/triage" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Triage Queue
        </Link>
        <div className="flex items-center gap-2">
          {isResolved ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED {found?.resolvedAt ? `at ${found.resolvedAt}` : ''}
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded text-xs font-mono font-bold">
              STATUS: OPEN FOR ACTION
            </span>
          )}
        </div>
      </div>

      {/* Top Summary Bar */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-surface-1 border border-border rounded-lg shadow-sm gap-3">
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <span className="text-xl font-bold text-foreground">{reportId}</span>
          <EscalationBadge level={severity} />
          {isSif ? (
            <span className="px-2 py-0.5 text-xs font-bold font-mono bg-red-100 text-red-700 border border-red-200 rounded">
              SIF PRECURSOR ({severity === 'CRITICAL' ? 'HSIF' : 'PSIF'})
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-bold font-mono bg-teal-100 text-teal-700 border border-teal-200 rounded">
              LOW ENERGY SIF EXCLUDED
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-foreground-dim font-mono">AI Model Confidence:</span>
          <ConfidenceMeter score={severity === 'CRITICAL' ? 0.94 : 0.85} />
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
            "{reportText}"
          </div>
          <div className="space-y-2 text-xs font-mono text-foreground-muted border-t border-border pt-3">
            <div><strong className="text-foreground">Asset:</strong> {asset}</div>
            <div><strong className="text-foreground">Location:</strong> {location}</div>
            <div><strong className="text-foreground">Reported By:</strong> {found?.isLiveWorkerReport ? 'Field Worker (Direct Mobile Entry)' : 'Shift Safety Observation Log'}</div>
            <div><strong className="text-foreground">Report Type:</strong> {found?.reportType || 'NEAR_MISS'}</div>
          </div>
        </div>

        {/* Column 2: AI Extraction */}
        <div className="border border-blue-200 bg-blue-50/60 p-5 rounded-lg shadow-sm">
          <h2 className="text-blue-800 font-mono text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>2. AI Extraction</span>
            <span className="text-[10px] font-normal text-blue-600">Reasoning, not decision</span>
          </h2>
          <EnergyWheel activeSegments={[energySource]} />
          <div className="mt-4 space-y-2.5">
            <div className="text-xs text-blue-900 font-sans leading-snug">
              <strong>Extracted Hazard:</strong> {reportText.slice(0, 85)}...
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-800">Barrier:</span>
              <BarrierStatusPill status={barrierStatus} />
            </div>
            <div className="p-2.5 bg-white/80 border border-blue-200 rounded text-xs text-blue-950 font-sans">
              <strong>Primary Energy Source:</strong> {energySource}
            </div>
          </div>
        </div>

        {/* Column 3: Deterministic Decision */}
        <div className="border border-orange-200 bg-orange-50/60 p-5 rounded-lg shadow-sm">
          <h2 className="text-orange-800 font-mono text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>3. Deterministic Decision</span>
            <span className="text-[10px] font-normal text-orange-600">Strict Rule Output</span>
          </h2>
          <ThreeFactorGate 
            highEnergy={energySource !== 'LOW_ENERGY'} 
            personInDangerZone={isSif} 
            barrierCompromised={barrierStatus !== 'INTACT'} 
          />
          <div className="mt-5 space-y-3.5">
            <BarrierChainSwissCheese barriers={[{ status: barrierStatus as any }, { status: 'INTACT' }]} />
            <RiskScoreReceipt score={riskScore} />
          </div>
        </div>
      </div>

      {/* Section 4: Mandatory Next Steps & Containment Action Plan */}
      <div className="bg-surface-1 border border-border rounded-lg shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">
                4. Mandatory Next Steps & Containment Action Plan
              </h2>
              <p className="text-xs text-foreground-muted">
                Action directives automatically generated from high-energy exposure classification & barrier failure status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-surface-2 border border-border text-foreground-dim flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              SLA Window: <strong>{guidance.timeframe}</strong>
            </span>
            <span className={`px-2.5 py-1 rounded font-bold border ${
              guidance.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
              guidance.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {guidance.priority} DIRECTIVE
            </span>
          </div>
        </div>

        {/* Immediate Step Box */}
        <div className="p-4 bg-red-50/70 border border-red-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-900 uppercase">
            <ArrowRight className="w-4 h-4 text-red-600" />
            Immediate Containment Step:
          </div>
          <p className="text-sm font-semibold text-red-950 leading-relaxed font-sans">
            {guidance.immediateStep}
          </p>
        </div>

        {/* Action Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-surface-2 rounded-lg border border-border space-y-1">
            <div className="text-foreground-dim uppercase flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-primary" /> Safety Protocol:
            </div>
            <div className="text-foreground font-semibold">{guidance.protocol}</div>
          </div>

          <div className="p-3 bg-surface-2 rounded-lg border border-border space-y-1">
            <div className="text-foreground-dim uppercase flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-primary" /> Assigned Ownership:
            </div>
            <div className="text-foreground font-semibold">{guidance.role}</div>
          </div>

          <div className="p-3 bg-surface-2 rounded-lg border border-border space-y-1">
            <div className="text-foreground-dim uppercase flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-red-500" /> Barrier Integrity Status:
            </div>
            <div className="text-foreground font-semibold uppercase">{barrierStatus} ({energySource} Energy)</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
          <div className="text-xs text-foreground-dim font-mono">
            {isResolved ? 'Incident marked resolved. Corrective barrier verification completed.' : 'Action required before incident ticket can be closed.'}
          </div>

          <div className="flex items-center gap-2">
            {!isResolved ? (
              <button
                onClick={() => found && resolveIncident(found.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Next Steps Complete & Solve
              </button>
            ) : (
              <button
                onClick={() => found && reopenIncident(found.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-surface-2 hover:bg-surface-3 text-foreground-muted border border-border transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Reopen Incident Action
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}