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
        <div className={cn("p-4 rounded-md border", highEnergy ? "bg-green-900/50 border-green-500 text-green-400" : "bg-gray-800 border-gray-600 text-gray-500")}>
          ENERGY
        </div>
        <div className={cn("p-4 rounded-md border", personInDangerZone ? "bg-green-900/50 border-green-500 text-green-400" : "bg-gray-800 border-gray-600 text-gray-500")}>
          EXPOSURE
        </div>
        <div className={cn("p-4 rounded-md border", barrierCompromised ? "bg-green-900/50 border-green-500 text-green-400" : "bg-gray-800 border-gray-600 text-gray-500")}>
          BARRIER
        </div>
      </div>
      <div className="text-xl">↓</div>
      <div className={cn("p-4 text-xl font-bold rounded-lg", isSif ? "bg-red-900/50 border-red-500 text-red-500 border-2" : "bg-gray-800 border-gray-600 text-gray-500 border")}>
        {isSif ? "SIF PRECURSOR DETECTED" : "NO SIF PRECURSOR"}
      </div>
    </div>
  );
};
