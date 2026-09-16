import React from 'react';

export const EnergyWheel = ({ activeSegments = [] }: { activeSegments?: string[] }) => (
  <div className="w-32 h-32 rounded-full border border-border flex flex-col items-center justify-center bg-surface-1 text-xs text-foreground-muted shadow-sm text-center p-2 mx-auto">
    <span className="font-mono mb-1 text-foreground">ENERGY</span>
    {activeSegments.length ? activeSegments.join(', ') : 'NONE'}
  </div>
);