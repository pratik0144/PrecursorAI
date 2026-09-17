import React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

export const DemoDataMarker = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs font-medium",
      className
    )}>
      <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
      <span><strong>DEMO / SYNTHETIC DATA</strong> — All metrics, incident counts, and operational figures shown are synthetic demonstrations for testing purposes.</span>
    </div>
  );
};
