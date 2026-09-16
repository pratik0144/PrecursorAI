import React from 'react';
import { cn } from '@/lib/utils';

type EscalationLevel = 'ROUTINE' | 'REVIEW' | 'HIGH' | 'CRITICAL';

interface EscalationBadgeProps {
  level: EscalationLevel;
  className?: string;
}

const colorMap: Record<EscalationLevel, string> = {
  ROUTINE: 'bg-teal-950 text-teal-400 border-teal-500/50',
  REVIEW: 'bg-amber-950 text-amber-400 border-amber-500/50',
  HIGH: 'bg-orange-950 text-orange-400 border-orange-500/50',
  CRITICAL: 'bg-red-950 text-red-400 border-red-500/50',
};

export const EscalationBadge: React.FC<EscalationBadgeProps> = ({ level, className }) => {
  return (
    <span className={cn("px-2 py-1 text-xs font-mono font-bold border rounded-md inline-flex items-center", colorMap[level], className)}>
      {level}
    </span>
  );
};
