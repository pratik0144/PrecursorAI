import React from 'react';
import { Link } from 'react-router-dom';
import { EscalationBadge } from './EscalationBadge';
import { BarrierStatusPill } from './BarrierStatusPill';
import { Eye, ArrowUpRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIncidentStore } from '../../stores/incident-store';
import { useDatasetStore, DATASETS } from '../../stores/dataset-store';
import { getIncidentNextSteps } from '@/lib/incident-actions';

interface ReviewQueueTableProps {
  filter?: string;
  searchTerm?: string;
  className?: string;
}

export const ReviewQueueTable: React.FC<ReviewQueueTableProps> = ({ 
  filter = 'ALL', 
  searchTerm = '', 
  className 
}) => {
  const incidents = useIncidentStore((s) => s.incidents);
  const resolveIncident = useIncidentStore((s) => s.resolveIncident);
  const reopenIncident = useIncidentStore((s) => s.reopenIncident);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesFilter = filter === 'ALL' ? true : inc.severity === filter;
    if (!matchesFilter) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      inc.id.toLowerCase().includes(term) ||
      inc.reportText.toLowerCase().includes(term) ||
      inc.asset.toLowerCase().includes(term) ||
      inc.locationName.toLowerCase().includes(term) ||
      inc.energySource.toLowerCase().includes(term) ||
      inc.barrierStatus.toLowerCase().includes(term)
    );
  });

  return (
    <div className={cn("bg-surface-1 border border-border rounded-lg shadow-sm overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-foreground-dim uppercase font-mono tracking-wider">
              <th className="p-3.5 font-semibold">Incident ID</th>
              <th className="p-3.5 font-semibold">Status</th>
              <th className="p-3.5 font-semibold">Escalation</th>
              <th className="p-3.5 font-semibold">Observation Narrative</th>
              <th className="p-3.5 font-semibold">Energy Source</th>
              <th className="p-3.5 font-semibold">Barrier Status</th>
              <th className="p-3.5 font-semibold">Asset / Location</th>
              <th className="p-3.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-foreground-muted font-mono text-xs">
                  No incidents found matching the filter "{filter}"{searchTerm ? ` and keyword "${searchTerm}"` : ''}.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((row) => {
                const guidance = getIncidentNextSteps({
                  reportText: row.reportText,
                  severity: row.severity,
                  energySource: row.energySource,
                  barrierStatus: row.barrierStatus,
                  asset: row.asset,
                });

                return (
                <tr key={row.id} className={cn("hover:bg-surface-2/60 transition-colors group", row.status === 'RESOLVED' && "opacity-75 bg-emerald-50/20")}>
                  <td className="p-3.5 font-mono font-bold text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Link 
                        to={`/reports/${row.id}`} 
                        className="hover:text-primary hover:underline transition-colors flex items-center gap-1 font-mono"
                        title="View Full Risk Extraction Report"
                      >
                        <span>{row.id}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </Link>
                      {row.isLiveWorkerReport && (
                        <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 text-[9px] font-mono font-bold">
                          LIVE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 font-mono whitespace-nowrap">
                    {row.status === 'RESOLVED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                        ✓ SOLVED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
                        ● OPEN
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <EscalationBadge level={row.severity} />
                  </td>
                  <td className="p-3.5 max-w-xs md:max-w-md font-sans text-foreground">
                    <p className={cn("line-clamp-2 leading-relaxed", row.status === 'RESOLVED' && "line-through text-foreground-muted")}>
                      {row.reportText}
                    </p>
                    {row.status !== 'RESOLVED' && (
                      <div className="mt-2 flex flex-col gap-0.5 text-[11px] font-sans bg-surface-2 p-2 rounded-md border border-border/80 text-foreground">
                        <div className="flex items-center justify-between font-mono text-[10px] font-bold text-primary">
                          <span>NEXT STEP TO TAKE:</span>
                          <span className="text-foreground-dim font-normal">{guidance.timeframe}</span>
                        </div>
                        <p className="text-foreground leading-snug font-medium">
                          {guidance.immediateStep}
                        </p>
                        <div className="text-[10px] text-foreground-dim font-mono pt-0.5">
                          {guidance.protocol} · {guidance.role}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 font-mono whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[10px]">
                      {row.energySource}
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <BarrierStatusPill status={row.barrierStatus} />
                  </td>
                  <td className="p-3.5 font-sans">
                    <div className="font-semibold text-foreground text-[11px] whitespace-nowrap">{row.asset}</div>
                    <div className="text-[10px] text-foreground-dim whitespace-nowrap">{row.locationName}</div>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link 
                        to={`/reports/${row.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-foreground-muted hover:text-foreground border border-border rounded text-[11px] font-semibold font-mono transition-all"
                        title="View Report Details"
                      >
                        <Eye className="w-3 h-3" /> Review
                      </Link>

                      {row.status === 'OPEN' ? (
                        <button
                          onClick={() => resolveIncident(row.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold font-mono transition-all shadow-xs cursor-pointer"
                          title="Mark Solved"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Solve
                        </button>
                      ) : (
                        <button
                          onClick={() => reopenIncident(row.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-surface-2 hover:bg-surface-3 text-foreground-muted border border-border rounded text-[11px] font-semibold font-mono transition-all cursor-pointer"
                          title="Reopen Incident"
                        >
                          <RotateCcw className="w-3 h-3" /> Reopen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-surface-2/50 border-t border-border flex items-center justify-between text-xs text-foreground-dim font-mono">
        <div className="flex items-center gap-2">
          <span>Source: <strong className="text-foreground">{activeMeta?.label || 'Built-in Demo'}</strong> ({activeMeta?.tag})</span>
          <span>·</span>
          <span>Showing {filteredIncidents.length} of {incidents.length} actionable incidents</span>
        </div>
        <span>{incidents.filter(i => i.status === 'OPEN').length} Open · {incidents.filter(i => i.status === 'RESOLVED').length} Resolved</span>
      </div>
    </div>
  );
};
