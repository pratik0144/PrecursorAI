import React from 'react';
import { cn } from '@/lib/utils';

interface ThreeFactorGateProps {
  highEnergy: boolean;
  personInDangerZone: boolean;
  barrierCompromised: boolean;
  className?: string;
}

export const ThreeFactorGate: React.FC<ThreeFactorGateProps> = ({
  highEnergy,
  personInDangerZone,
  barrierCompromised,
  className
}) => {
  const isSif = highEnergy && personInDangerZone && barrierCompromised;

  return (
    <div className={cn("flex flex-col items-center space-y-4 font-mono", className)}>
      <div className="flex space-x-4">
        <div className={cn("p-4 rounded-md border", highEnergy ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "bg-surface-2 border-border text-foreground-dim")}>
          ENERGY
        </div>
        <div className={cn("p-4 rounded-md border", personInDangerZone ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "bg-surface-2 border-border text-foreground-dim")}>
          EXPOSURE
        </div>
        <div className={cn("p-4 rounded-md border", barrierCompromised ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "bg-surface-2 border-border text-foreground-dim")}>
          BARRIER
        </div>
      </div>
      <div className="text-xl">↓</div>
      <div className={cn("p-4 text-xl font-bold rounded-lg", isSif ? "bg-red-100 border-red-500 text-red-700 border-2" : "bg-surface-2 border-border text-foreground-dim border")}>
        {isSif ? "SIF PRECURSOR DETECTED" : "NO SIF PRECURSOR"}
      </div>
    </div>
  );
};
