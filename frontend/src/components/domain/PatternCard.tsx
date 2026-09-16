import React from 'react';

export const PatternCard = ({ pattern }: { pattern: any }) => (
  <div className="border border-border bg-surface-1 p-4 rounded text-sm text-foreground hover:border-primary/50 shadow-sm transition-colors cursor-pointer">
    <div className="flex justify-between items-start mb-3">
      <span className="px-2 py-0.5 bg-surface-2 text-[10px] font-mono border border-border rounded text-foreground-muted">{pattern?.type}</span>
      <span className="text-[10px] font-mono font-bold text-orange-400">{pattern?.severity}</span>
    </div>
    <h4 className="font-bold text-foreground mb-2">{pattern?.title || 'Unknown Pattern'}</h4>
    <div className="flex justify-between items-center text-xs text-foreground-muted mt-4 font-mono">
      <span>12 INCIDENTS</span>
      <span>TREND: ↗</span>
    </div>
  </div>
);