import React, { useState } from 'react';
import { EscalationBadge } from './EscalationBadge';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface FeedItem {
  id: string;
  title: string;
  escalation: string;
  status: 'OPEN' | 'RESOLVED';
  resolvedAt?: string;
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
    <div className="border border-border rounded-lg bg-surface-1 shadow-sm p-4 overflow-y-auto flex-1">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-foreground-muted font-mono text-xs font-semibold uppercase tracking-wider">LIVE TRIAGE FEED</h3>
          <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-3 p-0.5 bg-surface-2 rounded-lg border border-border">
        <button
          onClick={() => setTab('OPEN')}
          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
            tab === 'OPEN'
              ? 'bg-white text-foreground shadow-sm border border-border'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          Open ({openItems.length})
        </button>
        <button
          onClick={() => setTab('RESOLVED')}
          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
            tab === 'RESOLVED'
              ? 'bg-white text-foreground shadow-sm border border-border'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          Resolved ({resolvedItems.length})
        </button>
      </div>

      {/* Feed Items */}
      <div className="space-y-2.5">
        {displayItems.length === 0 ? (
          <div className="text-foreground-dim text-sm italic py-8 text-center bg-surface-2 rounded border border-border/50">
            {tab === 'OPEN' ? 'No open tickets — all clear!' : 'No resolved tickets yet.'}
          </div>
        ) : (
          displayItems.map((item, i) => (
            <div
              key={item.id || i}
              className={`p-3 border rounded-md flex flex-col space-y-2 transition-colors ${
                item.status === 'RESOLVED'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-surface-1 border-border hover:bg-surface-2'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-foreground-dim font-medium">
                  {item.id || `REP-${1000 + i}`}
                </span>
                <div className="flex items-center gap-2">
                  {item.status === 'RESOLVED' && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                      ✓ SOLVED
                    </span>
                  )}
                  <EscalationBadge level={(item.escalation || 'REVIEW') as 'ROUTINE' | 'REVIEW' | 'HIGH' | 'CRITICAL'} />
                </div>
              </div>

              <p className={`text-sm font-medium ${
                item.status === 'RESOLVED' ? 'text-foreground-muted line-through' : 'text-foreground'
              }`}>
                {item.title || 'Report observation logged...'}
              </p>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1">
                {item.status === 'RESOLVED' && item.resolvedAt && (
                  <span className="text-[10px] font-mono text-emerald-600">
                    Resolved at {item.resolvedAt}
                  </span>
                )}
                {item.status === 'OPEN' && <span />}

                {item.status === 'OPEN' && onResolve ? (
                  <button
                    onClick={() => onResolve(item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark Solved
                  </button>
                ) : item.status === 'RESOLVED' && onReopen ? (
                  <button
                    onClick={() => onReopen(item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-surface-2 hover:bg-surface-3 text-foreground-muted border border-border transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reopen
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};