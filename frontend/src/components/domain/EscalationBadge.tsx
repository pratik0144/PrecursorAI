import React from 'react';
import { cn } from '@/lib/utils';

type EscalationLevel = 'ROUTINE' | 'REVIEW' | 'HIGH' | 'CRITICAL';

interface EscalationBadgeProps {
  level: EscalationLevel;
  className?: string;
}

const colorMap: Record<EscalationLevel, string> = {
  ROUTINE: 'bg-teal-50 text-teal-700 border-teal-300',
  REVIEW: 'bg-amber-50 text-amber-700 border-amber-300',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-300',
  CRITICAL: 'bg-red-50 text-red-700 border-red-400',
};

export const EscalationBadge: React.FC<EscalationBadgeProps> = ({ level, className }) => {
  return (
    <span className={cn("px-2 py-1 text-xs font-mono font-bold border rounded-md inline-flex items-center", colorMap[level], className)}>
      {level}
    </span>
  );
};
