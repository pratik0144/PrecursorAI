import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { EscalationBadge } from '../components/domain/EscalationBadge';

export default function Alerts() {
  const alerts = [
    {
      id: 'ALT-801',
      title: 'Loss of Secondary Well Control Barrier — Wellhead #44',
      message: 'BOP annular preventer pressure drops below safe threshold while active hydrocarbon flow detected.',
      severity: 'CRITICAL',
      source: 'PATTERN (COMPOUNDING)',
      sla_due: '18 mins remaining',
      status: 'OPEN',
      created_at: '12m ago',
      asset: 'Wellhead WH-44 (Assam)'
    },
    {
      id: 'ALT-802',
      title: 'Repeated Work Authorisation Bypass during Hot Work',
      message: 'Welding activity initiated on flare gas knockout line without cold/hot work permit isolation sign-off.',
      severity: 'HIGH',
      source: 'REPORT (NEAR_MISS)',
      sla_due: '1h 45m remaining',
      status: 'ACKNOWLEDGED',
      created_at: '45m ago',
      asset: 'GGS Plant 02 (Duliajan)'
    },
    {
      id: 'ALT-803',
      title: 'Line of Fire Violation on Drilling Floor',
      message: 'Third instance in 48 hours of personnel positioned directly in swing radius of iron roughneck.',
      severity: 'HIGH',
      source: 'PATTERN (RECURRING)',
      sla_due: '3h 10m remaining',
      status: 'IN_REVIEW',
      created_at: '2h ago',
      asset: 'Rig #03 (Barmer, Rajasthan)'
    }
  ];

  return (
    <div className="p-4 bg-background text-foreground space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" /> Operational Safety Alert Center
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Active early warnings, SLA-tracked escalations, and barrier failure response workflows.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-mono font-bold">
            1 CRITICAL
          </span>
          <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-md text-xs font-mono font-bold">
            2 HIGH
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="p-4 bg-surface-1 border border-border rounded-lg shadow-sm hover:border-primary/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-foreground">{a.id}</span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${a.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                  {a.severity}
                </span>
                <span className="text-[10px] font-mono text-foreground-dim uppercase bg-surface-2 px-2 py-0.5 rounded border border-border">
                  {a.source}
                </span>
                <span className="text-xs font-mono text-foreground-dim flex items-center gap-1">
                  <Clock className="w-3 h-3 text-red-500" /> SLA: <strong>{a.sla_due}</strong>
                </span>
              </div>
              <h3 className="font-semibold text-foreground text-sm">{a.title}</h3>
              <p className="text-xs text-foreground-muted leading-relaxed max-w-3xl">{a.message}</p>
              <div className="text-[11px] text-foreground-dim font-mono">
                Asset: <strong className="text-foreground">{a.asset}</strong> · Logged {a.created_at}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-md text-xs font-semibold text-foreground transition-colors">
                Acknowledge
              </button>
              <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors shadow-xs">
                Escalate SIF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
