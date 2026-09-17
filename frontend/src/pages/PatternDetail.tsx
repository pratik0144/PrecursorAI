import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Network, ShieldAlert, CheckCircle2, Clock, FileText } from 'lucide-react';
import { EscalationBadge } from '../components/domain/EscalationBadge';

export default function PatternDetail() {
  const { id } = useParams<{ id: string }>();

  const contributingReports = [
    { id: 'REP-4091', date: 'Today, 08:30', asset: 'Wellhead WH-44', summary: 'Annular preventer pressure loss during casing test', escalation: 'CRITICAL' },
    { id: 'REP-4089', date: 'Sep 14, 14:15', asset: 'Wellhead WH-44', summary: 'Heavy lifting over wellhead without secondary barrier active', escalation: 'HIGH' },
    { id: 'REP-4050', date: 'Sep 10, 11:20', asset: 'Wellhead WH-44', summary: 'Bleed-off valve seat passing test pressure slightly', escalation: 'HIGH' },
    { id: 'REP-4012', date: 'Sep 02, 16:40', asset: 'Wellhead WH-44', summary: 'Master gate valve required excessive torque to seal off', escalation: 'REVIEW' }
  ];

  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-4">
      <Link to="/patterns" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Pattern Intelligence
      </Link>

      <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono">
            <span className="text-xs px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded font-bold">
              COMPOUNDING BARRIER FAILURE
            </span>
            <span className="text-xs text-foreground-dim">{id || 'PAT-01'}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Compounding Barrier Degradation on Wellhead WH-44 (BOP + Bleed Valve)
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Discovered by Tier-2 semantic clustering + multi-report AI reasoning cross-checked with deterministic threshold rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-mono font-bold">
            PRIORITY: CRITICAL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Cluster Narrative */}
        <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-lg shadow-sm space-y-3">
          <h3 className="font-mono text-xs font-semibold uppercase text-blue-900 tracking-wider flex items-center justify-between">
            <span>AI Cluster Reasoning (Synthesized)</span>
            <span className="text-[10px] text-blue-600 font-normal">Audited Trace</span>
          </h3>
          <p className="text-xs text-blue-950 font-sans leading-relaxed">
            "Over the past 14 days, four distinct safety reports were submitted for Wellhead WH-44 detailing sequential compromises to primary and secondary barrier elements. Individually, each report appeared as an isolated observation or mechanical delay. Cumulatively, they indicate that well control capacity is severely compromised while high-pressure reservoir flow is maintained. This matches the critical signature precursor sequence seen in severe blowouts (such as the 2020 Baghjan incident)."
          </p>
        </div>

        {/* Deterministic Verification Receipt */}
        <div className="p-5 bg-orange-50/70 border border-orange-200 rounded-lg shadow-sm space-y-3">
          <h3 className="font-mono text-xs font-semibold uppercase text-orange-900 tracking-wider">
            Deterministic Rule Cross-Check
          </h3>
          <div className="space-y-2 text-xs font-mono text-orange-950">
            <div className="flex justify-between p-2 bg-white/70 rounded border border-orange-200">
              <span>Cluster Size Check:</span>
              <strong>4 reports on same Asset ID (threshold ≥ 3) ✓</strong>
            </div>
            <div className="flex justify-between p-2 bg-white/70 rounded border border-orange-200">
              <span>Time Window:</span>
              <strong>14 days (threshold ≤ 30 days) ✓</strong>
            </div>
            <div className="flex justify-between p-2 bg-white/70 rounded border border-orange-200">
              <span>Compounding Barriers:</span>
              <strong>BOP + Valve + Lifting (multiple layers) ✓</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Contributing Reports Table */}
      <div className="bg-surface-1 border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-mono font-semibold uppercase text-foreground-muted tracking-wider">
            Contributing Reports (Traceability Chain)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-2 text-foreground-dim uppercase font-mono border-b border-border">
                <th className="p-3">Report ID</th>
                <th className="p-3">Logged</th>
                <th className="p-3">Narrative Summary</th>
                <th className="p-3">Escalation</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-sans">
              {contributingReports.map(r => (
                <tr key={r.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-foreground">{r.id}</td>
                  <td className="p-3 text-foreground-dim font-mono">{r.date}</td>
                  <td className="p-3 font-medium text-foreground">{r.summary}</td>
                  <td className="p-3">
                    <EscalationBadge level={r.escalation as any} />
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/reports/${r.id}`} className="text-xs text-primary font-mono font-semibold hover:underline">
                      View Report →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
