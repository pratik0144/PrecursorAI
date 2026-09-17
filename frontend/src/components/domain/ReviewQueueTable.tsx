import React from 'react';
import { Link } from 'react-router-dom';
import { EscalationBadge } from './EscalationBadge';
import { BarrierStatusPill } from './BarrierStatusPill';
import { Eye, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportRow {
  id: string;
  report_text: string;
  escalation: 'CRITICAL' | 'HIGH' | 'REVIEW' | 'ROUTINE';
  sif_classification: string;
  energy_source: string;
  barrier_status: string;
  location: string;
  asset: string;
  created_at: string;
}

export const ReviewQueueTable = ({ className }: { className?: string }) => {
  const sampleReports: ReportRow[] = [
    {
      id: 'REP-4091',
      report_text: 'Workover rig #12: Annular preventer pressure loss during casing test with drill string suspended',
      escalation: 'CRITICAL',
      sif_classification: 'HSIF',
      energy_source: 'PRESSURE',
      barrier_status: 'FAILED',
      location: 'Assam / Duliajan',
      asset: 'Workover Rig #12',
      created_at: '12m ago'
    },
    {
      id: 'REP-4089',
      report_text: 'Heavy mechanical lift near active high-pressure flowline without certified rigger or spotter',
      escalation: 'HIGH',
      sif_classification: 'PSIF',
      energy_source: 'GRAVITY',
      barrier_status: 'MISSING',
      location: 'Assam / Well #44',
      asset: 'Wellhead WH-44',
      created_at: '45m ago'
    },
    {
      id: 'REP-4082',
      report_text: 'Contractor personnel observed in line-of-fire beneath kelly bushing while rotary was engaged',
      escalation: 'HIGH',
      sif_classification: 'PSIF',
      energy_source: 'MOTION',
      barrier_status: 'BYPASSED',
      location: 'Rajasthan / Barmer',
      asset: 'Drilling Rig DR-03',
      created_at: '2h ago'
    },
    {
      id: 'REP-4076',
      report_text: 'Minor drip leak from flare knockout drum flange; secondary containment berm verified intact',
      escalation: 'REVIEW',
      sif_classification: 'LOW_ENERGY',
      energy_source: 'CHEMICAL',
      barrier_status: 'INTACT',
      location: 'Gujarat / Mehsana',
      asset: 'GGS Plant 01',
      created_at: '5h ago'
    },
    {
      id: 'REP-4065',
      report_text: 'Routine safety walk observation: Hearing protection dispenser refilled in compressor house',
      escalation: 'ROUTINE',
      sif_classification: 'LOW_ENERGY',
      energy_source: 'SOUND',
      barrier_status: 'INTACT',
      location: 'Offshore KG-Basin',
      asset: 'Platform Alpha',
      created_at: '1d ago'
    }
  ];

  return (
    <div className={cn("bg-surface-1 border border-border rounded-lg shadow-sm overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-foreground-dim uppercase font-mono tracking-wider">
              <th className="p-3.5 font-semibold">Incident ID</th>
              <th className="p-3.5 font-semibold">Escalation</th>
              <th className="p-3.5 font-semibold">Observation Narrative</th>
              <th className="p-3.5 font-semibold">Energy Source</th>
              <th className="p-3.5 font-semibold">Barrier Status</th>
              <th className="p-3.5 font-semibold">Asset / Location</th>
              <th className="p-3.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sampleReports.map((row) => (
              <tr key={row.id} className="hover:bg-surface-2/60 transition-colors group">
                <td className="p-3.5 font-mono font-bold text-foreground">
                  <Link to={`/reports/${row.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                    {row.id}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </Link>
                </td>
                <td className="p-3.5">
                  <EscalationBadge level={row.escalation} />
                </td>
                <td className="p-3.5 max-w-xs md:max-w-md font-sans text-foreground">
                  <p className="line-clamp-2 leading-relaxed">{row.report_text}</p>
                </td>
                <td className="p-3.5 font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[10px]">
                    {row.energy_source}
                  </span>
                </td>
                <td className="p-3.5">
                  <BarrierStatusPill status={row.barrier_status} />
                </td>
                <td className="p-3.5 font-sans">
                  <div className="font-semibold text-foreground text-[11px]">{row.asset}</div>
                  <div className="text-[10px] text-foreground-dim">{row.location}</div>
                </td>
                <td className="p-3.5 text-right">
                  <Link 
                    to={`/reports/${row.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-2 border border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary rounded text-xs font-semibold font-mono transition-all text-foreground-muted"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-surface-2/50 border-t border-border flex items-center justify-between text-xs text-foreground-dim font-mono">
        <span>Showing 5 of 42 actionable incidents</span>
        <span>Page 1 of 9</span>
      </div>
    </div>
  );
};
