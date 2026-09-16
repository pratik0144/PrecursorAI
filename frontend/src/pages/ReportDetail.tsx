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

export default function ReportDetail() {
  return (
    <div className="p-4 bg-background text-foreground min-h-screen">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-4 font-mono">
          <span className="text-xl font-bold">REP-2026-0941</span>
          <EscalationBadge level="HIGH" />
          <SifClassificationBadge type="HSIF" />
        </div>
        <ConfidenceMeter score={0.85} />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="border border-gray-800 p-4">
          <h2 className="text-foreground-muted font-mono mb-4">RAW REPORT</h2>
          <p className="text-sm text-gray-300">Scaffolding near the flare stack collapsed while operators were working underneath. No injuries reported but high potential for fatal incident.</p>
        </div>
        <div className="border border-blue-200 p-4 bg-blue-50">
          <h2 className="text-blue-400 font-mono mb-4 text-xs">AI EXTRACTION — reasoning, not decision</h2>
          <EnergyWheel activeSegments={['GRAVITY', 'KINETIC']} />
          <div className="mt-4 flex flex-col space-y-2">
            <BarrierStatusPill status="FAILED" label="Scaffold Inspection" />
            <LsrChip rule="Working at Height" />
          </div>
        </div>
        <div className="border border-orange-200 p-4 bg-orange-50">
          <h2 className="text-orange-400 font-mono mb-4 text-xs">DETERMINISTIC ENGINE — this set the outcome</h2>
          <ThreeFactorGate highEnergy={true} personInDangerZone={true} barrierCompromised={true} />
          <div className="mt-6 flex flex-col space-y-4">
            <BarrierChainSwissCheese barriers={[{status: 'FAILED'}, {status: 'INTACT'}]} />
            <RiskScoreReceipt score={70} />
          </div>
        </div>
      </div>
    </div>
  );
}