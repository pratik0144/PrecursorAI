import React from 'react';
import { EscalationBadge } from './EscalationBadge';

export const LiveTriageFeed = ({ items = [] }: { items?: any[] }) => (
  <div className="border border-border rounded bg-surface-1 shadow-sm p-4 overflow-y-auto flex-1">
    <h3 className="text-foreground-muted font-mono mb-4 text-sm">LIVE TRIAGE FEED</h3>
    <div className="space-y-3">
      {items.length === 0 ? <div className="text-gray-600 text-sm italic">Waiting for reports...</div> : items.map((item, i) => (
        <div key={i} className="p-3 border border-border rounded flex flex-col space-y-2 bg-surface-1 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-400">{item.id || 'NEW'}</span>
            <EscalationBadge level="REVIEW" />
          </div>
          <p className="text-sm text-gray-300">{item.title || 'Report content snippet...'}</p>
        </div>
      ))}
    </div>
  </div>
);