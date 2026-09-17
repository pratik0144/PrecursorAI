import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EscalationBadge } from './EscalationBadge';
import { BarrierStatusPill } from './BarrierStatusPill';
import { CheckCircle2, RotateCcw, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FeedItem {
  id: string;
  title: string;
  reportText?: string;
  asset?: string;
  locationName?: string;
  energySource?: string;
  barrierStatus?: string;
  escalation: string;
  status: 'OPEN' | 'RESOLVED';
  resolvedAt?: string;
  timestamp?: string;
  isLiveWorkerReport?: boolean;
}

interface LiveTriageFeedProps {
  items?: FeedItem[];
  onResolve?: (id: string) => void;
  onReopen?: (id: string) => void;
}

export const LiveTriageFeed = ({ items = [], onResolve, onReopen }: LiveTriageFeedProps) => {
  const [tab, setTab] = useState<'OPEN' | 'RESOLVED'>('OPEN');

  const openItems = items.filter((i) => i.status === 'OPEN');
  const resolvedItems = items.filter((i) => i.status === 'RESOLVED');
  const displayItems = tab === 'OPEN' ? openItems : resolvedItems;

  return (
    <div className="border border-border rounded-lg bg-surface-1 shadow-sm flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-1">
        <div className="flex items-center gap-2.5">
          <h3 className="text-foreground font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
            LIVE TRIAGE FEED
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-0.5 bg-surface-2 rounded-md border border-border text-xs font-mono">
          <button
            onClick={() => setTab('OPEN')}
            className={cn(
              "px-3 py-1 rounded transition-colors font-medium",
              tab === 'OPEN'
                ? "bg-white text-foreground shadow-2xs font-bold"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            Open ({openItems.length})
          </button>
          <button
            onClick={() => setTab('RESOLVED')}
            className={cn(
              "px-3 py-1 rounded transition-colors font-medium",
              tab === 'RESOLVED'
                ? "bg-white text-foreground shadow-2xs font-bold"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            Resolved ({resolvedItems.length})
          </button>
        </div>
      </div>

      {/* Feed Items */}
      <div className="p-3 space-y-2.5 overflow-y-auto max-h-[580px]">
        {displayItems.length === 0 ? (
          <div className="text-foreground-dim text-xs font-mono py-10 text-center bg-surface-2/40 rounded-md border border-dashed border-border">
            {tab === 'OPEN' ? 'No open tickets — all clear!' : 'No resolved tickets yet.'}
          </div>
        ) : (
          displayItems.map((item, i) => {
            const isResolved = item.status === 'RESOLVED';
            const displayText = item.reportText || item.title || 'Observation logged...';

            return (
              <div
                key={item.id || i}
                className={cn(
                  "p-3 border rounded-lg flex flex-col space-y-2 transition-colors",
                  isResolved
                    ? "bg-emerald-50/30 border-emerald-200"
                    : "bg-surface-1 border-border hover:bg-surface-2/50"
                )}
              >
                {/* Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">
                      {item.id || `REP-${1000 + i}`}
                    </span>
                    <EscalationBadge level={(item.escalation || 'REVIEW') as any} />
                    {item.energySource && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono font-semibold">
                        {item.energySource}
                      </span>
                    )}
                    {item.barrierStatus && (
                      <BarrierStatusPill status={item.barrierStatus} />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-foreground-dim">
                    {item.asset && (
                      <span className="font-medium text-foreground-muted">{item.asset}</span>
                    )}
                    {item.timestamp && <span>· {item.timestamp}</span>}
                  </div>
                </div>

                {/* Report Observation Text */}
                <p className={cn(
                  "text-sm font-medium leading-relaxed font-sans",
                  isResolved ? "text-foreground-muted line-through" : "text-foreground"
                )}>
                  {displayText}
                </p>

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                  <Link
                    to={`/reports/${item.id}`}
                    className="inline-flex items-center gap-1 font-mono text-primary font-semibold hover:underline"
                  >
                    <span>View Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    {isResolved && item.resolvedAt && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                        ✓ Solved at {item.resolvedAt}
                      </span>
                    )}

                    {!isResolved && onResolve ? (
                      <button
                        onClick={() => onResolve(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Mark Solved
                      </button>
                    ) : isResolved && onReopen ? (
                      <button
                        onClick={() => onReopen(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-surface-2 hover:bg-surface-3 text-foreground-muted border border-border transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Reopen
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};