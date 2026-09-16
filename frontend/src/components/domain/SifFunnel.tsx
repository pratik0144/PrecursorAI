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
    <div className={cn("flex flex-col items-center space-y-2 font-mono", className)}>
      <div className="w-full bg-blue-900/30 border border-blue-500/50 p-2 text-center text-blue-400">
        ALL REPORTS: {total}
      </div>
      <div className="w-4/5 bg-teal-900/30 border border-teal-500/50 p-2 text-center text-teal-400">
        HIGH ENERGY: {highEnergy}
      </div>
      <div className="w-3/5 bg-orange-900/30 border border-orange-500/50 p-2 text-center text-orange-400">
        SIF POTENTIAL: {sifPotential}
      </div>
      <div className="w-2/5 bg-red-900/30 border border-red-500/50 p-2 text-center text-red-400">
        ESCALATED: {escalated}
      </div>
    </div>
  );
};
