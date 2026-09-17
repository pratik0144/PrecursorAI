import React from 'react';
import { cn } from '@/lib/utils';

interface SifFunnelProps {
  total: number;
  highEnergy: number;
  sifPotential: number;
  escalated: number;
  className?: string;
}

export const SifFunnel: React.FC<SifFunnelProps> = ({ total, highEnergy, sifPotential, escalated, className }) => {
  return (
    <div className={cn("flex flex-col items-center space-y-2.5 font-mono p-4 bg-surface-1 border border-border rounded-lg shadow-sm", className)}>
      <div className="text-xs font-semibold text-foreground-dim tracking-wider uppercase mb-1">SIF Precursor Funnel</div>
      <div className="w-full bg-blue-50 border border-blue-200 p-2.5 rounded text-center text-blue-800 font-semibold shadow-xs">
        ALL REPORTS: {total}
      </div>
      <div className="w-4/5 bg-teal-50 border border-teal-200 p-2.5 rounded text-center text-teal-800 font-semibold shadow-xs">
        HIGH ENERGY: {highEnergy} ({total > 0 ? Math.round((highEnergy / total) * 100) : 0}%)
      </div>
      <div className="w-3/5 bg-amber-50 border border-amber-200 p-2.5 rounded text-center text-amber-800 font-semibold shadow-xs">
        SIF POTENTIAL: {sifPotential} ({highEnergy > 0 ? Math.round((sifPotential / highEnergy) * 100) : 0}%)
      </div>
      <div className="w-2/5 bg-red-50 border border-red-300 p-2.5 rounded text-center text-red-800 font-semibold shadow-xs">
        ESCALATED: {escalated}
      </div>
    </div>
  );
};
